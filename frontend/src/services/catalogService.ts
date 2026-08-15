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

    image: item.image || item.thumbnail,

    category: item.category ?? "Boutique Creation",

    collection:
      item.collection ??
      item.collection_slug ??
      item.category?.section?.slug ??
      "",

    stock:
      item.variants?.reduce(
        (sum: number, v: any) => sum + Number(v.stock || 0),
        0
      ) ?? 0,

    rating: 5,
    reviewCount: 0,

    // Django → Frontend mapping
    featured: item.is_featured ?? item.featured ?? false,

    newArrival: item.is_new_arrival ?? item.newArrival ?? false,

    customizable: item.is_customizable ?? true,

    badge:
      item.is_new_arrival ?? item.newArrival
        ? "New"
        : undefined,

    colors:
      item.variants?.map((v: any) => ({
        name: v.color,
        hex: "#000000",
      })) ?? [],

    sizes:
      item.variants?.map((v: any) => ({
        label: v.size,
        inStock: Number(v.stock || 0) > 0,
      })) ?? [],

    images: item.images ?? [],

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

  return res.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,

    price: Number(item.price),
    originalPrice: Number(item.base_price ?? item.price),

    image: item.image || item.thumbnail,

    category: "Boutique Creation",

    collection:
      item.category_slug ??
      item.category?.slug ??
      "",

    stock:
      item.variants?.reduce(
        (sum: number, v: any) => sum + Number(v.stock || 0),
        0
      ) ?? 0,

    rating: 5,
    reviewCount: 0,

    featured:
      item.featured ??
      item.is_featured ??
      false,

    newArrival:
      item.newArrival ??
      item.is_new_arrival ??
      false,

    customizable: true,

    badge:
      (item.newArrival ?? item.is_new_arrival)
        ? "New"
        : undefined,

    colors:
      item.variants?.map((v: any) => ({
        name: v.color,
        hex: "#000000",
      })) ?? [],

    sizes:
      item.variants?.map((v: any) => ({
        label: v.size,
        inStock: Number(v.stock || 0) > 0,
      })) ?? [],

    images: item.images ?? [],

    popularity: 0,

    createdAt: item.created_at,
  }));
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
  const res = await apiClient.get("/catalog/sections/");

  return res.data.map((item: any) => ({
    id: String(item.id),
    slug: item.slug,
    name: item.name,
    description: item.description,
    longDescription: item.description,

    image: item.image || item.cover_image,

    itemCount: item.item_count ?? 0,

    pattern: "textile",
  }));
},

  async getCollection(slug: string): Promise<Collection | null> {
     try {
      const res = await apiClient.get('/catalog/sections/');

      const item = res.data;

      return {
        id: String(item.id),
        slug: item.slug,
        name: item.name,
        description: item.description,
        longDescription: item.description,

        image: item.image,

        itemCount: item.design_count ?? 0,

        pattern: "textile",
      };
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async getProductsByCollection(slug: string): Promise<Product[]> {
  const res = await apiClient.get(
    `/catalog/designs/?collection=${encodeURIComponent(slug)}`
  );

  return res.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,

    price: Number(item.price),
    originalPrice: Number(item.base_price ?? item.price),

    image: item.image || item.thumbnail,

    category: item.category ?? "Boutique Creation",

    collection: item.collection ?? slug,

    stock:
      item.variants?.reduce(
        (sum: number, v: any) => sum + Number(v.stock || 0),
        0
      ) ?? 0,

    rating: 5,
    reviewCount: 0,

    featured: item.featured ?? item.is_featured ?? false,

    newArrival:
      item.newArrival ?? item.is_new_arrival ?? false,

    customizable:
      item.customizable ?? item.is_customizable ?? true,

    badge:
      (item.newArrival ?? item.is_new_arrival)
        ? "New"
        : undefined,

    colors:
      item.variants?.map((v: any) => ({
        name: v.color,
        hex: "#000000",
      })) ?? [],

    sizes:
      item.variants?.map((v: any) => ({
        label: v.size,
        inStock: Number(v.stock || 0) > 0,
      })) ?? [],

    images: item.images ?? [],

    popularity: 0,

    createdAt: item.created_at,
  }));
},

  async getBoutiqueCreations(): Promise<Product[]> {
    const res = await apiClient.get('/catalog/designs/boutique-creations/');
    return res.data as Product[];
  },
};
