import apiClient from './apiClient';
import type { Product, Collection } from '@/types';

/**
 * Catalog service — fetches products, collections, and sections from the
 * Django REST backend. Replaces the static mockData module.
 */

export const catalogService = {
  async listProducts(): Promise<Product[]> {
    const res = await apiClient.get('/catalog/designs/');
    return res.data as Product[];
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
    const res = await apiClient.get('/catalog/categories/');
    return res.data as Collection[];
  },

  async getCollection(slug: string): Promise<Collection | null> {
    try {
      const res = await apiClient.get(`/catalog/categories/${slug}/`);
      return res.data as Collection;
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
