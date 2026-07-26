import type { DestinationType, NavigationCarousel, NavigationItem, Order, OrderFilters } from './types';

export const emptyFilters: OrderFilters = {
  search: '',
  orderStatus: '',
  deliveryStatus: '',
  channel: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
};

const address = (street: string, city: string) => `${street} - ${city} - SP`;

export const sampleOrders: Order[] = [
  {
    id: 'order-10482', orderStatus: 'Pago', deliveryStatus: 'Em transporte', orderNumber: '#10482',
    deliveryNumber: 'ENT-839201', orderDate: '2026-07-25T14:32:00-03:00', totalAmount: 289.7,
    freightAmount: 18.9, channel: 'Loja online', soldAndDeliveredBy: 'MarketBreja',
    customer: { name: 'Marina Costa', document: '394.728.510-06', email: 'marina.costa@email.com', phone: '(11) 98765-4321' },
    payment: { gateway: 'Pagar.me', gatewayStatus: 'Capturada', antifraud: 'ClearSale', antifraudStatus: 'Aprovado', method: 'Cartão de crédito · 2x', paidAt: '2026-07-25T14:34:00-03:00', chargeId: 'ch_7q3m8k2', reference: 'REF-10482-PG', refundedAmount: 0 },
    discounts: { applied: 'Clube MarketBreja — 10%', coupon: 'CLUBE10', service: 'Embalagem para presente', serviceValue: 8.9 },
    delivery: { address: address('Al. Santos, 1240, ap. 81', 'São Paulo'), billingAddress: address('Al. Santos, 1240, ap. 81', 'São Paulo'), freightQuoteId: 'FRT-QT-55381', shippingMethod: 'Entrega expressa' },
    seller: { erpCode: 'VND-0042', name: 'Bianca Nunes', email: 'bianca.nunes@marketbreja.com.br', phone: '(11) 97654-1108', status: 'Ativo' },
    items: [
      { sku: 'IPA-NEB-473', title: 'IPA Nebulosa 473ml', parentProduct: 'IPA Nebulosa', unitPrice: 24.9, quantity: 6 },
      { sku: 'KIT-TRI-03', title: 'Kit Trinca Copos MarketBreja', parentProduct: 'Copos MarketBreja', unitPrice: 56.7, quantity: 2 },
    ],
  },
  {
    id: 'order-10481', orderStatus: 'Aguardando pagamento', deliveryStatus: 'Aguardando envio', orderNumber: '#10481',
    deliveryNumber: 'ENT-839194', orderDate: '2026-07-25T11:18:00-03:00', totalAmount: 97.5,
    freightAmount: 12.6, channel: 'Marketplace', soldAndDeliveredBy: 'Empório do Malte',
    customer: { name: 'Rafael Almeida', document: '458.122.980-30', email: 'rafa.almeida@email.com', phone: '(19) 99871-2204' },
    payment: { gateway: 'Mercado Pago', gatewayStatus: 'Pendente', antifraud: 'N/A', antifraudStatus: 'Não analisado', method: 'Pix', paidAt: null, chargeId: 'MP-98201547', reference: 'REF-10481-MP', refundedAmount: 0 },
    discounts: { applied: 'Desconto progressivo — R$ 10,00', coupon: '—', service: '—', serviceValue: 0 },
    delivery: { address: address('R. das Palmeiras, 455', 'Campinas'), billingAddress: address('R. das Palmeiras, 455', 'Campinas'), freightQuoteId: 'FRT-QT-55364', shippingMethod: 'Entrega padrão' },
    seller: { erpCode: 'VND-0038', name: 'Caio Ramos', email: 'caio.ramos@emporiodomalte.com.br', phone: '(19) 98333-9912', status: 'Ativo' },
    items: [
      { sku: 'PIL-CAS-350', title: 'Pilsen da Casa 350ml', parentProduct: 'Pilsen da Casa', unitPrice: 14.15, quantity: 6 },
    ],
  },
  {
    id: 'order-10479', orderStatus: 'Pago', deliveryStatus: 'Entregue', orderNumber: '#10479',
    deliveryNumber: 'ENT-839112', orderDate: '2026-07-24T18:45:00-03:00', totalAmount: 418.4,
    freightAmount: 0, channel: 'Loja online', soldAndDeliveredBy: 'MarketBreja',
    customer: { name: 'Fernanda Moura', document: '071.554.329-22', email: 'fernanda.moura@email.com', phone: '(11) 95552-1887' },
    payment: { gateway: 'Adyen', gatewayStatus: 'Capturada', antifraud: 'Riskified', antifraudStatus: 'Aprovado', method: 'Cartão de crédito · 4x', paidAt: '2026-07-24T18:47:00-03:00', chargeId: 'ADY-881300912', reference: 'REF-10479-AD', refundedAmount: 0 },
    discounts: { applied: 'Frete grátis Sudeste', coupon: 'VERAO26', service: 'Garantia de entrega', serviceValue: 4.9 },
    delivery: { address: address('R. Harmonia, 98', 'São Paulo'), billingAddress: address('R. Harmonia, 98', 'São Paulo'), freightQuoteId: 'FRT-QT-55298', shippingMethod: 'Same day' },
    seller: { erpCode: 'VND-0016', name: 'Adriana Martins', email: 'adriana@marketbreja.com.br', phone: '(11) 98808-1010', status: 'Ativo' },
    items: [
      { sku: 'KIT-DEG-12', title: 'Kit Degustação 12 estilos', parentProduct: 'Kit Degustação', unitPrice: 199.75, quantity: 2 },
      { sku: 'SERV-GAR-01', title: 'Garantia de entrega', parentProduct: 'Serviços', unitPrice: 4.9, quantity: 1 },
    ],
  },
  {
    id: 'order-10476', orderStatus: 'Cancelado', deliveryStatus: 'Cancelada', orderNumber: '#10476',
    deliveryNumber: 'ENT-839021', orderDate: '2026-07-23T09:12:00-03:00', totalAmount: 156.3,
    freightAmount: 16.5, channel: 'Televendas', soldAndDeliveredBy: 'MarketBreja',
    customer: { name: 'Gustavo Barros', document: '288.430.718-91', email: 'gustavo.barros@email.com', phone: '(11) 97821-6390' },
    payment: { gateway: 'Pagar.me', gatewayStatus: 'Estornada', antifraud: 'ClearSale', antifraudStatus: 'Aprovado', method: 'Cartão de crédito · 1x', paidAt: '2026-07-23T09:14:00-03:00', chargeId: 'ch_2p7r5a9', reference: 'REF-10476-PG', refundedAmount: 156.3 },
    discounts: { applied: '—', coupon: '—', service: '—', serviceValue: 0 },
    delivery: { address: address('Av. das Nações, 700', 'Osasco'), billingAddress: address('Av.. das Nações, 700', 'Osasco'), freightQuoteId: 'FRT-QT-55177', shippingMethod: 'Entrega padrão' },
    seller: { erpCode: 'VND-0042', name: 'Bianca Nunes', email: 'bianca.nunes@marketbreja.com.br', phone: '(11) 97654-1108', status: 'Ativo' },
    items: [
      { sku: 'STO-IMP-473', title: 'Imperial Stout 473ml', parentProduct: 'Imperial Stout', unitPrice: 34.95, quantity: 4 },
    ],
  },
  {
    id: 'order-10472', orderStatus: 'Em separação', deliveryStatus: 'Preparando envio', orderNumber: '#10472',
    deliveryNumber: 'ENT-838915', orderDate: '2026-07-22T16:08:00-03:00', totalAmount: 231.6,
    freightAmount: 22.8, channel: 'Loja online', soldAndDeliveredBy: 'Cervejaria Três Lagos',
    customer: { name: 'Luciana Freitas', document: '53.821.440/0001-70', email: 'compras@bistrolu.com.br', phone: '(16) 3344-1290' },
    payment: { gateway: 'Pagar.me', gatewayStatus: 'Capturada', antifraud: 'ClearSale', antifraudStatus: 'Aprovado', method: 'Boleto bancário', paidAt: '2026-07-22T10:01:00-03:00', chargeId: 'ch_9s1b4c8', reference: 'REF-10472-PG', refundedAmount: 0 },
    discounts: { applied: 'Atacado — 8%', coupon: 'ATACADO8', service: 'Seguro de carga', serviceValue: 9.8 },
    delivery: { address: address('R. São Bento, 31', 'Ribeirão Preto'), billingAddress: address('R. São Bento, 31', 'Ribeirão Preto'), freightQuoteId: 'FRT-QT-55062', shippingMethod: 'Transportadora Jadlog' },
    seller: { erpCode: 'VND-0021', name: 'Eduardo Luz', email: 'eduardo@treslagos.com.br', phone: '(16) 99101-0412', status: 'Ativo' },
    items: [
      { sku: 'APA-TL-600', title: 'American Pale Ale Três Lagos 600ml', parentProduct: 'American Pale Ale', unitPrice: 24.9, quantity: 8 },
    ],
  },
  {
    id: 'order-10468', orderStatus: 'Pago', deliveryStatus: 'Entregue', orderNumber: '#10468',
    deliveryNumber: 'ENT-838802', orderDate: '2026-07-21T12:27:00-03:00', totalAmount: 84.7,
    freightAmount: 10.9, channel: 'Aplicativo', soldAndDeliveredBy: 'MarketBreja',
    customer: { name: 'Pedro Henrique Lima', document: '701.985.240-13', email: 'pedrohlima@email.com', phone: '(11) 96640-5178' },
    payment: { gateway: 'Mercado Pago', gatewayStatus: 'Aprovada', antifraud: 'Mercado Pago', antifraudStatus: 'Aprovado', method: 'Pix', paidAt: '2026-07-21T12:27:00-03:00', chargeId: 'MP-98177440', reference: 'REF-10468-MP', refundedAmount: 0 },
    discounts: { applied: 'Primeira compra — 15%', coupon: 'BEMVINDO15', service: '—', serviceValue: 0 },
    delivery: { address: address('R. Dr. Mário Ferraz, 222', 'São Paulo'), billingAddress: address('R. Dr. Mário Ferraz, 222', 'São Paulo'), freightQuoteId: 'FRT-QT-54988', shippingMethod: 'Entrega padrão' },
    seller: { erpCode: 'VND-0016', name: 'Adriana Martins', email: 'adriana@marketbreja.com.br', phone: '(11) 98808-1010', status: 'Ativo' },
    items: [
      { sku: 'SOU-MAR-350', title: 'Sour Maracujá 350ml', parentProduct: 'Sour Tropical', unitPrice: 24.6, quantity: 3 },
    ],
  },
  {
    id: 'order-10461', orderStatus: 'Reembolsado', deliveryStatus: 'Devolvida', orderNumber: '#10461',
    deliveryNumber: 'ENT-838514', orderDate: '2026-07-19T08:54:00-03:00', totalAmount: 328.1,
    freightAmount: 19.9, channel: 'Marketplace', soldAndDeliveredBy: 'Mundo das Cervejas',
    customer: { name: 'Aline Prado', document: '193.702.668-45', email: 'aline.prado@email.com', phone: '(13) 99118-0029' },
    payment: { gateway: 'Adyen', gatewayStatus: 'Reembolsada', antifraud: 'Riskified', antifraudStatus: 'Aprovado', method: 'Cartão de crédito · 3x', paidAt: '2026-07-19T08:56:00-03:00', chargeId: 'ADY-880992117', reference: 'REF-10461-AD', refundedAmount: 328.1 },
    discounts: { applied: 'Combo — R$ 25,00', coupon: '—', service: 'Seguro de carga', serviceValue: 9.8 },
    delivery: { address: address('Av. Ana Costa, 407', 'Santos'), billingAddress: address('Av. Ana Costa, 407', 'Santos'), freightQuoteId: 'FRT-QT-54753', shippingMethod: 'Transportadora Loggi' },
    seller: { erpCode: 'VND-0054', name: 'Renato Braga', email: 'renato@mundodascervejas.com.br', phone: '(13) 99740-3320', status: 'Inativo' },
    items: [
      { sku: 'WIT-BEL-500', title: 'Witbier Belga 500ml', parentProduct: 'Witbier Belga', unitPrice: 29.85, quantity: 10 },
    ],
  },
  {
    id: 'order-10455', orderStatus: 'Pago', deliveryStatus: 'Em transporte', orderNumber: '#10455',
    deliveryNumber: 'ENT-838291', orderDate: '2026-07-17T20:11:00-03:00', totalAmount: 179.4,
    freightAmount: 14.7, channel: 'Loja online', soldAndDeliveredBy: 'MarketBreja',
    customer: { name: 'João Victor Soares', document: '033.625.176-08', email: 'joao.v.soares@email.com', phone: '(12) 98831-7402' },
    payment: { gateway: 'Pagar.me', gatewayStatus: 'Capturada', antifraud: 'ClearSale', antifraudStatus: 'Aprovado', method: 'Cartão de crédito · 2x', paidAt: '2026-07-17T20:13:00-03:00', chargeId: 'ch_6z8n3f1', reference: 'REF-10455-PG', refundedAmount: 0 },
    discounts: { applied: '—', coupon: '—', service: 'Embalagem para presente', serviceValue: 8.9 },
    delivery: { address: address('R. Paraibuna, 120', 'São José dos Campos'), billingAddress: address('R. Paraibuna, 120', 'São José dos Campos'), freightQuoteId: 'FRT-QT-54481', shippingMethod: 'Entrega expressa' },
    seller: { erpCode: 'VND-0042', name: 'Bianca Nunes', email: 'bianca.nunes@marketbreja.com.br', phone: '(11) 97654-1108', status: 'Ativo' },
    items: [
      { sku: 'IPA-NEB-473', title: 'IPA Nebulosa 473ml', parentProduct: 'IPA Nebulosa', unitPrice: 24.9, quantity: 6 },
      { sku: 'EMB-PRE-01', title: 'Embalagem para presente', parentProduct: 'Serviços', unitPrice: 8.9, quantity: 1 },
    ],
  },
];

