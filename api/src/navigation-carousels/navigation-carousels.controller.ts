import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateNavigationCarouselDto, ReorderItemsDto, UpdateNavigationCarouselDto } from './dto/navigation-carousel.dto';
import { NavigationCarouselsService } from './navigation-carousels.service';

@Controller()
export class NavigationCarouselsController {
  constructor(private readonly service: NavigationCarouselsService) {}

  @Post('navigation-carousels') create(@Body() dto: CreateNavigationCarouselDto) {
    return this.service.create(dto);
  }
  @Get('navigation-carousels') findAll() {
    return this.service.findAll();
  }
  @Get('navigation-carousels/:id') findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Get('public/navigation-carousels/:slug') findPublished(@Param('slug') slug: string): Promise<unknown> {
    return this.service.findPublished(slug);
  }
  @Patch('navigation-carousels/:id') update(@Param('id') id: string, @Body() dto: UpdateNavigationCarouselDto) {
    return this.service.update(id, dto);
  }
  @Patch('navigation-carousels/:id/reorder') reorder(@Param('id') id: string, @Body() dto: ReorderItemsDto) {
    return this.service.reorder(id, dto);
  }
  @Delete('navigation-carousels/:id') @HttpCode(204) remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
