import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NavigationCarouselsController } from './navigation-carousels.controller';
import { NavigationCarouselsService } from './navigation-carousels.service';
import { NavigationCarousel, NavigationCarouselSchema } from './schemas/navigation-carousel.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: NavigationCarousel.name, schema: NavigationCarouselSchema }])],
  controllers: [NavigationCarouselsController],
  providers: [NavigationCarouselsService],
})
export class NavigationCarouselsModule {}
