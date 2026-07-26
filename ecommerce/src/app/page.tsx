import { ArrowRight, Beer, ChevronDown, Heart, MapPin, Menu, Search, ShoppingBag, Star, UserRound } from 'lucide-react';
import { NavigationCarousel } from '../components/NavigationCarousel';
import { demoCarousel } from '../demo';
import type { NavigationCarousel as CarouselType } from '../types';

async function getCarousel(): Promise<CarouselType> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3333';
  const slug = process.env.NAVIGATION_CAROUSEL_SLUG ?? 'estilos-de-cerveja';
  try {
    const response = await fetch(`${apiUrl}/public/navigation-carousels/${slug}`, { cache: 'no-store', signal: AbortSignal.timeout(1800) });
    if (!response.ok) return demoCarousel;
    return response.json();
  } catch { return demoCarousel; }
}

const products = [
  { style: 'AMERICAN IPA', name: 'Nebulosa', brewery: 'Cervejaria Três Lagos', price: 'R$ 24,90', tone: 'amber', score: '4.9' },
  { style: 'PILSEN', name: 'Serra Clara', brewery: 'Mestre do Malte', price: 'R$ 16,50', tone: 'gold', score: '4.8' },
  { style: 'IMPERIAL STOUT', name: 'Noite Sem Fim', brewery: 'Cervejaria Horizonte', price: 'R$ 29,90', tone: 'dark', score: '4.9' },
  { style: 'FRUIT SOUR', name: 'Aurora Vermelha', brewery: 'Casa Selvagem', price: 'R$ 22,00', tone: 'red', score: '4.7' },
];

export default async function Home() {
  const carousel = await getCarousel();
  return <>
    <div className="announcement"><span>Frete grátis para compras acima de R$ 199</span><div><a>Clube da Breja</a><a>Ajuda</a><a><MapPin size={12} /> Nossas lojas</a></div></div>
    <header className="site-header">
      <button className="menu-button"><Menu /></button><a className="logo"><span><Beer /></span><div><strong>MarketBreja</strong><small>cerveja feita de histórias</small></div></a>
      <nav><a>Cervejas <ChevronDown size={13} /></a><a>Kits</a><a>Ofertas</a><a>Produtores</a><a>Conteúdos</a></nav>
      <div className="header-tools"><button aria-label="Buscar"><Search /></button><button aria-label="Minha conta"><UserRound /></button><button className="bag" aria-label="Sacola"><ShoppingBag /><i>2</i></button></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="hero-tag"><span /> CURADORIA MARKETBREJA</div><h1>Boas histórias<br />começam com<br /><em>boa cerveja.</em></h1><p>Rótulos independentes, sabores autênticos e produtores apaixonados. Tudo escolhido a dedo para você.</p><a className="hero-cta">Descobrir cervejas <ArrowRight /></a><div className="hero-proof"><div className="faces"><i>AM</i><i>RC</i><i>FL</i></div><div><span><Star fill="currentColor" /> 4.9</span><small>+12 mil cervejeiros felizes</small></div></div></div>
        <div className="hero-art"><div className="sun" /><div className="hop hop-one">✦</div><div className="hop hop-two">✦</div><div className="bottle bottle-one"><span>MB</span><strong>NEBULOSA</strong><small>AMERICAN IPA</small></div><div className="bottle bottle-two"><span>MB</span><strong>SERRA CLARA</strong><small>PILSEN</small></div><div className="hero-stamp">FEITA<br />NO BRASIL<br /><Beer /></div><p>Beba com<br />curiosidade.</p></div>
      </section>
      <NavigationCarousel carousel={carousel} />
      <section className="products-section"><div className="section-head"><div><small>ESCOLHAS DO MESTRE</small><h2>Rótulos que valem<br />cada gole</h2></div><p>Uma seleção que reúne clássicos<br />e descobertas imperdíveis.</p><a>Ver todos os rótulos <ArrowRight /></a></div><div className="product-grid">{products.map((product) => <article className="product-card" key={product.name}><div className={`product-art ${product.tone}`}><button><Heart /></button><div className="can"><span>MB</span><strong>{product.name}</strong><small>{product.style}</small></div><div className="rating"><Star fill="currentColor" /> {product.score}</div></div><small>{product.style}</small><h3>{product.name}</h3><p>{product.brewery}</p><div><strong>{product.price}</strong><button><ShoppingBag /></button></div></article>)}</div></section>
    </main>
    <footer><a className="logo inverted"><span><Beer /></span><div><strong>MarketBreja</strong><small>cerveja feita de histórias</small></div></a><p>Descubra. Brinde. Compartilhe.</p><span>© 2026 MarketBreja · Venda proibida para menores de 18 anos.</span></footer>
  </>;
}
