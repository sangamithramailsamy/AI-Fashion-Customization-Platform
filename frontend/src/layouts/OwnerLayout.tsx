import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Store, Package, ShoppingBag, Users, UserCog, 
  Boxes, Scissors, CreditCard, Star, Bell, LogOut, Menu, X, 
  ChevronRight, ArrowLeft, BarChart3, TicketPercent,
} from 'lucide-react';
import { useOwnerAuth } from '@/context/OwnerAuthContext';
import BrandLogo from '@/components/BrandLogo';

interface NavEntry {
  to: string;
  label: string;
  icon: typeof Store;
  reserved?: boolean;
}

const OWNER_NAV: NavEntry[] = [
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/boutique', label: 'Boutique', icon: Store },
  { to: '/owner/products', label: 'Products', icon: Package },
  { to: '/owner/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/owner/customers', label: 'Customers', icon: Users },
  { to: '/owner/employees', label: 'Employees', icon: UserCog },
  { to: '/owner/inventory', label: 'Inventory', icon: Boxes },
  { to: '/owner/production', label: 'Production', icon: Scissors },
  { to: '/owner/coupons', label: 'Coupons', icon: TicketPercent,},
  { to: '/owner/payments', label: 'Payments', icon: CreditCard },
  { to: '/owner/reviews', label: 'Reviews', icon: Star },
  { to: '/owner/notifications', label: 'Notifications', icon: Bell },
  { to: '/owner/reports', label: 'Reports', icon: BarChart3 },
];

export default function OwnerLayout() {
  const { user, logout, loading } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />;

  const handleLogout = async () => {
    await logout();
    navigate('/owner/login');
  };

  const SidebarContent = () => (
    <>
      <div className="px-2 pb-4 mb-4 border-b border-token">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Owner Portal</p>
        <p className="font-display text-lg text-token mt-1 truncate">{user.fullName}</p>
        <p className="font-body text-xs text-muted truncate">{user.email}</p>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {OWNER_NAV.map((entry) => {
            const isOverview = entry.to === '/owner';
            const active = isOverview
              ? location.pathname === '/owner'
              : location.pathname.startsWith(entry.to);
            const Icon = entry.icon;
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
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="pt-4 border-t border-token space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 font-body text-sm text-token hover:text-primary transition-colors w-full">
          <ArrowLeft size={17} strokeWidth={1.6} /> Back to Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 font-body text-sm text-token hover:text-primary transition-colors w-full">
          <LogOut size={17} strokeWidth={1.6} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-token">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <BrandLogo size="sm" />
          <button onClick={() => setDrawerOpen(true)} aria-label="Open owner menu" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary">
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
