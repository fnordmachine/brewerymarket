import { Storefront } from '../components/Storefront';
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

export default async function Home() {
  const carousel = await getCarousel();
  return <Storefront carousel={carousel} />;
}
