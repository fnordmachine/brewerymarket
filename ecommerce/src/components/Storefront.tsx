'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Beer, Check, ChevronDown, MapPin, Menu, Minus, Plus,
  Search, ShieldCheck, ShoppingBag, Sparkles, Star, Trash2, Truck, UserRound, X,
} from 'lucide-react';
import { NavigationCarousel } from './NavigationCarousel';
import type { CatalogProduct, CrossSellCombo, NavigationCarousel as CarouselType, ProductPricePreview } from '../types';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

const catalog: CatalogProduct[] = [
  { id: 'nebula-ipa', sku: 'MB-IPA-001', name: 'Nebulosa', style: 'American IPA', categoryIds: ['cervejas', 'ipa'], collectionIds: ['top-products', 'lupuladas'], price: 24.9, promotionalPrice: 21.9, sellerType: '1P', sellerName: 'MarketBreja', tone: 'amber' },
  { id: 'serra-pilsen', sku: 'MB-PIL-002', name: 'Serra Clara', style: 'Pilsen', categoryIds: ['cervejas', 'pilsen'], collectionIds: ['top-products', 'leves'], price: 16.5, sellerType: '1P', sellerName: 'MarketBreja', tone: 'gold' },
  { id: 'noite-stout', sku: '3P-STO-013', name: 'Noite Sem Fim', style: 'Imperial Stout', categoryIds: ['cervejas', 'stout'], collectionIds: ['escuras'], price: 29.9, promotionalPrice: 27.9, sellerType: '3P', sellerName: 'Cervejaria Horizonte', minimumCommissionPrice: 25.5, tone: 'dark' },
  { id: 'aurora-sour', sku: '3P-SOU-008', name: 'Aurora Vermelha', style: 'Fruit Sour', categoryIds: ['cervejas', 'sour'], collectionIds: ['top-products', 'frutadas'], price: 22, sellerType: '3P', sellerName: 'Casa Selvagem', minimumCommissionPrice: 19.4, tone: 'red' },
];

interface CartLine {
  id: string;
  product: CatalogProduct;
  quantity: number;
  unitPrice: number;
  crosssell_rule_id?: string;
  crosssell?: boolean;
  crosssell_line_index?: number;
  crosssell_discount?: number;
}

function pricePreview(product: CatalogProduct, type: 'percentage' | 'fixed', value: number, paymentPercent: number): ProductPricePreview {
  const base = product.promotionalPrice ?? product.price;
  const requested = type === 'percentage' ? base * value / 100 : value;
  const floor = product.sellerType === '3P' ? product.minimumCommissionPrice ?? base : 0;
  const crossSellDiscount = Math.min(requested, Math.max(0, base - floor));
  const requestedPayment = (base - crossSellDiscount) * paymentPercent / 100;
  const paymentDiscount = Math.min(requestedPayment, Math.max(0, base - crossSellDiscount - floor));
  return {
    listPrice: product.price, basePrice: base, requestedCrossSellDiscount: requested,
    crossSellDiscount, paymentDiscount, finalPrice: base - crossSellDiscount - paymentDiscount,
    cappedByCommission: crossSellDiscount + .001 < requested || paymentDiscount + .001 < requestedPayment,
    ...(product.sellerType === '3P' ? { minimumAllowedPrice: floor } : {}),
  };
}

function fallbackCombos(productIds: string[], paymentPercent: number): CrossSellCombo[] {
  const products = catalog.filter((product) => productIds.includes(product.id));
  const definitions = [
    { ruleId: 'demo-ipa', code: 'IPA-PETISCOS', text: 'Complete sua descoberta e ganhe um preço especial', scope: 'suggested' as const, type: 'percentage' as const, value: 12, matches: products.some((product) => product.categoryIds.includes('ipa')), ids: ['serra-pilsen', 'aurora-sour'] },
    { ruleId: 'demo-top', code: 'TOP-PRODUCTS-COMBO', text: 'Seleção do mestre: leve o combo completo', scope: 'combination' as const, type: 'fixed' as const, value: 4, matches: products.some((product) => product.collectionIds.includes('top-products')), ids: ['noite-stout'] },
  ];
  return definitions.filter((rule) => rule.matches).map((rule) => {
    const suggested = catalog.filter((product) => rule.ids.includes(product.id) && !productIds.includes(product.id));
    const combinationProducts = catalog.filter((product) => productIds.includes(product.id) || suggested.some((item) => item.id === product.id));
    return {
      ruleId: rule.ruleId, code: rule.code, promotionalText: rule.text, discountScope: rule.scope,
      suggestedProducts: suggested.map((product, lineIndex) => {
        const pricing = pricePreview(product, rule.type, rule.value, paymentPercent);
        return { ...product, lineIndex, pricing, cartMetadata: { crosssell_rule_id: rule.ruleId, crosssell: true as const, crosssell_line_index: lineIndex, crosssell_discount: pricing.crossSellDiscount } };
      }),
      combination: combinationProducts.map((product) => ({ productId: product.id, price: pricePreview(product, rule.type, rule.value, paymentPercent) })),
    };
  }).filter((combo) => combo.suggestedProducts.length);
}

