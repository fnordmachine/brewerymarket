import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NavigationCarouselsModule } from './navigation-carousels/navigation-carousels.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthController } from './health.controller';
import { OrdersModule } from './orders/orders.module';
import { CrossSellModule } from './cross-sell/cross-sell.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/marketbreja'),
      }),
    }),
    NavigationCarouselsModule,
    OrdersModule,
    CrossSellModule,
    UploadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
