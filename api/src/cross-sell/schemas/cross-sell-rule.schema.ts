import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CrossSellRuleDocument = HydratedDocument<CrossSellRule>;

export enum CrossSellTargetType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  COLLECTION = 'collection',
}

export enum CrossSellDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  NONE = 'none',
}

export enum CrossSellDiscountScope {
  SUGGESTED = 'suggested',
  COMBINATION = 'combination',
}

@Schema({ _id: false })
export class CrossSellTrigger {
  @Prop({ required: true, enum: CrossSellTargetType }) type: CrossSellTargetType;
  @Prop({ required: true, trim: true }) referenceId: string;
  @Prop({ required: true, trim: true }) label: string;
}

const CrossSellTriggerSchema = SchemaFactory.createForClass(CrossSellTrigger);

@Schema({ timestamps: true, versionKey: false })
export class CrossSellRule {
  @Prop({ required: true, unique: true, index: true, trim: true }) code: string;
  @Prop({ required: true, trim: true }) internalName: string;
  @Prop({ default: true, index: true }) active: boolean;
  @Prop({ required: true, index: true }) startsAt: Date;
  @Prop({ required: true, index: true }) endsAt: Date;
  @Prop({ type: [CrossSellTriggerSchema], required: true }) triggers: CrossSellTrigger[];
  @Prop({ type: [String], required: true }) suggestedProductIds: string[];
  @Prop({ required: true, trim: true }) promotionalText: string;
  @Prop({ required: true, enum: CrossSellDiscountType }) discountType: CrossSellDiscountType;
  @Prop({ required: true, min: 0, default: 0 }) discountValue: number;
  @Prop({ required: true, enum: CrossSellDiscountScope }) discountScope: CrossSellDiscountScope;
}

export const CrossSellRuleSchema = SchemaFactory.createForClass(CrossSellRule);

