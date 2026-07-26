import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNavigationCarouselDto, ReorderItemsDto, UpdateNavigationCarouselDto } from './dto/navigation-carousel.dto';
import { NavigationCarousel, NavigationCarouselDocument } from './schemas/navigation-carousel.schema';

@Injectable()
export class NavigationCarouselsService {
  constructor(
    @InjectModel(NavigationCarousel.name)
    private readonly model: Model<NavigationCarouselDocument>,
  ) {}

  create(dto: CreateNavigationCarouselDto) {
    return this.model.create(this.normalizeItems(dto));
  }

  findAll() {
    return this.model.find().sort({ updatedAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const carousel = await this.model.findById(id).lean().exec();
    if (!carousel) throw new NotFoundException('Carrossel não encontrado');
    return carousel;
  }

  async findPublished(slug: string): Promise<unknown> {
    const carousel = await this.model
      .findOne({ slug, active: true })
      .select('-internalName')
      .lean()
      .exec();
    if (!carousel) throw new NotFoundException('Carrossel publicado não encontrado');
    return { ...carousel, items: carousel.items.filter((item) => item.active).sort((a, b) => a.order - b.order) };
  }

  async update(id: string, dto: UpdateNavigationCarouselDto) {
    const carousel = await this.model
      .findByIdAndUpdate(id, this.normalizeItems(dto), { new: true, runValidators: true })
      .lean()
      .exec();
    if (!carousel) throw new NotFoundException('Carrossel não encontrado');
    return carousel;
  }

  async reorder(id: string, dto: ReorderItemsDto) {
    const carousel = await this.model.findById(id).exec();
    if (!carousel) throw new NotFoundException('Carrossel não encontrado');
    const positions = new Map(dto.itemIds.map((itemId, index) => [itemId, index]));
    carousel.items.forEach((item, index) => {
      item.order = positions.get(item.id) ?? dto.itemIds.length + index;
    });
    carousel.items.sort((a, b) => a.order - b.order);
    return carousel.save();
  }

  async remove(id: string) {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Carrossel não encontrado');
  }

  private normalizeItems(dto: CreateNavigationCarouselDto | UpdateNavigationCarouselDto) {
    return { ...dto, items: dto.items.map((item, order) => ({ ...item, order })) };
  }
}
