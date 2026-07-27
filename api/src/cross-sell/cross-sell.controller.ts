import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CrossSellService } from './cross-sell.service';
import { CreateCrossSellRuleDto, CrossSellPreviewDto, ImportCrossSellRulesDto, UpdateCrossSellRuleDto } from './dto/cross-sell-rule.dto';

@Controller()
export class CrossSellController {
  constructor(private readonly service: CrossSellService) {}

  @Post('cross-sell-rules') create(@Body() dto: CreateCrossSellRuleDto) { return this.service.create(dto); }
  @Get('cross-sell-rules') findAll() { return this.service.findAll(); }
  @Get('cross-sell-rules/:id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch('cross-sell-rules/:id') update(@Param('id') id: string, @Body() dto: UpdateCrossSellRuleDto) { return this.service.update(id, dto); }
  @Delete('cross-sell-rules/:id') @HttpCode(204) remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post('cross-sell-rules/import') import(@Body() dto: ImportCrossSellRulesDto) { return this.service.import(dto); }
  @Get('public/products') products() { return this.service.getCatalog(); }
  @Post('public/cross-sell/preview') preview(@Body() dto: CrossSellPreviewDto) { return this.service.preview(dto); }
}

