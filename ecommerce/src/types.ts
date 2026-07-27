export interface NavigationCarousel {
  _id?: string;
  slug: string;
  title: string;
  showTitle: boolean;
  active: boolean;
  sectionBackground: string;
  style: {
    backgroundColor: string; textColor: string; borderColor: string; borderWidth: number;
    borderRadius: number; shadow: 'none' | 'soft' | 'medium' | 'strong';
    hoverEffect: 'none' | 'lift' | 'glow' | 'border'; hoverScale: number;
  };
  responsive: {
    desktopItems: number; mobileItems: number; gap: number; itemShape: 'circle' | 'square' | 'rectangle';
    desktopArrows: 'always' | 'never' | 'hover'; mobileScroll: boolean; mobileSnap: boolean;
  };
  items: Array<{
    id: string; name: string; image: { source: 'icon' | 'upload'; value: string; alt: string };
    destination: { type: string; value: string; label: string; openInNewTab: boolean }; active: boolean; order: number;
  }>;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  style: string;
  categoryIds: string[];
  collectionIds: string[];
  price: number;
  promotionalPrice?: number;
  sellerType: '1P' | '3P';
  sellerName: string;
  minimumCommissionPrice?: number;
  tone: 'amber' | 'gold' | 'dark' | 'red';
}

export interface ProductPricePreview {
  listPrice: number;
  basePrice: number;
  requestedCrossSellDiscount: number;
  crossSellDiscount: number;
  paymentDiscount: number;
  finalPrice: number;
  cappedByCommission: boolean;
  minimumAllowedPrice?: number;
}

export interface CrossSellCombo {
  ruleId: string;
  code: string;
  promotionalText: string;
  discountScope: 'suggested' | 'combination';
  suggestedProducts: Array<CatalogProduct & {
    lineIndex: number;
    pricing: ProductPricePreview;
    cartMetadata: {
      crosssell_rule_id: string;
      crosssell: true;
      crosssell_line_index: number;
      crosssell_discount: number;
    };
  }>;
  combination: Array<{ productId: string; price: ProductPricePreview }>;
}
