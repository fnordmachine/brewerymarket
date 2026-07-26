import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NavigationCarouselDocument = HydratedDocument<NavigationCarousel>;

export enum DestinationType {
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory',
  COLLECTION = 'collection',
  BRAND = 'brand',
  DEPARTMENT = 'department',
  PRODUCT = 'product',
  INSTITUTIONAL = 'institutional',
  CUSTOM_PAGE = 'custom_page',
  SEARCH = 'search',
  EXTERNAL_URL = 'external_url',
}

@Schema({ _id: false })
export class NavigationDestination {
  @Prop({ required: true, enum: DestinationType }) type: DestinationType;
  @Prop({ required: true }) value: string;
  @Prop() label?: string;
  @Prop({ default: false }) openInNewTab: boolean;
}

const NavigationDestinationSchema = SchemaFactory.createForClass(NavigationDestination);

@Schema({ _id: false })
export class NavigationImage {
  @Prop({ enum: ['icon', 'upload'], required: true }) source: 'icon' | 'upload';
  @Prop({ required: true }) value: string;
  @Prop() alt?: string;
}

const NavigationImageSchema = SchemaFactory.createForClass(NavigationImage);

@Schema({ _id: false })
export class NavigationItem {
  @Prop({ required: true }) id: string;
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ type: NavigationImageSchema, required: true }) image: NavigationImage;
  @Prop({ type: NavigationDestinationSchema, required: true }) destination: NavigationDestination;
  @Prop({ default: true }) active: boolean;
  @Prop({ required: true, min: 0 }) order: number;
}

const NavigationItemSchema = SchemaFactory.createForClass(NavigationItem);

@Schema({ _id: false })
export class NavigationStyle {
  @Prop({ default: '#ffffff' }) backgroundColor: string;
  @Prop({ default: '#222222' }) textColor: string;
  @Prop({ default: '#e7e3dc' }) borderColor: string;
  @Prop({ default: 1, min: 0, max: 12 }) borderWidth: number;
  @Prop({ default: 24, min: 0, max: 100 }) borderRadius: number;
  @Prop({ default: 'soft', enum: ['none', 'soft', 'medium', 'strong'] }) shadow: string;
  @Prop({ default: 'lift', enum: ['none', 'lift', 'glow', 'border'] }) hoverEffect: string;
  @Prop({ default: 1.04, min: 1, max: 1.2 }) hoverScale: number;
}

const NavigationStyleSchema = SchemaFactory.createForClass(NavigationStyle);

@Schema({ _id: false })
export class NavigationResponsive {
  @Prop({ default: 6, min: 1, max: 12 }) desktopItems: number;
  @Prop({ default: 3, min: 1, max: 6 }) mobileItems: number;
  @Prop({ default: 20, min: 0, max: 80 }) gap: number;
  @Prop({ default: 'circle', enum: ['circle', 'square', 'rectangle'] }) itemShape: string;
  @Prop({ default: 'hover', enum: ['always', 'never', 'hover'] }) desktopArrows: string;
  @Prop({ default: true }) mobileScroll: boolean;
  @Prop({ default: true }) mobileSnap: boolean;
}

const NavigationResponsiveSchema = SchemaFactory.createForClass(NavigationResponsive);

@Schema({ timestamps: true, versionKey: false })
export class NavigationCarousel {
  @Prop({ required: true, trim: true }) internalName: string;
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true }) slug: string;
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ default: true }) showTitle: boolean;
  @Prop({ default: true, index: true }) active: boolean;
  @Prop({ default: '#f7f5ef' }) sectionBackground: string;
  @Prop({ type: NavigationStyleSchema, default: () => ({}) }) style: NavigationStyle;
  @Prop({ type: NavigationResponsiveSchema, default: () => ({}) }) responsive: NavigationResponsive;
  @Prop({ type: [NavigationItemSchema], default: [] }) items: NavigationItem[];
}

export const NavigationCarouselSchema = SchemaFactory.createForClass(NavigationCarousel);
