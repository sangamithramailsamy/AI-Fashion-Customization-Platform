import apiClient from './apiClient';
import {
  API_CONFIG,
  getAccessToken, getRefreshToken, setTokens, clearTokens,
  getStoredUser, setStoredUser,
} from './apiConfig';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types';

/**
 * Customer authentication service backed by Django SimpleJWT.
 *
 * - POST /auth/login/         → { access, refresh, user }
 * - POST /auth/register/      → user object
 * - POST /auth/token/refresh/ → { access, refresh }
 * - GET  /auth/me/            → current user profile
 */

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

function extractError(err: any): ApiError {
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string') return { message: data };
    if (data.detail) return { message: String(data.detail), errors: data };
    if (data.message) return { message: String(data.message), errors: data };
    // DRF validation errors: { field: ['msg'] }
    const fieldErrors: Record<string, string[]> = {};
    let message = 'Please fix the errors below.';
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        fieldErrors[key] = val.map(String);
      } else if (typeof val === 'string') {
        fieldErrors[key] = [val];
      }
    }
    if (Object.keys(fieldErrors).length) {
      const firstKey = Object.keys(fieldErrors)[0];
      message = fieldErrors[firstKey][0];
    }
    return { message, errors: fieldErrors };
  }
  if (err.request) return { message: 'Network error. Please check your connection.' };
  return { message: err.message ?? 'Something went wrong. Please try again.' };
}

export { extractError };

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await apiClient.post('/auth/login/', {
      username: payload.email,
      password: payload.password,
    });
    const { access, refresh, user } = res.data as {
      access: string;
      refresh: string;
      user: AuthUser;
    };
    setTokens(access, refresh);
    const authUser: AuthUser = { ...user, role: user.role ?? 'customer' };
    setStoredUser(authUser);
    return authUser;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await apiClient.post('/auth/register/', {
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    // If the backend returns tokens on registration, use them; otherwise log in.
    if (res.data?.access && res.data?.refresh) {
      setTokens(res.data.access, res.data.refresh);
      const user: AuthUser = { ...res.data.user, role: res.data.user.role ?? 'customer' };
      setStoredUser(user);
      return user;
    }
    // Fall back to login if registration doesn't return tokens
    return authService.login({ email: payload.email, password: payload.password });
  },

  async me(): Promise<AuthUser | null> {
    if (!getAccessToken()) {
      // Try to restore from stored user (session persistence)
      return getStoredUser<AuthUser>();
    }
    try {
      const res = await apiClient.get('/auth/me/');
      const user: AuthUser = { ...res.data, role: res.data.role ?? 'customer' };
      setStoredUser(user);
      return user;
    } catch {
      // If token expired and refresh failed, fall back to stored user
      return getStoredUser<AuthUser>();
    }
  },

  async refreshUser(): Promise<AuthUser | null> {
    return authService.me();
  },

  async logout(): Promise<void> {
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await apiClient.post('/auth/logout/', { refresh }).catch(() => {});
      }
    } finally {
      clearTokens();
    }
  },
};
