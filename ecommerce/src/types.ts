export interface NavigationCarousel {
  _id?: string;
  slug: string;
  title: string;
  showTitle: boolean;
  active: boolean;
  sectionBackground: string;
  style: {
    backgroundColor: string; textColor: string; borderColor: string; borderWidth: number;
    borderRadius: number; shadow: 'none' | 'soft' | 'medium' | 'strong';
    hoverEffect: 'none' | 'lift' | 'glow' | 'border'; hoverScale: number;
  };
  responsive: {
    desktopItems: number; mobileItems: number; gap: number; itemShape: 'circle' | 'square' | 'rectangle';
    desktopArrows: 'always' | 'never' | 'hover'; mobileScroll: boolean; mobileSnap: boolean;
  };
  items: Array<{
    id: string; name: string; image: { source: 'icon' | 'upload'; value: string; alt: string };
    destination: { type: string; value: string; label: string; openInNewTab: boolean }; active: boolean; order: number;
  }>;
}
