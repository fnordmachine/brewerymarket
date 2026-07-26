import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get() findAll() {
    return this.service.findAll();
  }

  @Post('import') import(@Body() orders: Order[]) {
    return this.service.import(orders);
  }
}
