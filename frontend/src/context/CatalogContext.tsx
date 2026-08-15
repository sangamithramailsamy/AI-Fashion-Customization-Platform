import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { catalogService } from '@/services/catalogService';
import type { Product, Collection } from '@/types';

interface CatalogState {
  products: Product[];
  collections: Collection[];
  loading: boolean;
  error: string | null;
  getProductById: (id: number) => Product | undefined;
  getCollectionBySlug: (slug: string) => Collection | undefined;
  getProductsByCollection: (slug: string) => Product[];
  getFeatured: () => Product[];
  getNewArrivals: () => Product[];
  getBoutiqueCreations: () => Product[];
  refresh: () => void;
}

const CatalogContext = createContext<CatalogState | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cols] = await Promise.all([
        catalogService.listProducts(),
        catalogService.listCollections(),
      ]);
      setProducts(prods);
      setCollections(cols);
    } catch (err: any) {
      setError(err.message ?? 'Unable to load the catalog. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  const getCollectionBySlug = useCallback(
    (slug: string) => collections.find((c) => c.slug === slug),
    [collections]
  );

  const getProductsByCollection = useCallback(
  (slug: string) => products.filter((p) => p.collection === slug),
  [products]
);

  const getFeatured = useCallback(() => products.filter((p) => p.featured), [products]);
  const getNewArrivals = useCallback(() => products.filter((p) => p.newArrival), [products]);
  const getBoutiqueCreations = useCallback(
    () => products.filter((p) => p.category === 'Boutique Creation'),
    [products]
  );

  const value: CatalogState = {
    products,
    collections,
    loading,
    error,
    getProductById,
    getCollectionBySlug,
    getProductsByCollection,
    getFeatured,
    getNewArrivals,
    getBoutiqueCreations,
    refresh: load,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
