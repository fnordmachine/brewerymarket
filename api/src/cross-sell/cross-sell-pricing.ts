import { CatalogProduct } from './cross-sell.catalog';
import { CrossSellDiscountType } from './schemas/cross-sell-rule.schema';

export interface DiscountRequest {
  type: CrossSellDiscountType;
  value: number;
  paymentDiscountPercent?: number;
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

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateProductPrice(product: CatalogProduct, request: DiscountRequest): ProductPricePreview {
  const basePrice = product.promotionalPrice ?? product.price;
  const requested = request.type === CrossSellDiscountType.PERCENTAGE
    ? basePrice * Math.min(request.value, 100) / 100
    : request.type === CrossSellDiscountType.FIXED
      ? request.value
      : 0;
  const floor = product.sellerType === '3P' ? product.minimumCommissionPrice ?? basePrice : 0;
  const crossSellDiscount = Math.min(requested, Math.max(0, basePrice - floor));
  const priceAfterCrossSell = basePrice - crossSellDiscount;
  const requestedPaymentDiscount = priceAfterCrossSell * (request.paymentDiscountPercent ?? 0) / 100;
  const paymentDiscount = Math.min(requestedPaymentDiscount, Math.max(0, priceAfterCrossSell - floor));
  const cappedByCommission = crossSellDiscount + 0.001 < requested || paymentDiscount + 0.001 < requestedPaymentDiscount;

  return {
    listPrice: money(product.price),
    basePrice: money(basePrice),
    requestedCrossSellDiscount: money(requested),
    crossSellDiscount: money(crossSellDiscount),
    paymentDiscount: money(paymentDiscount),
    finalPrice: money(priceAfterCrossSell - paymentDiscount),
    cappedByCommission,
    ...(product.sellerType === '3P' ? { minimumAllowedPrice: money(floor) } : {}),
  };
}

