import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Ruler, MapPin, ShoppingBag, Heart,
  Bell, Star, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';
import BrandLogo from '@/components/BrandLogo';

interface NavEntry {
  to: string;
  label: string;
  icon: typeof User;
}

const ACCOUNT_NAV: NavEntry[] = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/measurements', label: 'Measurements', icon: Ruler },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/reviews', label: 'Reviews', icon: Star },
];

export default function AccountLayout() {
  const { user, logout, loading } = useAuth();
  const { wishlist } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="px-2 pb-4 mb-4 border-b border-token">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Account</p>
        <p className="font-display text-xl text-token mt-1 truncate">{user?.fullName ?? 'Member'}</p>
        <p className="font-body text-xs text-muted truncate">{user?.email}</p>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {ACCOUNT_NAV.map((entry) => {
            const isOverview = entry.to === '/account';
            const active = isOverview
              ? location.pathname === '/account'
              : location.pathname.startsWith(entry.to);
            const Icon = entry.icon;
            const showBadge = entry.label === 'Wishlist' && wishlist.length > 0;
            return (
              <li key={entry.to}>
                <NavLink
                  to={entry.to}
                  end={isOverview}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors ${
                    active ? 'text-primary' : 'text-token hover:text-primary'
                  }`}
                >
                  <Icon size={17} strokeWidth={1.6} />
                  <span>{entry.label}</span>
                  {showBadge && (
                    <span className="ml-auto h-5 min-w-[20px] px-1 rounded-full text-[10px] flex items-center justify-center" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                      {wishlist.length}
                    </span>
                  )}
                  {active && !showBadge && <ChevronRight size={14} className="ml-auto" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="pt-4 border-t border-token">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 font-body text-sm text-token hover:text-primary transition-colors w-full">
          <LogOut size={17} strokeWidth={1.6} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <BrandLogo size="sm" />
          <button onClick={() => setDrawerOpen(true)} aria-label="Open account menu" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary">
            <Menu size={20} />
          </button>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <div className="bg-surface border border-token p-5 flex flex-col h-[calc(100vh-7rem)]">
              <SidebarContent />
            </div>
          </aside>

          {/* Content */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[80] lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-token border-r border-token flex flex-col p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <BrandLogo size="sm" />
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
                  <X size={22} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
