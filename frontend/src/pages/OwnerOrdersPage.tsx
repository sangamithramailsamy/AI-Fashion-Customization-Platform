import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ownerOrderService } from '@/services/ownerService';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Filter = 'all' | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'READY', label: 'Ready' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'var(--anim-bronze)',
    IN_PROGRESS: 'var(--anim-olive)',
    READY: 'var(--anim-olive)',
    DELIVERED: 'var(--text-muted)',
    CANCELLED: '#c0392b',
  };
  return (
    <span className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-body border" style={{ color: colors[status], borderColor: colors[status] }}>
      {getStatusLabel(status)}
    </span>
  );
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    ownerOrderService.list().then(setOrders).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Orders</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">All Orders</h1>
      <p className="font-body text-sm text-muted mt-2">Manage and update customer orders.</p>

      {/* Filters */}
      <div className="flex items-center gap-1 mt-6 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count = f.key === 'all' ? orders.length : orders.filter((o) => o.status === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] whitespace-nowrap border-b-2 transition-colors ${active ? 'text-primary' : 'text-muted hover:text-token'}`}
              style={active ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}
            >
              {f.label}
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
        </div>
      ) : (
        <div className="bg-surface border border-token overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-token">
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Order Number</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden sm:table-cell">Customer</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Total</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden lg:table-cell">Payment</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Status</th>
                <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-token last:border-0 hover:bg-token-alt transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link to={`/owner/orders/${order.id}`} className="font-display text-sm text-token hover:text-primary transition-colors">{order.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted hidden sm:table-cell">{order.customerName}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted hidden md:table-cell">{fmtDate(order.orderDate)}</td>
                    <td className="px-4 py-3 font-body text-sm text-token">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-body text-xs text-muted">
                        {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'PARTIALLY_PAID' ? 'Partial' : order.paymentStatus === 'UNPAID' ? 'Unpaid' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/owner/orders/${order.id}`} className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.15em] text-primary hover:underline">
                        Details <ArrowRight size={12} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
