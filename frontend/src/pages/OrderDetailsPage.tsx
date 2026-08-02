import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Truck, MapPin, User, CreditCard, Ruler, Star,
  Check, AlertTriangle, X, Lock,
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { useReviews } from '@/context/ReviewContext';
import { useToast } from '@/context/ToastContext';
import { getStatusLabel, getStatusDescription } from '@/data/orderData';
import type { Order, PaymentStatus } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; color: string }> = {
  UNPAID: { label: 'Unpaid', color: '#c0392b' },
  PARTIALLY_PAID: { label: 'Partially Paid', color: 'var(--anim-bronze)' },
  PAID: { label: 'Paid', color: 'var(--anim-olive)' },
  FAILED: { label: 'Failed', color: '#c0392b' },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { getOrder, cancelOrder, payBalance } = useOrders();
  const { hasReviewed } = useReviews();
  const { notify } = useToast();
  const order = getOrder(id ?? '');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!order) {
    return (
      <div>
        <p className="font-display text-2xl text-token">Order not found</p>
        <Link to="/account/orders" className="btn-primary mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={14} /> My Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'IN_PROGRESS';
  const canReview = order.status === 'DELIVERED';
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const payStatus = PAYMENT_STATUS[order.paymentStatus];

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      notify('Please provide a cancellation reason', 'info');
      return;
    }
    setProcessing(true);
    try {
      await cancelOrder(order.id, cancelReason);
      notify('Order cancelled', 'info');
      setCancelOpen(false);
    } catch {
      notify('Unable to cancel order', 'remove');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayBalance = async () => {
    setProcessing(true);
    try {
      await payBalance(order.id, order.balanceAmount);
      notify('Balance payment completed (demo)', 'info');
      setPayOpen(false);
    } catch {
      notify('Unable to process payment', 'remove');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <Link to="/account/orders" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> My Orders
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Order Details</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">{order.orderNumber}</h1>
          <p className="font-body text-sm text-muted mt-1">Placed on {fmtDate(order.orderDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-body border border-token" style={{ color: 'var(--text)' }}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Status banner */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-surface border border-token p-4 mb-6 flex items-center gap-3">
          <Truck size={18} style={{ color: 'var(--anim-bronze)' }} />
          <div>
            <p className="font-body text-sm text-token">{getStatusDescription(order.status)}</p>
            {order.deliveryDate && order.status !== 'DELIVERED' && (
              <p className="font-body text-xs text-muted mt-0.5">Expected delivery by {fmtDate(order.deliveryDate)}</p>
            )}
          </div>
          {order.status !== 'DELIVERED' && (
            <Link to={`/account/orders/${order.id}/track`} className="ml-auto btn-outline px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5">
              <Truck size={13} /> Track
            </Link>
          )}
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="bg-surface border border-token p-4 mb-6 flex items-center gap-3" style={{ borderColor: '#c0392b40' }}>
          <AlertTriangle size={18} style={{ color: '#c0392b' }} />
          <div>
            <p className="font-body text-sm" style={{ color: '#c0392b' }}>This order was cancelled</p>
            {order.cancellationReason && <p className="font-body text-xs text-muted mt-0.5">Reason: {order.cancellationReason}</p>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Items */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-4">Items Ordered</h2>
            <ul className="space-y-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-4 pb-4 border-b border-token last:border-0 last:pb-0">
                  <Link to={`/product/${item.productId}`}>
                    <img src={item.productImage} alt={item.productName} className="w-16 h-20 object-cover bg-token-alt shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-display text-base text-token hover:text-primary transition-colors line-clamp-1">{item.productName}</h3>
                    </Link>
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
                  {canReview && !hasReviewed(item.productId) && (
                    <Link
                      to={`/account/reviews/write?orderId=${order.id}&productId=${item.productId}`}
                      className="self-start btn-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Star size={11} /> Review
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Shipping address */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2">
              <MapPin size={18} style={{ color: 'var(--anim-bronze)' }} /> Shipping Address
            </h2>
            <p className="font-display text-base text-token">{order.shippingAddress.fullName}</p>
            <p className="font-body text-sm text-muted mt-1 leading-relaxed">
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              {order.shippingAddress.country} · {order.shippingAddress.phone}
            </p>
          </div>

          {/* Customer */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2">
              <User size={18} style={{ color: 'var(--anim-bronze)' }} /> Customer
            </h2>
            <p className="font-body text-sm text-token">{order.customerName}</p>
            <p className="font-body text-sm text-muted">{order.customerEmail}</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Payment summary */}
          <div className="bg-surface border border-token p-5">
            <h2 className="font-display text-xl text-token mb-3 flex items-center gap-2">
              <CreditCard size={18} style={{ color: 'var(--anim-bronze)' }} /> Payment
            </h2>
            <div className="flex items-center justify-between mb-3">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-muted">Status</span>
              <span className="font-body text-sm font-medium" style={{ color: payStatus.color }}>{payStatus.label}</span>
            </div>
            <dl className="space-y-2 font-body text-sm border-t border-token pt-3">
              <div className="flex justify-between">
                <dt className="text-muted">Total Amount</dt>
                <dd className="text-token">{formatPrice(order.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Advance Paid</dt>
                <dd className="text-token">{formatPrice(order.advancePaid)}</dd>
              </div>
              {order.balanceAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Balance Due</dt>
                  <dd style={{ color: 'var(--anim-bronze)' }}>{formatPrice(order.balanceAmount)}</dd>
                </div>
              )}
              {order.couponDiscount && order.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Coupon ({order.couponCode})</dt>
                  <dd style={{ color: 'var(--anim-olive)' }}>− {formatPrice(order.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-token">{order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}</dd>
              </div>
            </dl>
            {order.paymentMethod && (
              <p className="font-body text-xs text-muted mt-3 pt-3 border-t border-token">
                Method: {order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}
              </p>
            )}
            {order.balanceAmount > 0 && order.status !== 'CANCELLED' && (
              <button
                onClick={() => setPayOpen(true)}
                className="btn-primary w-full mt-4 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2"
              >
                <Lock size={14} /> Pay Balance
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="bg-surface border border-token p-5 space-y-3">
            {canCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="w-full py-2.5 text-xs uppercase tracking-[0.2em] font-body border text-muted hover:text-token transition-colors"
                style={{ borderColor: '#c0392b60', color: '#c0392b' }}
              >
                Cancel Order
              </button>
            )}
            <Link to="/shop" className="btn-outline w-full py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-token mb-4" style={{ color: '#c0392b' }}>
                <AlertTriangle size={22} />
              </span>
              <h3 className="font-display text-2xl text-token">Cancel this order?</h3>
              <p className="font-body text-sm text-muted mt-2">Please let us know why you're cancelling. Refunds are processed by the backend in a later phase.</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation"
                rows={3}
                className="w-full mt-4 px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={handleCancel} disabled={processing} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body disabled:opacity-60" style={{ background: '#c0392b', color: '#fff' }}>
                  {processing ? 'Cancelling…' : 'Cancel Order'}
                </button>
                <button onClick={() => setCancelOpen(false)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">
                  Keep Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay balance modal */}
      <AnimatePresence>
        {payOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPayOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-token">Pay Balance</h3>
                <button onClick={() => setPayOpen(false)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>
              <p className="font-body text-sm text-muted">Complete your balance payment for this order.</p>
              <dl className="space-y-2 font-body text-sm mt-4 mb-4">
                <div className="flex justify-between"><dt className="text-muted">Total</dt><dd className="text-token">{formatPrice(order.totalAmount)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Already Paid</dt><dd className="text-token">{formatPrice(order.advancePaid)}</dd></div>
                <div className="flex justify-between border-t border-token pt-2"><dt className="font-display text-base text-token">Balance Due</dt><dd className="font-display text-xl" style={{ color: 'var(--anim-bronze)' }}>{formatPrice(order.balanceAmount)}</dd></div>
              </dl>
              <div className="flex items-center gap-2 p-3 border border-token bg-token-alt mb-4">
                <Lock size={14} className="text-muted" />
                <p className="font-body text-xs text-muted">Demo payment — no real charge. Gateway integration arrives later.</p>
              </div>
              <button onClick={handlePayBalance} disabled={processing} className="btn-primary w-full py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {processing ? 'Processing…' : (<><Check size={15} /> Pay {formatPrice(order.balanceAmount)}</>)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