function ProductVisual({ product, small = false }: { product: CatalogProduct; small?: boolean }) {
  return <div className={`sf-product-visual ${product.tone} ${small ? 'small' : ''}`}><div className="sf-can"><span>MB</span><strong>{product.name}</strong><small>{product.style}</small></div></div>;
}

function CrossSellOffer({ contextProductIds, paymentPercent, surface, onAdd }: {
  contextProductIds: string[];
  paymentPercent: number;
  surface: 'product' | 'cart';
  onAdd: (product: CrossSellCombo['suggestedProducts'][number], combo: CrossSellCombo) => void;
}) {
  const [combos, setCombos] = useState<CrossSellCombo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contextProductIds.length) { setCombos([]); setLoading(false); return; }
    const controller = new AbortController(); setLoading(true);
    void fetch(`${API_URL}/public/cross-sell/preview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ productIds: contextProductIds, paymentDiscountPercent: paymentPercent }),
    }).then(async (response) => response.ok ? response.json() as Promise<CrossSellCombo[]> : Promise.reject())
      .then((result) => setCombos(result.length ? result : fallbackCombos(contextProductIds, paymentPercent)))
      .catch(() => { if (!controller.signal.aborted) setCombos(fallbackCombos(contextProductIds, paymentPercent)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [contextProductIds.join('|'), paymentPercent]);

  if (!loading && !combos.length) return null;
  return <section className={`crosssell-offer ${surface}`} aria-label="Produtos sugeridos">
    <div className="crosssell-heading"><span><Sparkles size={15} /></span><div><small>COMBINA COM A SUA ESCOLHA</small><h2>{surface === 'cart' ? 'Que tal completar o pedido?' : 'Leve também'}</h2></div></div>
    {loading ? <div className="crosssell-loading"><span /><span /></div> : combos.map((combo) => <div className="crosssell-combo" key={combo.ruleId}>
      <div className="crosssell-message"><strong>{combo.promotionalText}</strong>{combo.discountScope === 'combination' && <span>Benefício aplicado em toda a combinação</span>}</div>
      <div className="crosssell-products">{combo.suggestedProducts.map((product) => <article key={product.id}>
        <ProductVisual product={product} small />
        <div className="crosssell-info"><small>{product.style} · {product.sellerType}</small><h3>{product.name}</h3><span>Vendido por {product.sellerName}</span>{product.pricing.cappedByCommission && <em><ShieldCheck size={11} /> Melhor desconto permitido para este seller</em>}</div>
        <div className="crosssell-price"><del>{currency.format(product.price)}</del><strong>{currency.format(product.pricing.finalPrice)}</strong><span>{product.pricing.paymentDiscount > 0 ? `inclui ${currency.format(product.pricing.paymentDiscount)} no pagamento` : `economize ${currency.format(product.pricing.crossSellDiscount)}`}</span></div>
        <button onClick={() => onAdd(product, combo)}><Plus size={15} /> Adicionar</button>
      </article>)}</div>
      <div className="crosssell-safe"><Check size={12} /> Preço calculado antes de adicionar · itens entram separadamente no carrinho</div>
    </div>)}
  </section>;
}

export function Storefront({ carousel }: { carousel: CarouselType }) {
  const [selectedProduct, setSelectedProduct] = useState(catalog[0]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<'product' | 'cart'>('product');
  const [paymentPercent, setPaymentPercent] = useState(5);
  const [toast, setToast] = useState('');

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const contextProductIds = useMemo(() => [...new Set(cart.map((line) => line.product.id))], [cart]);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };

  const addBaseProduct = () => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === selectedProduct.id && !line.crosssell);
      if (existing) return current.map((line) => line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { id: crypto.randomUUID(), product: selectedProduct, quantity: 1, unitPrice: selectedProduct.promotionalPrice ?? selectedProduct.price }];
    });
    showToast(`${selectedProduct.name} foi adicionada à sacola.`);
  };

  const addSuggested = (product: CrossSellCombo['suggestedProducts'][number], combo: CrossSellCombo, ensureProductTrigger = false) => {
    setCart((current) => {
      const hasTrigger = current.some((line) => line.product.id === selectedProduct.id);
      const withTrigger = ensureProductTrigger && !hasTrigger
        ? [...current, { id: crypto.randomUUID(), product: selectedProduct, quantity: 1, unitPrice: selectedProduct.promotionalPrice ?? selectedProduct.price }]
        : current;
      const repriced = withTrigger.map((line) => {
        const combinationPrice = combo.discountScope === 'combination' ? combo.combination.find((item) => item.productId === line.product.id)?.price : undefined;
        return combinationPrice ? { ...line, unitPrice: combinationPrice.finalPrice, crosssell_rule_id: combo.ruleId, crosssell: true, crosssell_discount: combinationPrice.crossSellDiscount } : line;
      });
      const existing = repriced.find((line) => line.product.id === product.id && line.crosssell_rule_id === combo.ruleId);
      if (existing) return repriced.map((line) => line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...repriced, { id: crypto.randomUUID(), product, quantity: 1, unitPrice: product.pricing.finalPrice, ...product.cartMetadata }];
    });
    showToast(`${product.name} entrou separadamente na sacola.`);
  };

  const changeQuantity = (id: string, delta: number) => setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line));
  const removeLine = (id: string) => setCart((current) => current.filter((line) => line.id !== id));

  return <>
    <div className="announcement"><span>Frete grátis para compras acima de R$ 199</span><div><a>Clube da Breja</a><a>Ajuda</a><a><MapPin size={12} /> Nossas lojas</a></div></div>
    <header className="site-header"><button className="menu-button"><Menu /></button><button className="logo" onClick={() => setView('product')}><span><Beer /></span><div><strong>MarketBreja</strong><small>cerveja feita de histórias</small></div></button><nav><a>Cervejas <ChevronDown size={13} /></a><a>Kits</a><a>Ofertas</a><a>Produtores</a><a>Conteúdos</a></nav><div className="header-tools"><button><Search /></button><button><UserRound /></button><button className="bag" onClick={() => setView('cart')}><ShoppingBag />{cartCount > 0 && <i>{cartCount}</i>}</button></div></header>
    <main className="sf-main">
      {view === 'product' ? <>
        <div className="sf-breadcrumb">Início <span>/</span> Cervejas <span>/</span> {selectedProduct.style}</div>
        <section className="product-detail"><div className="product-gallery"><span className="product-seal">CURADORIA<br />MARKETBREJA</span><ProductVisual product={selectedProduct} /><div className="product-thumbs"><button className="active"><ProductVisual product={selectedProduct} small /></button><button><Beer /></button><button><span>360°</span></button></div></div>
          <div className="product-copy"><div className="product-style">{selectedProduct.style.toUpperCase()} <span>·</span> {selectedProduct.sellerType}</div><h1>{selectedProduct.name}</h1><p className="product-seller">por <strong>{selectedProduct.sellerName}</strong></p><div className="product-rating"><span><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></span><strong>4.9</strong><a>126 avaliações</a></div><p className="product-description">Uma cerveja de personalidade marcante, aromas frescos e final equilibrado. Escolhida a dedo para transformar qualquer encontro em uma boa história.</p><div className="product-price">{selectedProduct.promotionalPrice && <del>{currency.format(selectedProduct.price)}</del>}<strong>{currency.format(selectedProduct.promotionalPrice ?? selectedProduct.price)}</strong><span>ou {currency.format((selectedProduct.promotionalPrice ?? selectedProduct.price) * .95)} no Pix</span></div><div className="payment-choice"><div><strong>Forma de pagamento</strong><span>O benefício também vale para os itens sugeridos</span></div><select value={paymentPercent} onChange={(event) => setPaymentPercent(Number(event.target.value))}><option value="0">Cartão</option><option value="5">Pix · 5% OFF</option><option value="10">Clube + Pix · 10% OFF</option></select></div><button className="add-main" onClick={addBaseProduct}><ShoppingBag size={18} /> Adicionar à sacola</button><div className="product-benefits"><span><Truck /> Frete grátis acima de R$ 199</span><span><ShieldCheck /> Compra segura</span></div></div>
        </section>
        <CrossSellOffer contextProductIds={[selectedProduct.id]} paymentPercent={paymentPercent} surface="product" onAdd={(product, combo) => addSuggested(product, combo, true)} />
        <NavigationCarousel carousel={carousel} />
        <section className="products-section"><div className="section-head"><div><small>ESCOLHAS DO MESTRE</small><h2>Outros rótulos<br />para descobrir</h2></div><p>Uma seleção de clássicos<br />e descobertas imperdíveis.</p><a>Ver todos <ArrowRight /></a></div><div className="product-grid">{catalog.map((product) => <article className="product-card" key={product.id} onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ProductVisual product={product} /><small>{product.style}</small><h3>{product.name}</h3><p>{product.sellerName}</p><div><strong>{currency.format(product.promotionalPrice ?? product.price)}</strong><button><ShoppingBag /></button></div></article>)}</div></section>
      </> : <div className="cart-page"><button className="cart-back" onClick={() => setView('product')}><ArrowLeft size={16} /> Continuar comprando</button><div className="cart-title"><div><small>SUA SELEÇÃO</small><h1>Sacola <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span></h1></div><div><Check size={13} /> Itens independentes e fáceis de remover</div></div>{cart.length ? <div className="cart-layout"><div><section className="cart-lines">{cart.map((line) => <article key={line.id}><ProductVisual product={line.product} small /><div className="cart-line-copy"><small>{line.product.style} · {line.product.sellerType}</small><h2>{line.product.name}</h2><span>{line.product.sellerName}</span>{line.crosssell && <em><Sparkles size={11} /> Oferta cross-sell · desconto {currency.format(line.crosssell_discount ?? 0)}</em>}</div><div className="cart-quantity"><button onClick={() => changeQuantity(line.id, -1)}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => changeQuantity(line.id, 1)}><Plus size={13} /></button></div><div className="cart-line-price">{line.unitPrice < line.product.price && <del>{currency.format(line.product.price * line.quantity)}</del>}<strong>{currency.format(line.unitPrice * line.quantity)}</strong></div><button className="cart-remove" onClick={() => removeLine(line.id)}><Trash2 size={16} /></button></article>)}</section><CrossSellOffer contextProductIds={contextProductIds} paymentPercent={paymentPercent} surface="cart" onAdd={addSuggested} /></div><aside className="cart-summary"><h2>Resumo do pedido</h2><div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div><div><span>Descontos</span><strong className="saving">− {currency.format(cart.reduce((sum, line) => sum + (line.product.price - line.unitPrice) * line.quantity, 0))}</strong></div><div><span>Entrega</span><strong>Calculada depois</strong></div><hr /><div className="cart-total"><span>Total</span><strong>{currency.format(subtotal)}</strong></div><small>em até 3x sem juros</small><button>Ir para pagamento <ArrowRight size={17} /></button><p><ShieldCheck size={14} /> Preços e comissão validados</p></aside></div> : <div className="cart-empty"><ShoppingBag size={35} /><h2>Sua sacola está vazia</h2><p>Escolha um rótulo e descubra combinações especiais.</p><button onClick={() => setView('product')}>Explorar cervejas</button></div>}</div>}
    </main>
    <footer><button className="logo inverted" onClick={() => setView('product')}><span><Beer /></span><div><strong>MarketBreja</strong><small>cerveja feita de histórias</small></div></button><p>Descubra. Brinde. Compartilhe.</p><span>© 2026 MarketBreja · Venda proibida para menores de 18 anos.</span></footer>
    {toast && <div className="sf-toast"><Check size={16} />{toast}<button onClick={() => setView('cart')}>Ver sacola</button><button className="close" onClick={() => setToast('')}><X size={14} /></button></div>}
  </>;
}
