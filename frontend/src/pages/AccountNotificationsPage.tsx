import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, Check, Trash2, Ruler, Tag, Info, ShoppingBag,
  CreditCard, Scissors, Truck, Star, ArrowRight,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import type { NotificationType } from '@/types';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  order: ShoppingBag,
  payment: CreditCard,
  production: Scissors,
  delivery: Truck,
  review: Star,
  measurement: Ruler,
  promotion: Tag,
  system: Info,
};

const TYPE_LABEL: Record<NotificationType, string> = {
  order: 'Order',
  payment: 'Payment',
  production: 'Production',
  delivery: 'Delivery',
  review: 'Review',
  measurement: 'Measurements',
  promotion: 'Boutique',
  system: 'General',
};

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AccountNotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Notifications</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Your Notifications</h1>
          <p className="font-body text-sm text-muted mt-2">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-surface border border-token p-10 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
            <Bell size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl text-token">No notifications</h2>
          <p className="font-body text-sm text-muted mt-2">Updates about your orders, payments and measurements will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3 }}
                  className={`bg-surface border border-token p-4 flex items-start gap-4 ${!n.read ? 'border-l-2' : ''}`}
                  style={!n.read ? { borderLeftColor: 'var(--primary)' } : {}}
                >
                  <span className="h-10 w-10 flex items-center justify-center border border-token shrink-0" style={{ color: 'var(--anim-bronze)' }}>
                    <Icon size={17} strokeWidth={1.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg text-token">{n.title}</h3>
                      {!n.read && <span className="h-2 w-2 rounded-full" style={{ background: 'var(--primary)' }} />}
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-body border border-token text-muted">{TYPE_LABEL[n.type]}</span>
                    </div>
                    <p className="font-body text-sm text-muted mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="font-body text-xs text-muted">{fmtRelative(n.createdAt)}</p>
                      {n.action && (
                        <Link
                          to={n.action.to}
                          onClick={() => markRead(n.id)}
                          className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.15em] text-primary hover:underline"
                        >
                          {n.action.label} <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} aria-label="Mark as read" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} aria-label="Delete notification" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
