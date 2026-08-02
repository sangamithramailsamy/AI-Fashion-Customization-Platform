import { useMemo, useState } from 'react';
import { useCatalog } from '@/context/CatalogContext';
import type { Product, ProductCategory } from '@/types';

export type SortKey = 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating';

export interface Filters {
  categories: ProductCategory[];
  collections: string[];
  priceMax: number;
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  minRating: number;
  search: string;
}

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  collections: [],
  priceMax: 30000,
  sizes: [],
  colors: [],
  inStockOnly: false,
  minRating: 0,
  search: '',
};

export const ALL_CATEGORIES: ProductCategory[] = [
  'Traditional',
  'Western',
  'Ethnic',
  'Party Wear',
  'Casual Wear',
  'Boutique Creation',
];

export const ALL_COLLECTIONS = [
  { slug: 'traditional', name: 'Traditional' },
  { slug: 'western', name: 'Western' },
  { slug: 'ethnic', name: 'Ethnic' },
  { slug: 'party-wear', name: 'Party Wear' },
  { slug: 'casual', name: 'Casual Wear' },
  { slug: 'new-creations', name: 'New Creations' },
];

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const ALL_COLORS = [
  { name: 'Maroon', hex: '#6B1F2E' },
  { name: 'Wine', hex: '#5C1A2B' },
  { name: 'Bronze', hex: '#C58341' },
  { name: 'Gold', hex: '#D4A373' },
  { name: 'Olive', hex: '#5B6635' },
  { name: 'Tea Green', hex: '#CCD5AE' },
  { name: 'Sage', hex: '#CCD5AE' },
  { name: 'Cream', hex: '#F6F8EA' },
];

export function useShopFilters() {
  const { products } = useCatalog();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
      if (p.price > filters.priceMax) return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s.label))) return false;
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name))) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      if (p.rating < filters.minRating) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = [p.name, p.category, p.collection].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.popularity - a.popularity;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [products, filters, sort]);

  const toggleArray = <K extends 'categories' | 'collections' | 'sizes' | 'colors'>(
    key: K,
    value: string
  ) => {
    setFilters((f) => {
      const arr = f[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...f, [key]: next } as Filters;
    });
  };

  const reset = () => setFilters(DEFAULT_FILTERS);

  return { filters, setFilters, sort, setSort, filtered, toggleArray, reset };
}

export function countActiveFilters(f: Filters): number {
  let n = 0;
  n += f.categories.length;
  n += f.collections.length;
  n += f.sizes.length;
  n += f.colors.length;
  if (f.inStockOnly) n++;
  if (f.minRating > 0) n++;
  if (f.priceMax < DEFAULT_FILTERS.priceMax) n++;
  return n;
}

export function getProduct(id: number): Product | undefined {
  return undefined;
}
