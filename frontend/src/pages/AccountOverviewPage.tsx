import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ruler, MapPin, ShoppingBag, Heart, Bell, ArrowRight,
  Check, AlertCircle, Star, Truck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { useShop } from '@/context/ShopContext';
import { useOrders } from '@/context/OrderContext';
import { useNotifications } from '@/context/NotificationContext';
import { getStatusLabel } from '@/data/orderData';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { profile, hasMeasurements, defaultAddress } = useCustomer();
  const { wishlist } = useShop();
  const { orders } = useOrders();
  const { notifications, unreadCount } = useNotifications();
  const firstName =
  user?.fullName
    ? user.fullName.split(' ')[0]
    : user?.username
    ? user.username
    : user?.email
    ? user.email.split('@')[0]
    : 'Member';

  const recentOrders = orders.slice(0, 2);
  const pendingReviewCount = orders
    .filter((o) => o.status === 'DELIVERED')
    .flatMap((o) => o.items)
    .length;

  const cards = [
    {
      to: '/account/measurements',
      label: 'Measurement Profile',
      icon: Ruler,
      done: hasMeasurements,
      status: hasMeasurements ? 'Saved' : 'Not yet added',
      hint: hasMeasurements ? 'Update anytime' : 'Add measurements for custom pieces',
    },
    {
      to: '/account/addresses',
      label: 'Default Address',
      icon: MapPin,
      done: Boolean(defaultAddress),
      status: defaultAddress ? `${defaultAddress.city}, ${defaultAddress.state}` : 'Not yet added',
      hint: defaultAddress ? defaultAddress.pincode : 'Add an address for faster checkout',
    },
    {
      to: '/account/orders',
      label: 'Recent Orders',
      icon: ShoppingBag,
      done: orders.length > 0,
      status: orders.length > 0 ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : 'No orders yet',
      hint: orders.length > 0 ? 'View and track your orders' : 'Your orders will appear here',
    },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      done: wishlist.length > 0,
      status: `${wishlist.length} saved`,
      hint: wishlist.length > 0 ? 'Tap to view' : 'Save pieces you love',
    },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Overview</p>
        <h1 className="font-display text-3xl md:text-4xl text-token">Welcome, {firstName}</h1>
        <p className="font-body text-sm text-muted mt-2">
          {profile?.email ?? user?.email} · Member since 2025
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link to={c.to} className="block bg-surface border border-token p-5 h-full hover:border-primary transition-colors group">
                <div className="flex items-start justify-between">
                  <span className="h-10 w-10 flex items-center justify-center border border-token" style={{ color: 'var(--anim-bronze)' }}>
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  {c.done ? (
                    <span className="inline-flex items-center gap-1 font-body text-xs" style={{ color: 'var(--anim-olive)' }}>
                      <Check size={13} /> {c.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-body text-xs text-muted">
                      <AlertCircle size={13} /> {c.status}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-token mt-4">{c.label}</h3>
                <p className="font-body text-sm text-muted mt-1">{c.hint}</p>
                <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.15em] text-muted group-hover:text-primary transition-colors mt-4">
                  Manage <ArrowRight size={13} />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mt-6 bg-surface border border-token p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-token">Recent Orders</h3>
            <Link to="/account/orders" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link to={`/account/orders/${order.id}`} className="flex items-center gap-3 py-2 border-t border-token hover:text-primary transition-colors group">
                  <div className="flex -space-x-2 shrink-0">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <img key={idx} src={item.productImage} alt={item.productName} className="w-10 h-12 object-cover bg-token-alt border-2" style={{ height: '3rem', borderColor: 'var(--surface)' }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-token group-hover:text-primary transition-colors">{order.orderNumber}</p>
                    <p className="font-body text-xs text-muted">{getStatusLabel(order.status)}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Notifications shortcut */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6 bg-surface border border-token p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 flex items-center justify-center border border-token" style={{ color: 'var(--anim-bronze)' }}>
              <Bell size={18} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="font-display text-xl text-token">Notifications</h3>
              <p className="font-body text-xs text-muted">{unreadCount} unread</p>
            </div>
          </div>
          <Link to="/account/notifications" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <ul className="space-y-2.5">
          {notifications.slice(0, 2).map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-2 border-t border-token">
              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />}
              <div className={n.read ? 'pl-5' : ''}>
                <p className="font-display text-base text-token">{n.title}</p>
                <p className="font-body text-xs text-muted mt-0.5 line-clamp-1">{n.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Reviews shortcut */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36 }}
        className="mt-6 bg-surface border border-token p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 flex items-center justify-center border border-token" style={{ color: 'var(--anim-bronze)' }}>
              <Star size={18} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="font-display text-xl text-token">Your Reviews</h3>
              <p className="font-body text-xs text-muted">
                {pendingReviewCount > 0 ? `${pendingReviewCount} pending review` : 'Manage your published reviews'}
              </p>
            </div>
          </div>
          <Link to="/account/reviews" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
            View <ArrowRight size={13} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
