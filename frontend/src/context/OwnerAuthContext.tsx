import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ownerAuthService } from '@/services/ownerService';

interface OwnerUser {
  id: number;
  fullName: string;
  email: string;
  role: 'owner';
}

interface OwnerAuthState {
  user: OwnerUser | null;
  loading: boolean;
  role: 'owner' | null;
  login: (email: string, password: string) => Promise<OwnerUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<OwnerUser | null>;
}

const OwnerAuthContext = createContext<OwnerAuthState | undefined>(undefined);

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OwnerUser | null>(() => ownerAuthService.me());
  const [loading, setLoading] = useState(true);

  // Restore session on mount (survives page refresh)
  useEffect(() => {
    let active = true;
    ownerAuthService
      .refreshUser()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await ownerAuthService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await ownerAuthService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await ownerAuthService.refreshUser();
    setUser(u);
    return u;
  }, []);

  return (
    <OwnerAuthContext.Provider value={{ user, loading, role: user ? 'owner' : null, login, logout, refreshUser }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth(): OwnerAuthState {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) throw new Error('useOwnerAuth must be used within OwnerAuthProvider');
  return ctx;
}
