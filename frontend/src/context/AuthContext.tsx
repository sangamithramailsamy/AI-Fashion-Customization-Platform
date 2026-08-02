import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, extractError } from '@/services/authService';
import type { AuthUser, LoginPayload, RegisterPayload, UserRole } from '@/types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount (survives page refresh)
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.login(payload);
      setUser(u);
      return u;
    } catch (e: any) {
      const apiErr = extractError(e);
      setError(apiErr.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.register(payload);
      setUser(u);
      return u;
    } catch (e: any) {
      const apiErr = extractError(e);
      setError(apiErr.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authService.refreshUser();
    setUser(u);
    return u;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const role: UserRole | null = user?.role ?? null;

  const value: AuthState = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    role,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
