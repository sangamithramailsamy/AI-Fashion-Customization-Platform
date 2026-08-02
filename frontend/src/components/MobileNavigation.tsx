import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, Heart, ShoppingBag, Bell, User, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/config/site';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

interface Props {
  onClose: () => void;
  onSearch?: () => void;
}

export default function MobileNavigation({ onClose, onSearch }: Props) {
  const location = useLocation();
  const { wishlist, cartCount, notifications } = useShop();
  const { user } = useAuth();

  const actions = [
    { label: 'Search', icon: Search, to: '/shop' },
    { label: 'Wishlist', icon: Heart, count: wishlist.length, to: '/wishlist' },
    { label: 'Cart', icon: ShoppingBag, count: cartCount, to: '/cart' },
    { label: 'Alerts', icon: Bell, count: notifications, to: '/account/notifications' },
    { label: 'Account', icon: User, to: user ? '/account' : '/login' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] lg:hidden"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
        className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-token border-r border-token flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-token">
          <BrandLogo size="sm" />
          <button onClick={onClose} aria-label="Close menu" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item, i) => {
              const active = location.pathname === item.path;
              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`block py-3 font-display text-2xl border-b border-token/50 transition-colors ${
                      active ? 'text-primary' : 'text-token hover:text-primary'
                    }`}
                  >
                    <span className="font-body text-xs text-muted mr-3">0{i + 1}</span>
                    {item.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="px-5 py-4 border-t border-token">
          <div className="grid grid-cols-5 gap-1 mb-4">
            {actions.map(({ label, icon: Icon, count, to }) => {
              const inner = (
                <>
                  <Icon size={18} strokeWidth={1.6} />
                  <span className="font-body text-[9px] uppercase tracking-wide">{label}</span>
                  {count && count > 0 ? (
                    <span className="absolute top-1 right-3 min-w-[14px] h-3.5 px-1 rounded-full text-[8px] flex items-center justify-center" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                      {count}
                    </span>
                  ) : null}
                </>
              );
              if (label === 'Search' && onSearch) {
                return (
                  <button
                    key={label}
                    aria-label={label}
                    onClick={() => {
                      onClose();
                      onSearch();
                    }}
                    className="relative flex flex-col items-center gap-1 py-2 text-token hover:text-primary transition-colors"
                  >
                    {inner}
                  </button>
                );
              }
              return to ? (
                <Link key={label} to={to} aria-label={label} onClick={onClose} className="relative flex flex-col items-center gap-1 py-2 text-token hover:text-primary transition-colors">
                  {inner}
                </Link>
              ) : (
                <button key={label} aria-label={label} onClick={onClose} className="relative flex flex-col items-center gap-1 py-2 text-token hover:text-primary transition-colors">
                  {inner}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-token">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
