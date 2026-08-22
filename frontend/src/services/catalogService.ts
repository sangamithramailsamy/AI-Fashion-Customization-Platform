import apiClient from './apiClient';
import type { Product, Collection } from '@/types';

/**
 * Convert Django Design response → Frontend Product
 *
 * Current backend structure:
 * section       = Traditional / Ethnic / Western / etc.
 * section_slug  = traditional / ethnic / western / etc.
 */
function mapProduct(item: any): Product {
  const variants = Array.isArray(item.variants)
    ? item.variants
    : [];

  const stock = variants.reduce(
    (sum: number, variant: any) =>
      sum + Number(variant.stock || 0),
    0
  );

  const newArrival =
    item.newArrival ??
    item.is_new_arrival ??
    false;

  const featured =
    item.featured ??
    item.is_featured ??
    false;

  const active =
    item.active ??
    item.is_active ??
    false;

  const customizable =
    item.customizable ??
    item.is_customizable ??
    false;

  return {
    id: item.id,

    name: item.name,

    description: item.description ?? '',

    price: Number(
      item.price ??
      item.base_price ??
      0
    ),

    originalPrice: Number(
      item.base_price ??
      item.price ??
      0
    ),

    image:
      item.image ||
      item.thumbnail ||
      '',

    category:
      item.section ??
      item.category ??
      'Boutique Creation',

    collection:
      item.section_slug ??
      item.collection ??
      item.collection_slug ??
      '',

    stock,

    rating: 5,

    reviewCount: 0,

    featured,

    newArrival,

    customizable,

    active,

    badge: newArrival
      ? 'New'
      : undefined,

    colors: variants
      .filter((v: any) => v.color)
      .map((v: any) => ({
        name: v.color,
        hex: '#000000',
      })),

    sizes: variants.map((v: any) => ({
      label: v.size,
      inStock:
        Number(v.stock || 0) > 0,
    })),

    /*
     * IMPORTANT
     *
     * Keep the complete variant information.
     *
     * Example:
     * XS + Cream → variant ID 47
     */
    variants: variants.map((v: any) => ({
      id: Number(v.id),
      size: v.size,
      color: v.color,
      stock: Number(v.stock || 0),
      price: Number(
        v.price ??
        item.price ??
        item.base_price ??
        0
      ),
      sku: v.sku ?? '',
      isActive:
        v.is_active ?? true,
    })),

    images:
      item.images ?? [],

    popularity: 0,

    createdAt:
      item.created_at ??
      item.createdAt,
  };
}

export const catalogService = {

  // --------------------------------------------------
  // ALL PRODUCTS — SHOP
  // --------------------------------------------------

  async listProducts(): Promise<Product[]> {
    const res = await apiClient.get(
      '/catalog/designs/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map(mapProduct);
  },

  // --------------------------------------------------
  // FEATURED PRODUCTS
  // --------------------------------------------------

  async getFeatured(): Promise<Product[]> {
    const res = await apiClient.get(
      '/catalog/designs/featured/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map(mapProduct);
  },

  // --------------------------------------------------
  // NEW ARRIVALS
  // --------------------------------------------------

  async getNewArrivals(): Promise<Product[]> {
    const res = await apiClient.get(
      '/catalog/designs/new-arrivals/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map(mapProduct);
  },

  // --------------------------------------------------
  // SINGLE PRODUCT
  // --------------------------------------------------

  async getProduct(
    id: number
  ): Promise<Product | null> {
    try {
      const res = await apiClient.get(
        `/catalog/designs/${id}/`
      );

      return mapProduct(res.data);

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },

  // --------------------------------------------------
  // COLLECTIONS / SECTIONS
  // --------------------------------------------------

  async listCollections(): Promise<Collection[]> {
    const res = await apiClient.get(
      '/catalog/sections/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map((item: any) => ({
      id: String(item.id),

      slug: item.slug,

      name: item.name,

      description:
        item.description ?? '',

      longDescription:
        item.description ?? '',

      image:
        item.image ||
        item.cover_image ||
        '',

      itemCount:
        item.item_count ??
        0,

      pattern: 'textile',
    }));
  },

  // --------------------------------------------------
  // SINGLE COLLECTION
  // --------------------------------------------------

  async getCollection(
    slug: string
  ): Promise<Collection | null> {
    try {

      const res = await apiClient.get(
        '/catalog/sections/'
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results ?? [];

      const item = data.find(
        (section: any) =>
          section.slug === slug
      );

      if (!item) {
        return null;
      }

      return {
        id: String(item.id),

        slug: item.slug,

        name: item.name,

        description:
          item.description ?? '',

        longDescription:
          item.description ?? '',

        image:
          item.image ||
          item.cover_image ||
          '',

        itemCount:
          item.item_count ??
          0,

        pattern: 'textile',
      };

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },

  // --------------------------------------------------
  // PRODUCTS BY COLLECTION
  // --------------------------------------------------

  async getProductsByCollection(
    slug: string
  ): Promise<Product[]> {

    const res = await apiClient.get(
      `/catalog/designs/?collection=${encodeURIComponent(
        slug
      )}`
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map(mapProduct);
  },

  // --------------------------------------------------
  // BOUTIQUE CREATIONS
  // --------------------------------------------------

  async getBoutiqueCreations(): Promise<Product[]> {

    const res = await apiClient.get(
      '/catalog/designs/boutique-creations/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results ?? [];

    return data.map(mapProduct);
  },
};