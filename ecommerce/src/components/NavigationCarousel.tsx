'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Beer, Cherry, ChevronLeft, ChevronRight, Coffee, Flame, Gift, Image as ImageIcon,
  Leaf, Package, ShoppingBag, Sparkles, Store, Wheat, Zap, type LucideIcon,
} from 'lucide-react';
import type { NavigationCarousel as CarouselType } from '../types';

const iconLibrary: Record<string, LucideIcon> = { Beer, Wheat, Coffee, Cherry, Leaf, Gift, Flame, Sparkles, ShoppingBag, Package, Zap, Store };

function resolveHref(type: string, value: string) {
  const encoded = encodeURIComponent(value);
  const paths: Record<string, string> = {
    category: `/categoria/${encoded}`, subcategory: `/categoria/${encoded}`, collection: `/colecao/${encoded}`,
    brand: `/marca/${encoded}`, department: `/departamento/${encoded}`, product: `/produto/${encoded}`,
    institutional: `/institucional/${encoded}`, custom_page: `/paginas/${encoded}`, search: `/busca?q=${encoded}`,
  };
  return type === 'external_url' ? value : paths[type] ?? '#';
}

export function NavigationCarousel({ carousel }: { carousel: CarouselType }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => track.current?.scrollBy({ left: direction * track.current.clientWidth * .72, behavior: 'smooth' });
  const items = carousel.items.filter((item) => item.active).sort((a, b) => a.order - b.order);
  const style = {
    '--nav-section-bg': carousel.sectionBackground, '--nav-item-bg': carousel.style.backgroundColor,
    '--nav-text': carousel.style.textColor, '--nav-border': carousel.style.borderColor,
    '--nav-border-width': `${carousel.style.borderWidth}px`, '--nav-radius': `${carousel.style.borderRadius}px`,
    '--nav-gap': `${carousel.responsive.gap}px`, '--nav-desktop': carousel.responsive.desktopItems,
    '--nav-mobile': carousel.responsive.mobileItems, '--nav-scale': carousel.style.hoverScale,
  } as React.CSSProperties;

  if (!carousel.active || !items.length) return null;
  return <section className={`navigation-section nav-shape-${carousel.responsive.itemShape} nav-shadow-${carousel.style.shadow} nav-hover-${carousel.style.hoverEffect} arrows-${carousel.responsive.desktopArrows}`} style={style}>
    <div className="navigation-container">
      {carousel.showTitle && <div className="navigation-title"><div><small>ENCONTRE O SEU SABOR</small><h2>{carousel.title}</h2></div><Link href="/categorias">Ver todos os estilos <ArrowRight /></Link></div>}
      <div className="navigation-carousel">
        {carousel.responsive.desktopArrows !== 'never' && <button className="carousel-arrow previous" aria-label="Itens anteriores" onClick={() => scroll(-1)}><ChevronLeft /></button>}
        <div ref={track} className={`navigation-track ${carousel.responsive.mobileSnap ? 'has-snap' : ''} ${carousel.responsive.mobileScroll ? 'mobile-scroll' : ''}`}>
          {items.map((item) => {
            const Icon = iconLibrary[item.image.value] ?? ImageIcon;
            const href = resolveHref(item.destination.type, item.destination.value);
            return <Link key={item.id} href={href} target={item.destination.openInNewTab ? '_blank' : undefined} rel={item.destination.openInNewTab ? 'noreferrer' : undefined} className="navigation-item">
              <span className="navigation-image">{item.image.source === 'upload' ? <img src={item.image.value} alt={item.image.alt || item.name} /> : <Icon />}</span>
              <strong>{item.name}</strong><span>Explorar <ChevronRight /></span>
            </Link>;
          })}
        </div>
        {carousel.responsive.desktopArrows !== 'never' && <button className="carousel-arrow next" aria-label="Próximos itens" onClick={() => scroll(1)}><ChevronRight /></button>}
      </div>
    </div>
  </section>;
}
