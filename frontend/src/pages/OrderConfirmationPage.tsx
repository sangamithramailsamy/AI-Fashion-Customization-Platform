import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Package, Truck, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { getStatusLabel, getStatusDescription } from '@/data/orderData';
import type { Order } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | undefined>(getOrder(id ?? ''));

  // Poll briefly in case the order was just created and state hasn't propagated
  useEffect(() => {
    if (!order) {
      const timer = setTimeout(() => setOrder(getOrder(id ?? '')), 300);
      return () => clearTimeout(timer);
    }
  }, [order, id, getOrder]);

  if (!order) {
    return (
      <div className="pt-28 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center py-20 bg-surface border border-token">
          <h1 className="font-display text-3xl text-token">Order not found</h1>
          <p className="font-body text-sm text-muted mt-2">We couldn't find this order.</p>
          <Link to="/account/orders" className="btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            View My Orders <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        {/* Success state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-5"
            style={{ background: 'var(--anim-olive)', color: 'var(--btn-text)' }}
          >
            <Check size={30} strokeWidth={2} />
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="font-display text-4xl md:text-5xl text-token"
          >
            Order Confirmed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-body text-base text-muted mt-3"
          >
            Thank you, {order.customerName.split(' ')[0]}. Your order is being prepared.
          </motion.p>
        </motion.div>

        {/* Order summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-surface border border-token p-6 md:p-8"
        >
          <div className="flex items-center justify-between border-b border-token pb-4 mb-4">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Order Number</p>
              <p className="font-display text-xl text-token mt-0.5">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Order Date</p>
              <p className="font-display text-base text-token mt-0.5">{fmtDate(order.orderDate)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.productImage} alt={item.productName} className="w-14 h-18 object-cover bg-token-alt shrink-0" style={{ height: '4.5rem' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base text-token leading-snug line-clamp-1">{item.productName}</p>
                  <p className="font-body text-xs text-muted">{item.size} · {item.color} · Qty {item.quantity}</p>
                  {item.customizable && <p className="font-body text-xs mt-0.5" style={{ color: 'var(--anim-bronze)' }}>Custom piece</p>}
                </div>
                <p className="font-body text-sm text-token font-medium whitespace-nowrap">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Payment summary */}
          <div className="border-t border-token pt-4 space-y-2 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="text-token">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.couponDiscount && order.couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Coupon ({order.couponCode})</span>
                <span style={{ color: 'var(--anim-olive)' }}>− {formatPrice(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span className="text-token">{order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-token pt-2">
              <span className="font-display text-base text-token">Total</span>
              <span className="font-display text-xl text-token">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.balanceAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Advance Paid</span>
                <span className="text-token">{formatPrice(order.advancePaid)}</span>
              </div>
            )}
            {order.balanceAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Balance Due</span>
                <span style={{ color: 'var(--anim-bronze)' }}>{formatPrice(order.balanceAmount)}</span>
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="border-t border-token mt-4 pt-4 flex items-center gap-3">
            <Truck size={18} style={{ color: 'var(--anim-bronze)' }} />
            <div>
              <p className="font-body text-sm text-token">{getStatusLabel(order.status)}</p>
              <p className="font-body text-xs text-muted">{getStatusDescription(order.status)}</p>
              {order.deliveryDate && (
                <p className="font-body text-xs text-muted mt-0.5">Expected delivery by {fmtDate(order.deliveryDate)}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid sm:grid-cols-3 gap-3 mt-6"
        >
          <Link to={`/account/orders/${order.id}`} className="btn-outline py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
            <Package size={14} /> View Order
          </Link>
          <Link to={`/account/orders/${order.id}/track`} className="btn-outline py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
            <Truck size={14} /> Track Order
          </Link>
          <Link to="/shop" className="btn-primary py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
