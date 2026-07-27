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

export const CROSS_SELL_CATALOG: CatalogProduct[] = [
  { id: 'nebula-ipa', sku: 'MB-IPA-001', name: 'Nebulosa', style: 'American IPA', categoryIds: ['cervejas', 'ipa'], collectionIds: ['top-products', 'lupuladas'], price: 24.9, promotionalPrice: 21.9, sellerType: '1P', sellerName: 'MarketBreja', tone: 'amber' },
  { id: 'serra-pilsen', sku: 'MB-PIL-002', name: 'Serra Clara', style: 'Pilsen', categoryIds: ['cervejas', 'pilsen'], collectionIds: ['top-products', 'leves'], price: 16.5, sellerType: '1P', sellerName: 'MarketBreja', tone: 'gold' },
  { id: 'noite-stout', sku: '3P-STO-013', name: 'Noite Sem Fim', style: 'Imperial Stout', categoryIds: ['cervejas', 'stout'], collectionIds: ['escuras'], price: 29.9, promotionalPrice: 27.9, sellerType: '3P', sellerName: 'Cervejaria Horizonte', minimumCommissionPrice: 25.5, tone: 'dark' },
  { id: 'aurora-sour', sku: '3P-SOU-008', name: 'Aurora Vermelha', style: 'Fruit Sour', categoryIds: ['cervejas', 'sour'], collectionIds: ['top-products', 'frutadas'], price: 22, sellerType: '3P', sellerName: 'Casa Selvagem', minimumCommissionPrice: 19.4, tone: 'red' },
];

