import apiClient from './apiClient';
import type { Product, Collection } from '@/types';

/**
 * Catalog service — fetches products, collections, and sections from the
 * Django REST backend. Replaces the static mockData module.
 */

export const catalogService = {
  async listProducts(): Promise<Product[]> {
    const res = await apiClient.get("/catalog/designs/");

    return res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,

      price: Number(item.price),
      originalPrice: Number(item.price),

      image: item.image,

      category: "Boutique Creation",

      collection: item.category?.slug ?? "",
      
      stock:
        item.variants?.reduce(
        (sum: number, v: any) => sum + v.stock,
        0
      ) ?? 0,

      rating: 5,

      reviewCount: 0,

      featured: item.featured,

      newArrival: item.newArrival,

      customizable: true,

      badge: item.newArrival ? "New" : undefined,

      colors:
        item.variants?.map((v: any) => ({
        name: v.color,
        hex: "#000000",
      })) ?? [],

      sizes:
        item.variants?.map((v: any) => ({
        label: v.size,
        inStock: v.stock > 0,
      })) ?? [],

    images: [],

    popularity: 0,

    createdAt: item.created_at,
    }));
  },

  async getFeatured(): Promise<Product[]> {
    const res = await apiClient.get('/catalog/designs/featured/');
    return res.data as Product[];
  },

  async getNewArrivals(): Promise<Product[]> {
    const res = await apiClient.get('/catalog/designs/new-arrivals/');
    return res.data as Product[];
  },

  async getProduct(id: number): Promise<Product | null> {
    try {
      const res = await apiClient.get(`/catalog/designs/${id}/`);
      return res.data as Product;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async listCollections(): Promise<Collection[]> {
    const res = await apiClient.get("/catalog/categories/");

    return res.data.map((item: any) => ({
      id: String(item.id),
      slug: item.slug,
      name: item.name,
      description: item.description,
      longDescription: item.description,

      image: item.image, 

      itemCount: item.designs?.length ?? 0,

      pattern: "textile",
    }));
  },

  async getCollection(slug: string): Promise<Collection | null> {
     try {
      const res = await apiClient.get(`/catalog/categories/${slug}/`);

      const item = res.data;

      return {
        id: String(item.id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        longDescription: item.description,

        image: item.image,

        itemCount: item.designs?.length ?? 0,

        pattern: "textile",
      };
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async getProductsByCollection(slug: string): Promise<Product[]> {
    const res = await apiClient.get(`/catalog/categories/${slug}/designs/`);
    return res.data as Product[];
  },

  async getBoutiqueCreations(): Promise<Product[]> {
    const res = await apiClient.get('/catalog/designs/boutique-creations/');
    return res.data as Product[];
  },
};
