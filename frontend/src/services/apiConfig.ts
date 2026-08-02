/**
 * Centralized API configuration for the Django REST Framework backend.
 */

export const API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000/api/',
  tokenKeys: {
    access: 'shreemithra-access',
    refresh: 'shreemithra-refresh',
    user: 'shreemithra-user',
  },
  ownerTokenKeys: {
    access: 'shreemithra-owner-access',
    refresh: 'shreemithra-owner-refresh',
    user: 'shreemithra-owner-user',
  },
  timeout: 15000,
} as const;

export function isMockMode(): boolean {
  return !API_CONFIG.baseURL;
}

export function mockDelay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function endpoint(path: string): string {
  return `${API_CONFIG.baseURL}${path}`;
}

// ---- Token storage helpers (customer) ----

export function getAccessToken(): string | null {
  return localStorage.getItem(API_CONFIG.tokenKeys.access);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(API_CONFIG.tokenKeys.refresh);
}
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(API_CONFIG.tokenKeys.access, access);
  localStorage.setItem(API_CONFIG.tokenKeys.refresh, refresh);
}
export function clearTokens(): void {
  localStorage.removeItem(API_CONFIG.tokenKeys.access);
  localStorage.removeItem(API_CONFIG.tokenKeys.refresh);
  localStorage.removeItem(API_CONFIG.tokenKeys.user);
}

export function getStoredUser<T>(): T | null {
  try {
    const raw = localStorage.getItem(API_CONFIG.tokenKeys.user);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function setStoredUser<T>(user: T): void {
  localStorage.setItem(API_CONFIG.tokenKeys.user, JSON.stringify(user));
}

// ---- Token storage helpers (owner) ----

export function getOwnerAccessToken(): string | null {
  return localStorage.getItem(API_CONFIG.ownerTokenKeys.access);
}
export function getOwnerRefreshToken(): string | null {
  return localStorage.getItem(API_CONFIG.ownerTokenKeys.refresh);
}
export function setOwnerTokens(access: string, refresh: string): void {
  localStorage.setItem(API_CONFIG.ownerTokenKeys.access, access);
  localStorage.setItem(API_CONFIG.ownerTokenKeys.refresh, refresh);
}
export function clearOwnerTokens(): void {
  localStorage.removeItem(API_CONFIG.ownerTokenKeys.access);
  localStorage.removeItem(API_CONFIG.ownerTokenKeys.refresh);
  localStorage.removeItem(API_CONFIG.ownerTokenKeys.user);
}

export function getStoredOwnerUser<T>(): T | null {
  try {
    const raw = localStorage.getItem(API_CONFIG.ownerTokenKeys.user);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function setStoredOwnerUser<T>(user: T): void {
  localStorage.setItem(API_CONFIG.ownerTokenKeys.user, JSON.stringify(user));
}
