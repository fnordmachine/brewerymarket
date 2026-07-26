import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Order {
  @Prop({ required: true, unique: true, index: true }) id: string;
  @Prop({ required: true, index: true }) orderStatus: string;
  @Prop({ required: true, index: true }) deliveryStatus: string;
  @Prop({ required: true, unique: true, index: true }) orderNumber: string;
  @Prop({ required: true }) deliveryNumber: string;
  @Prop({ required: true, type: Date, index: true }) orderDate: Date;
  @Prop({ required: true, min: 0 }) totalAmount: number;
  @Prop({ required: true, min: 0 }) freightAmount: number;
  @Prop({ required: true, index: true }) channel: string;
  @Prop({ required: true }) soldAndDeliveredBy: string;
  @Prop({ required: true, type: Object }) customer: Record<string, unknown>;
  @Prop({ required: true, type: Object }) payment: Record<string, unknown>;
  @Prop({ required: true, type: Object }) discounts: Record<string, unknown>;
  @Prop({ required: true, type: Object }) delivery: Record<string, unknown>;
  @Prop({ required: true, type: Object }) seller: Record<string, unknown>;
  @Prop({ required: true, type: [Object], default: [] }) items: Array<Record<string, unknown>>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
