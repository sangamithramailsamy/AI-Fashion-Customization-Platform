import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, Bell, User, Menu, Shield } from 'lucide-react';
import { NAV_ITEMS } from '@/config/site';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import MobileNavigation from './MobileNavigation';
import SearchOverlay from './SearchOverlay';

function IconBadge({ count, children }: { count?: number; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      {children}
      {count && count > 0 ? (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-body font-medium flex items-center justify-center"
          style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
        >
          {count}
        </span>
      ) : null}
    </span>
  );
}

export default function Navbar() {
  const { wishlist, cartCount } = useShop();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-token/85 backdrop-blur-md border-b border-token' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: mobile menu + logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors"
              >
                <Menu size={22} strokeWidth={1.6} />
              </button>
              <BrandLogo size="sm" />
            </div>

            {/* Center: nav */}
            <ul className="hidden lg:flex items-center gap-7">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`relative font-body text-sm tracking-wide transition-colors ${
                        active ? 'text-primary' : 'text-token hover:text-primary'
                      }`}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute -bottom-1.5 left-0 right-0 h-px"
                          style={{ background: 'var(--primary)' }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button aria-label="Search" onClick={() => setSearchOpen(true)} className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors">
                <Search size={18} strokeWidth={1.6} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:flex h-9 w-9 items-center justify-center text-token hover:text-primary transition-colors">
                <IconBadge count={wishlist.length}>
                  <Heart size={18} strokeWidth={1.6} />
                </IconBadge>
              </Link>
              <Link to="/cart" aria-label="Cart" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors">
                <IconBadge count={cartCount}>
                  <ShoppingBag size={18} strokeWidth={1.6} />
                </IconBadge>
              </Link>
              <Link to="/account/notifications" aria-label="Notifications" className="hidden sm:flex h-9 w-9 items-center justify-center text-token hover:text-primary transition-colors">
                <IconBadge count={unreadCount}>
                  <Bell size={18} strokeWidth={1.6} />
                </IconBadge>
              </Link>
              <Link to={user ? '/account' : '/login'} aria-label="Account" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors">
                <User size={18} strokeWidth={1.6} />
              </Link>
              <Link to="/owner/login" aria-label="Owner Login" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors" title="Owner Portal">
                <Shield size={18} strokeWidth={1.6} />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && <MobileNavigation onClose={() => setMobileOpen(false)} onSearch={() => setSearchOpen(true)} />}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
