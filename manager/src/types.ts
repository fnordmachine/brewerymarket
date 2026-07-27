export interface OrderItem {
  sku: string;
  title: string;
  parentProduct: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export interface OrderPayment {
  gateway: string;
  gatewayStatus: string;
  antifraud: string;
  antifraudStatus: string;
  method: string;
  paidAt: string | null;
  chargeId: string;
  reference: string;
  refundedAmount: number;
}

export interface OrderDiscounts {
  applied: string;
  coupon: string;
  service: string;
  serviceValue: number;
}

export interface OrderDelivery {
  address: string;
  billingAddress: string;
  freightQuoteId: string;
  shippingMethod: string;
}

export interface OrderSeller {
  erpCode: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export interface Order {
  id: string;
  orderStatus: string;
  deliveryStatus: string;
  orderNumber: string;
  deliveryNumber: string;
  orderDate: string;
  totalAmount: number;
  freightAmount: number;
  channel: string;
  soldAndDeliveredBy: string;
  customer: OrderCustomer;
  payment: OrderPayment;
  discounts: OrderDiscounts;
  delivery: OrderDelivery;
  seller: OrderSeller;
  items: OrderItem[];
}

export interface OrderFilters {
  search: string;
  orderStatus: string;
  deliveryStatus: string;
  channel: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
}

export type DestinationType =
  | 'category'
  | 'subcategory'
  | 'collection'
  | 'brand'
  | 'department'
  | 'product'
  | 'institutional'
  | 'custom_page'
  | 'search'
  | 'external_url';

export interface NavigationItem {
  id: string;
  name: string;
  image: { source: 'icon' | 'upload'; value: string; alt: string };
  destination: { type: DestinationType; value: string; label: string; openInNewTab: boolean };
  active: boolean;
  order: number;
}

export interface NavigationCarousel {
  _id?: string;
  internalName: string;
  slug: string;
  title: string;
  showTitle: boolean;
  active: boolean;
  sectionBackground: string;
  style: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    shadow: 'none' | 'soft' | 'medium' | 'strong';
    hoverEffect: 'none' | 'lift' | 'glow' | 'border';
    hoverScale: number;
  };
  responsive: {
    desktopItems: number;
    mobileItems: number;
    gap: number;
    itemShape: 'circle' | 'square' | 'rectangle';
    desktopArrows: 'always' | 'never' | 'hover';
    mobileScroll: boolean;
    mobileSnap: boolean;
  };
  items: NavigationItem[];
}

export type CrossSellTargetType = 'product' | 'category' | 'collection';
export type CrossSellDiscountType = 'percentage' | 'fixed' | 'none';
export type CrossSellDiscountScope = 'suggested' | 'combination';

export interface CrossSellTrigger {
  type: CrossSellTargetType;
  referenceId: string;
  label: string;
}

export interface CrossSellRule {
  _id?: string;
  code: string;
  internalName: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  triggers: CrossSellTrigger[];
  suggestedProductIds: string[];
  promotionalText: string;
  discountType: CrossSellDiscountType;
  discountValue: number;
  discountScope: CrossSellDiscountScope;
  createdAt?: string;
  updatedAt?: string;
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
