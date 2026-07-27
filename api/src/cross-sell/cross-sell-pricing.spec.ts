import { calculateProductPrice } from './cross-sell-pricing';
import { CatalogProduct } from './cross-sell.catalog';
import { CrossSellDiscountType } from './schemas/cross-sell-rule.schema';

const product = (patch: Partial<CatalogProduct> = {}): CatalogProduct => ({
  id: 'test', sku: 'TEST', name: 'Teste', style: 'IPA', categoryIds: [], collectionIds: [],
  price: 100, sellerType: '1P', sellerName: 'MarketBreja', tone: 'amber', ...patch,
});

describe('calculateProductPrice', () => {
  it('calcula o cross-sell sobre o preço promocional', () => {
    expect(calculateProductPrice(product({ promotionalPrice: 80 }), {
      type: CrossSellDiscountType.PERCENTAGE, value: 10,
    })).toMatchObject({ basePrice: 80, crossSellDiscount: 8, finalPrice: 72 });
  });

  it('limita o desconto 3P ao preço mínimo da comissão', () => {
    expect(calculateProductPrice(product({ sellerType: '3P', minimumCommissionPrice: 75 }), {
      type: CrossSellDiscountType.PERCENTAGE, value: 50,
    })).toMatchObject({ crossSellDiscount: 25, finalPrice: 75, cappedByCommission: true });
  });

  it('compõe desconto de pagamento sem romper o piso 3P', () => {
    expect(calculateProductPrice(product({ sellerType: '3P', minimumCommissionPrice: 82 }), {
      type: CrossSellDiscountType.FIXED, value: 10, paymentDiscountPercent: 20,
    })).toMatchObject({ crossSellDiscount: 10, paymentDiscount: 8, finalPrice: 82, cappedByCommission: true });
  });
});

