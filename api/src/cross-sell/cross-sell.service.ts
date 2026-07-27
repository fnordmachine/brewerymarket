import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CROSS_SELL_CATALOG, CatalogProduct } from './cross-sell.catalog';
import { calculateProductPrice } from './cross-sell-pricing';
import {
  CreateCrossSellRuleDto, CrossSellPreviewDto, ImportCrossSellRulesDto, UpdateCrossSellRuleDto,
} from './dto/cross-sell-rule.dto';
import {
  CrossSellDiscountScope, CrossSellDiscountType, CrossSellRule, CrossSellRuleDocument,
  CrossSellTargetType,
} from './schemas/cross-sell-rule.schema';

@Injectable()
export class CrossSellService {
  constructor(@InjectModel(CrossSellRule.name) private readonly model: Model<CrossSellRuleDocument>) {}

  create(dto: CreateCrossSellRuleDto) {
    this.validate(dto);
    return this.model.create(dto);
  }

  findAll() {
    return this.model.find().sort({ updatedAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const rule = await this.model.findById(id).lean().exec();
    if (!rule) throw new NotFoundException('Regra de cross-sell não encontrada');
    return rule;
  }

  async update(id: string, dto: UpdateCrossSellRuleDto) {
    this.validate(dto);
    const rule = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!rule) throw new NotFoundException('Regra de cross-sell não encontrada');
    return rule;
  }

  async remove(id: string) {
    const rule = await this.model.findByIdAndDelete(id).exec();
    if (!rule) throw new NotFoundException('Regra de cross-sell não encontrada');
  }

  async import(dto: ImportCrossSellRulesDto) {
    dto.rules.forEach((rule) => this.validate(rule));
    const operations = dto.rules.map((rule) => ({
      updateOne: {
        filter: { code: rule.code },
        update: { $set: { ...rule, startsAt: new Date(rule.startsAt), endsAt: new Date(rule.endsAt) } },
        upsert: true,
      },
    }));
    const result = await this.model.bulkWrite(operations);
    return { received: dto.rules.length, created: result.upsertedCount, updated: result.modifiedCount };
  }

  getCatalog() {
    return CROSS_SELL_CATALOG;
  }

  async preview(dto: CrossSellPreviewDto) {
    const at = dto.at ? new Date(dto.at) : new Date();
    const cartProducts = this.resolveProducts(dto.productIds);
    const rules = await this.model.find({ active: true, startsAt: { $lte: at }, endsAt: { $gte: at } }).lean().exec();
    return rules.filter((rule) => this.matches(rule, cartProducts)).map((rule) => {
      const suggested = this.resolveProducts(rule.suggestedProductIds).filter((product) => !dto.productIds.includes(product.id));
      const combinationIds = new Set([...dto.productIds, ...suggested.map((product) => product.id)]);
      const price = (product: CatalogProduct, receivesDiscount: boolean) => calculateProductPrice(product, {
        type: receivesDiscount ? rule.discountType : CrossSellDiscountType.NONE,
        value: receivesDiscount ? rule.discountValue : 0,
        paymentDiscountPercent: dto.paymentDiscountPercent,
      });
      return {
        ruleId: String(rule._id), code: rule.code, promotionalText: rule.promotionalText,
        discountScope: rule.discountScope,
        suggestedProducts: suggested.map((product, lineIndex) => ({
          ...product, lineIndex, pricing: price(product, true), cartMetadata: {
            crosssell_rule_id: String(rule._id), crosssell: true, crosssell_line_index: lineIndex,
            crosssell_discount: price(product, true).crossSellDiscount,
          },
        })),
        combination: CROSS_SELL_CATALOG.filter((product) => combinationIds.has(product.id)).map((product) => ({
          productId: product.id,
          price: price(product, rule.discountScope === CrossSellDiscountScope.COMBINATION || rule.suggestedProductIds.includes(product.id)),
        })),
      };
    }).filter((combo) => combo.suggestedProducts.length > 0);
  }

  private resolveProducts(ids: string[]) {
    return ids.map((id) => CROSS_SELL_CATALOG.find((product) => product.id === id)).filter((product): product is CatalogProduct => Boolean(product));
  }

  private matches(rule: Pick<CrossSellRule, 'triggers'>, products: CatalogProduct[]) {
    return rule.triggers.some((trigger) => products.some((product) => {
      if (trigger.type === CrossSellTargetType.PRODUCT) return product.id === trigger.referenceId;
      if (trigger.type === CrossSellTargetType.CATEGORY) return product.categoryIds.includes(trigger.referenceId);
      return product.collectionIds.includes(trigger.referenceId);
    }));
  }

  private validate(dto: CreateCrossSellRuleDto | UpdateCrossSellRuleDto) {
    if (new Date(dto.endsAt) < new Date(dto.startsAt)) throw new BadRequestException('O fim da vigência deve ser posterior ao início');
    if (dto.discountType === CrossSellDiscountType.NONE && dto.discountValue !== 0) throw new BadRequestException('Regras sem desconto devem ter valor zero');
    if (dto.discountType === CrossSellDiscountType.PERCENTAGE && dto.discountValue > 100) throw new BadRequestException('O desconto percentual não pode superar 100%');
    const unknown = dto.suggestedProductIds.filter((id) => !CROSS_SELL_CATALOG.some((product) => product.id === id));
    if (unknown.length) throw new BadRequestException(`Produtos sugeridos inexistentes: ${unknown.join(', ')}`);
  }
}
