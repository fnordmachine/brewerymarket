import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DestinationType } from '../schemas/navigation-carousel.schema';

class DestinationDto {
  @IsEnum(DestinationType) type: DestinationType;
  @IsString() @MinLength(1) value: string;
  @IsOptional() @IsString() label?: string;
  @IsBoolean() openInNewTab: boolean;
}

class ImageDto {
  @IsIn(['icon', 'upload']) source: 'icon' | 'upload';
  @IsString() @MinLength(1) value: string;
  @IsOptional() @IsString() alt?: string;
}

class ItemDto {
  @IsString() id: string;
  @IsString() @MinLength(1) name: string;
  @ValidateNested() @Type(() => ImageDto) image: ImageDto;
  @ValidateNested() @Type(() => DestinationDto) destination: DestinationDto;
  @IsBoolean() active: boolean;
  @IsInt() @Min(0) order: number;
}

class StyleDto {
  @Matches(/^#[0-9a-f]{6}$/i) backgroundColor: string;
  @Matches(/^#[0-9a-f]{6}$/i) textColor: string;
  @Matches(/^#[0-9a-f]{6}$/i) borderColor: string;
  @IsInt() @Min(0) @Max(12) borderWidth: number;
  @IsInt() @Min(0) @Max(100) borderRadius: number;
  @IsIn(['none', 'soft', 'medium', 'strong']) shadow: string;
  @IsIn(['none', 'lift', 'glow', 'border']) hoverEffect: string;
  @IsNumber() @Min(1) @Max(1.2) hoverScale: number;
}

class ResponsiveDto {
  @IsInt() @Min(1) @Max(12) desktopItems: number;
  @IsInt() @Min(1) @Max(6) mobileItems: number;
  @IsInt() @Min(0) @Max(80) gap: number;
  @IsIn(['circle', 'square', 'rectangle']) itemShape: string;
  @IsIn(['always', 'never', 'hover']) desktopArrows: string;
  @IsBoolean() mobileScroll: boolean;
  @IsBoolean() mobileSnap: boolean;
}

export class CreateNavigationCarouselDto {
  @IsString() @MinLength(2) internalName: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug: string;
  @IsString() @MinLength(1) title: string;
  @IsBoolean() showTitle: boolean;
  @IsBoolean() active: boolean;
  @Matches(/^#[0-9a-f]{6}$/i) sectionBackground: string;
  @ValidateNested() @Type(() => StyleDto) style: StyleDto;
  @ValidateNested() @Type(() => ResponsiveDto) responsive: ResponsiveDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto) items: ItemDto[];
}

export class UpdateNavigationCarouselDto extends CreateNavigationCarouselDto {}

export class ReorderItemsDto {
  @IsArray() @IsString({ each: true }) itemIds: string[];
}
