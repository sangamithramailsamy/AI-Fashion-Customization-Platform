import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Collections', path: '/collections' },
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Custom Designs', path: '/custom-designs' },
  { label: 'AI Design Studio', path: '/ai-design-studio' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const BRAND = {
  name: 'Shreemithra',
  tagline: 'LADIES BOUTIQUE',
  headline: 'Designed for You. Made to Be Yours.',
};

export const API_BASE_URL = ''; // Set later when Django REST backend is connected