export const destinationLabels: Record<DestinationType, string> = {
  category: 'Categoria', subcategory: 'Subcategoria', collection: 'Coleção', brand: 'Marca',
  department: 'Departamento', product: 'Produto', institutional: 'Página institucional',
  custom_page: 'Página personalizada', search: 'Resultado de busca', external_url: 'URL externa',
};

export const destinationOptions: Record<Exclude<DestinationType, 'external_url' | 'search'>, string[]> = {
  category: ['Cervejas', 'Kits e presentes', 'Acessórios'], subcategory: ['IPA', 'Pilsen', 'Stout', 'Sour'],
  collection: ['Favoritas do mestre', 'Festival de inverno', 'Descobertas da semana'],
  brand: ['Colorado', 'Hocus Pocus', 'Dogma', 'Três Lagos'], department: ['Mercearia', 'Bebidas', 'Presentes'],
  product: ['IPA Nebulosa 473ml', 'Pilsen da Casa 350ml', 'Kit Degustação 6 estilos'],
  institutional: ['Sobre nós', 'Como comprar', 'Nossas lojas'], custom_page: ['Clube da Breja', 'Festival MarketBreja', 'Guia de estilos'],
};

const carouselItem = (id: string, name: string, icon: string, value: string, order: number): NavigationItem => ({
  id, name, image: { source: 'icon', value: icon, alt: name },
  destination: { type: 'category', value, label: value, openInNewTab: false }, active: true, order,
});

