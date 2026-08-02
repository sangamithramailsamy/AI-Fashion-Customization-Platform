import type { Product } from '@/types';

/**
 * Centralized API client for future Django REST Framework integration.
 * Endpoints are intentionally NOT wired here — this is the seam where the
 * Django backend will be plugged in during a later phase.
 */
export const API_BASE_URL = ''; // e.g. https://api.shreemithra.com/api/v1

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: () => apiRequest<Product[]>('/products/'),
    featured: () => apiRequest<Product[]>('/products/featured/'),
    newArrivals: () => apiRequest<Product[]>('/products/new-arrivals/'),
  },
  collections: {
    list: () => apiRequest<unknown[]>('/collections/'),
  },
};
