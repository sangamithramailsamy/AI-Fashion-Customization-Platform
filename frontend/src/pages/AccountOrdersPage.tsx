import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, ArrowRight, Package, Truck, Star, RefreshCw,
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { useReviews } from '@/context/ReviewContext';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Tab = 'all' | 'active' | 'delivered' | 'cancelled';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function isActive(status: OrderStatus): boolean {
  return status === 'PENDING' || status === 'IN_PROGRESS' || status === 'READY';
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'transparent', text: 'var(--anim-bronze)', border: 'var(--anim-bronze)' },
    IN_PROGRESS: { bg: 'transparent', text: 'var(--anim-olive)', border: 'var(--anim-olive)' },
    READY: { bg: 'var(--anim-olive)', text: 'var(--btn-text)', border: 'var(--anim-olive)' },
    DELIVERED: { bg: 'transparent', text: 'var(--text-muted)', border: 'var(--border)' },
    CANCELLED: { bg: 'transparent', text: '#c0392b', border: '#c0392b' },
  };
  const c = colors[status];
  return (
    <span
      className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-body border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default function AccountOrdersPage() {
  const { orders, loading } = useOrders();
  const { hasReviewed } = useReviews();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = orders.filter((o) => {
    if (tab === 'all') return true;
    if (tab === 'active') return isActive(o.status);
    if (tab === 'delivered') return o.status === 'DELIVERED';
    if (tab === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  if (!loading && orders.length === 0) {
    return (
      <div>
        <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Orders</p>
        <h1 className="font-display text-3xl md:text-4xl text-token">Your Orders</h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 bg-surface border border-token p-10 text-center"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
            <Package size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl text-token">No orders yet</h2>
          <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
            When you place an order, it will appear here with its status and tracking details.
          </p>
          <Link to="/shop" className="btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <ShoppingBag size={15} /> Start Shopping <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Orders</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Your Orders</h1>
      <p className="font-body text-sm text-muted mt-2">Track and review your Shreemithra purchases.</p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mt-6 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const count = orders.filter((o) => {
            if (t.key === 'all') return true;
            if (t.key === 'active') return isActive(o.status);
            if (t.key === 'delivered') return o.status === 'DELIVERED';
            if (t.key === 'cancelled') return o.status === 'CANCELLED';
            return true;
          }).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] whitespace-nowrap border-b-2 transition-colors ${
                active ? 'text-primary' : 'text-muted hover:text-token'
              }`}
              style={active ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}
            >
              {t.label}
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-token p-10 text-center">
          <p className="font-display text-xl text-token">No orders in this category</p>
          <p className="font-body text-sm text-muted mt-2">Try a different filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filtered.map((order, i) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const canReview = order.status === 'DELIVERED';
              const someUnreviewed = order.items.some((item) => !hasReviewed(item.productId));
              return (
                <motion.article
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bg-surface border border-token p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Thumbnails */}
                    <div className="flex -space-x-3 shrink-0">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.productImage}
                          alt={item.productName}
                          className="w-14 h-18 object-cover bg-token-alt border-2"
                          style={{ height: '4.5rem', borderColor: 'var(--surface)' }}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <span className="w-14 h-18 flex items-center justify-center bg-token-alt border-2 font-body text-xs text-muted" style={{ height: '4.5rem', borderColor: 'var(--surface)' }}>
                          +{order.items.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-display text-lg text-token">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="font-body text-xs text-muted mt-1">
                        {fmtDate(order.orderDate)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                      <p className="font-body text-sm text-token font-medium mt-2">{formatPrice(order.totalAmount)}</p>
                      {order.balanceAmount > 0 && (
                        <p className="font-body text-xs mt-0.5" style={{ color: 'var(--anim-bronze)' }}>
                          Balance due: {formatPrice(order.balanceAmount)}
                        </p>
                      )}
                      {order.deliveryDate && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <p className="font-body text-xs text-muted mt-0.5">
                          Expected by {fmtDate(order.deliveryDate)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                      >
                        <Package size={13} /> Details
                      </Link>
                      {isActive(order.status) && (
                        <Link
                          to={`/account/orders/${order.id}/track`}
                          className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                        >
                          <Truck size={13} /> Track
                        </Link>
                      )}
                      {canReview && someUnreviewed && (
                        <Link
                          to={`/account/orders/${order.id}`}
                          className="btn-primary px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                        >
                          <Star size={13} /> Review
                        </Link>
                      )}
                      <Link
                        to="/shop"
                        className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} /> Shop Again
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
