import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrossSellController } from './cross-sell.controller';
import { CrossSellService } from './cross-sell.service';
import { CrossSellRule, CrossSellRuleSchema } from './schemas/cross-sell-rule.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CrossSellRule.name, schema: CrossSellRuleSchema }])],
  controllers: [CrossSellController],
  providers: [CrossSellService],
})
export class CrossSellModule {}

