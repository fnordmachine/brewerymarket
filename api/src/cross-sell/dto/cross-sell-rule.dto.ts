import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional,
  IsString, Matches, Max, Min, MinLength, ValidateNested,
} from 'class-validator';
import {
  CrossSellDiscountScope, CrossSellDiscountType, CrossSellTargetType,
} from '../schemas/cross-sell-rule.schema';

export class CrossSellTriggerDto {
  @IsEnum(CrossSellTargetType) type: CrossSellTargetType;
  @IsString() @MinLength(1) referenceId: string;
  @IsString() @MinLength(1) label: string;
}

export class CreateCrossSellRuleDto {
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/) code: string;
  @IsString() @MinLength(2) internalName: string;
  @IsBoolean() active: boolean;
  @IsDateString() startsAt: string;
  @IsDateString() endsAt: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CrossSellTriggerDto)
  triggers: CrossSellTriggerDto[];
  @IsArray() @ArrayMinSize(1) @IsString({ each: true }) suggestedProductIds: string[];
  @IsString() @MinLength(1) promotionalText: string;
  @IsEnum(CrossSellDiscountType) discountType: CrossSellDiscountType;
  @IsNumber() @Min(0) discountValue: number;
  @IsEnum(CrossSellDiscountScope) discountScope: CrossSellDiscountScope;
}

export class UpdateCrossSellRuleDto extends CreateCrossSellRuleDto {}

export class ImportCrossSellRulesDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateCrossSellRuleDto)
  rules: CreateCrossSellRuleDto[];
}

export class CrossSellPreviewDto {
  @IsArray() @ArrayMinSize(1) @IsString({ each: true }) productIds: string[];
  @IsOptional() @IsDateString() at?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) paymentDiscountPercent = 0;
}

