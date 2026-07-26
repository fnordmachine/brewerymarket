import type { NavigationCarousel } from './types';

const makeItem = (id: string, name: string, icon: string, value: string, order: number) => ({
  id, name, image: { source: 'icon' as const, value: icon, alt: name },
  destination: { type: 'category', value, label: value, openInNewTab: false }, active: true, order,
});

export const demoCarousel: NavigationCarousel = {
  slug: 'estilos-de-cerveja', title: 'Explore seu próximo estilo', showTitle: true, active: true,
  sectionBackground: '#f5f2e9',
  style: { backgroundColor: '#fffdf8', textColor: '#24251f', borderColor: '#e2ddd0', borderWidth: 1, borderRadius: 28, shadow: 'soft', hoverEffect: 'lift', hoverScale: 1.04 },
  responsive: { desktopItems: 6, mobileItems: 3, gap: 22, itemShape: 'circle', desktopArrows: 'hover', mobileScroll: true, mobileSnap: true },
  items: [makeItem('ipa', 'India Pale Ale', 'Wheat', 'IPA', 0), makeItem('pilsen', 'Pilsen', 'Beer', 'Pilsen', 1), makeItem('stout', 'Stout', 'Coffee', 'Stout', 2), makeItem('sour', 'Sour', 'Cherry', 'Sour', 3), makeItem('zero', 'Sem álcool', 'Leaf', 'Sem álcool', 4), makeItem('kits', 'Kits especiais', 'Gift', 'Kits e presentes', 5), makeItem('top', 'Mais vendidos', 'Flame', 'Mais vendidos', 6)],
};
