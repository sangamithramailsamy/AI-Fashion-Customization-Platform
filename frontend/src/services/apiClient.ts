import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import {
  API_CONFIG,
  getAccessToken, getRefreshToken, setTokens, clearTokens,
  getOwnerAccessToken, getOwnerRefreshToken, setOwnerTokens, clearOwnerTokens,
} from './apiConfig';

/**
 * Centralized Axios client for the Django REST Framework backend.
 *
 * - Base URL configured from API_CONFIG
 * - JSON content-type headers
 * - Request timeout
 * - Request interceptor: attaches Authorization: Bearer <access_token>
 * - Response interceptor: on 401, attempts token refresh and retries
 */

// Track which token set to use for a given request
const OWNER_FLAG = '__ownerRequest';

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---- Request interceptor: attach Bearer token ----
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isOwner = (config as any)[OWNER_FLAG] === true;
  const token = isOwner ? getOwnerAccessToken() : getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response interceptor: auto refresh on 401 ----
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let isOwnerRefreshing = false;
let ownerRefreshPromise: Promise<string | null> | null = null;

async function refreshCustomerToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_CONFIG.baseURL}auth/token/refresh/`, { refresh });
    const newAccess = res.data.access as string;
    const newRefresh = (res.data.refresh as string) ?? refresh;
    setTokens(newAccess, newRefresh);
    return newAccess;
  } catch {
    clearTokens();
    return null;
  }
}

async function refreshOwnerToken(): Promise<string | null> {
  const refresh = getOwnerRefreshToken();
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_CONFIG.baseURL}auth/token/refresh/`, { refresh });
    const newAccess = res.data.access as string;
    const newRefresh = (res.data.refresh as string) ?? refresh;
    setOwnerTokens(newAccess, newRefresh);
    return newAccess;
  } catch {
    clearOwnerTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isOwner = (originalRequest as any)[OWNER_FLAG] === true;

    // Avoid refresh loop for the refresh endpoint itself
    if (originalRequest.url?.includes('token/refresh/')) {
      if (isOwner) clearOwnerTokens();
      else clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isOwner) {
      if (!isOwnerRefreshing) {
        isOwnerRefreshing = true;
        ownerRefreshPromise = refreshOwnerToken().finally(() => {
          isOwnerRefreshing = false;
        });
      }
      const newToken = await ownerRefreshPromise;
      if (!newToken) return Promise.reject(error);
      (originalRequest as any).headers = (originalRequest as any).headers ?? {};
      (originalRequest as any).headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    }

    // Customer token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshCustomerToken().finally(() => {
        isRefreshing = false;
      });
    }
    const newToken = await refreshPromise;
    if (!newToken) return Promise.reject(error);
    (originalRequest as any).headers = (originalRequest as any).headers ?? {};
    (originalRequest as any).headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  },
);

/**
 * Wrapper for owner-authenticated requests. Sets a flag so the interceptor
 * knows to use owner tokens instead of customer tokens.
 */
export function ownerRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  (config as any)[OWNER_FLAG] = true;
  return apiClient(config).then((res) => res.data);
}

export default apiClient;