export const initialCarousel: NavigationCarousel = {
  internalName: 'Navegação principal — Estilos', slug: 'estilos-de-cerveja', title: 'Explore seu próximo estilo',
  showTitle: true, active: true, sectionBackground: '#f6f4ee',
  style: { backgroundColor: '#ffffff', textColor: '#262622', borderColor: '#e6e0d5', borderWidth: 1, borderRadius: 24, shadow: 'soft', hoverEffect: 'lift', hoverScale: 1.04 },
  responsive: { desktopItems: 6, mobileItems: 3, gap: 18, itemShape: 'circle', desktopArrows: 'hover', mobileScroll: true, mobileSnap: true },
  items: [
    carouselItem('ipa', 'India Pale Ale', 'Wheat', 'IPA', 0), carouselItem('pilsen', 'Pilsen', 'Beer', 'Pilsen', 1),
    carouselItem('stout', 'Stout', 'Coffee', 'Stout', 2), carouselItem('sour', 'Sour', 'Cherry', 'Sour', 3),
    carouselItem('zero', 'Sem álcool', 'Leaf', 'Sem álcool', 4), carouselItem('kits', 'Kits especiais', 'Gift', 'Kits e presentes', 5),
    carouselItem('top', 'Mais vendidos', 'Flame', 'Mais vendidos', 6),
  ],
};
