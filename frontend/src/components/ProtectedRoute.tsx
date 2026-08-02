import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOwnerAuth } from '@/context/OwnerAuthContext';

/**
 * Protects customer-only routes. Redirects to /login if unauthenticated.
 * Prevents owners from entering customer pages.
 */
export function CustomerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // Block owners from customer pages
  if (role === 'owner') return <Navigate to="/owner" replace />;
  return <>{children}</>;
}

/**
 * Protects owner-only routes. Redirects to /owner/login if unauthenticated.
 * Prevents customers from entering owner pages.
 */
export function OwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useOwnerAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
