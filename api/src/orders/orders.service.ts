import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private readonly model: Model<OrderDocument>) {}

  findAll() {
    return this.model.find().sort({ orderDate: -1 }).lean().exec();
  }

  async import(orders: Order[]) {
    if (!orders.length) return [];
    await this.model.bulkWrite(orders.map((order) => ({
      updateOne: { filter: { id: order.id }, update: { $set: order }, upsert: true },
    })));
    return this.model.find({ id: { $in: orders.map((order) => order.id) } }).sort({ orderDate: -1 }).lean().exec();
  }
}
