import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, CreditCard, Ruler, Package, ChevronRight } from 'lucide-react';
import { ownerOrderService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import { ORDER_STATUS_FLOW, getStatusIndex } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED'];

export default function OwnerOrderDetailsPage() {
  const { id } = useParams();
  const { notify } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    ownerOrderService.get(id).then((o) => setOrder(o)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="font-body text-sm text-muted">Loading order…</p>;
  if (!order) {
    return (
      <div>
        <p className="font-display text-2xl text-token">Order not found</p>
        <Link to="/owner/orders" className="btn-primary mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={14} /> All Orders
        </Link>
      </div>
    );
  }

  const currentIdx = getStatusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      const updated = await ownerOrderService.updateStatus(order.id, newStatus);
      setOrder(updated);
      notify(`Order status updated to ${newStatus.replace('_', ' ')}`, 'info');
    } catch {
      notify('Unable to update order status', 'remove');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Link to="/owner/orders" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> All Orders
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Order Details</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">{order.orderNumber}</h1>
          <p className="font-body text-sm text-muted mt-1">Placed on {fmtDate(order.orderDate)}</p>
        </div>
        <span className="px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-body border border-token" style={{ color: 'var(--text)' }}>
          {ORDER_STATUS_FLOW[currentIdx]?.label ?? 'Cancelled'}
        </span>
      </div>

      {/* Status update control */}
      {!isCancelled && (
        <div className="bg-surface border border-token p-5 mb-6">
          <h2 className="font-display text-xl text-token mb-4">Update Order Status</h2>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FLOW.map((status, i) => {
              const done = i < currentIdx;
              const current = i === currentIdx;
              const next = i === currentIdx + 1;

              return (
                <div key={status} className="flex items-center">
                  <button
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || current || !next}
                    className="px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-body border transition-colors disabled:opacity-60"
                    style={{
                      borderColor:
                        done || current ? 'var(--primary)' : 'var(--border)',
                      background: current ? 'var(--primary)' : 'transparent',
                      color:
                        current
                          ? 'var(--btn-text)'
                          : done
                            ? 'var(--primary)'
                            : next
                              ? 'var(--text)'
                              : 'var(--text-muted)',
                      }}
                    >
                      {ORDER_STATUS_FLOW[i].label}
                    </button>

                    {i < STATUS_FLOW.length - 1 && (
                      <ChevronRight
                        size={14}
                        className="text-muted mx-1"
                      />
                    )}
                  </div>
                );
              })}
          </div>
          {updating && <p className="font-body text-xs text-muted mt-3">Updating…</p>}
        </div>
      )}

      {isCancelled && (
        <div className="bg-surface border border-token p-4 mb-6" style={{ borderColor: '#c0392b40' }}>
          <p className="font-body text-sm" style={{ color: '#c0392b' }}>This order was cancelled</p>
          {order.cancellationReason && <p className="font-body text-xs text-muted mt-0.5">Reason: {order.cancellationReason}</p>}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Items */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-4 flex items-center gap-2"><Package size={18} style={{ color: 'var(--anim-bronze)' }} /> Items Ordered</h2>
            <ul className="space-y-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-4 pb-4 border-b border-token last:border-0 last:pb-0">
                  <img src={item.productImage} alt={item.productName} className="w-16 h-20 object-cover bg-token-alt shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base text-token line-clamp-1">{item.productName}</h3>
                    <p className="font-body text-xs text-muted mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                    {item.customizable && (
                      <p className="font-body text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--anim-bronze)' }}>
                        <Ruler size={11} /> Custom piece
                        {item.hasMeasurements && <span className="ml-1" style={{ color: 'var(--anim-olive)' }}>· Measurements attached</span>}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-body text-sm text-muted">{formatPrice(item.unitPrice)} each</p>
                      <p className="font-body text-sm text-token font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2"><User size={18} style={{ color: 'var(--anim-bronze)' }} /> Customer</h2>
            <p className="font-display text-base text-token">{order.customerName}</p>
            <p className="font-body text-sm text-muted">{order.customerEmail}</p>
          </div>

          {/* Shipping */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2"><MapPin size={18} style={{ color: 'var(--anim-bronze)' }} /> Shipping Address</h2>
            <p className="font-display text-base text-token">{order.shippingAddress.fullName}</p>
            <p className="font-body text-sm text-muted mt-1 leading-relaxed">
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              {order.shippingAddress.country} · {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          {/* Payment */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2"><CreditCard size={18} style={{ color: 'var(--anim-bronze)' }} /> Payment</h2>
            <dl className="space-y-2 font-body text-sm border-t border-token pt-3">
              <div className="flex justify-between"><dt className="text-muted">Total</dt><dd className="text-token">{formatPrice(order.totalAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Advance Paid</dt><dd className="text-token">{formatPrice(order.advancePaid)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Balance</dt><dd style={{ color: 'var(--anim-bronze)' }}>{formatPrice(order.balanceAmount)}</dd></div>
            </dl>
            <p className="font-body text-xs text-muted mt-3 pt-3 border-t border-token">
              Status: <span className="text-token font-medium">
                {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'PARTIALLY_PAID' ? 'Partially Paid' : order.paymentStatus === 'UNPAID' ? 'Unpaid' : 'Failed'}
              </span>
            </p>
          </div>

          {/* Dates */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3">Order Timeline</h2>
            <dl className="space-y-2 font-body text-sm">
              <div className="flex justify-between"><dt className="text-muted">Placed</dt><dd className="text-token">{fmtDate(order.orderDate)}</dd></div>
              {order.deliveryDate && (
                <div className="flex justify-between"><dt className="text-muted">{order.status === 'DELIVERED' ? 'Delivered' : 'Expected'}</dt><dd className="text-token">{fmtDate(order.deliveryDate)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted">Last Updated</dt><dd className="text-token">{fmtDate(order.updatedAt)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
