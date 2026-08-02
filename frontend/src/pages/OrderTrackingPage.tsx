import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Truck, Clock, Package, Scissors, Home, X } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { ORDER_STATUS_FLOW, getStatusIndex } from '@/data/orderData';
import type { OrderStatus } from '@/types';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STEP_ICONS = [Package, Scissors, Truck, Home];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { getOrder } = useOrders();
  const order = getOrder(id ?? '');

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

  const currentIdx = getStatusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div>
      <Link to={`/account/orders/${order.id}`} className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> Order Details
      </Link>

      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Tracking</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">{order.orderNumber}</h1>
      <p className="font-body text-sm text-muted mt-1">Placed on {fmtDate(order.orderDate)}</p>

      {/* Cancelled state */}
      {isCancelled ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 bg-surface border border-token p-8 text-center"
          style={{ borderColor: '#c0392b40' }}
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-5" style={{ color: '#c0392b' }}>
            <X size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl text-token">Order Cancelled</h2>
          <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
            This order was cancelled and will not be processed further.
            {order.cancellationReason && <span className="block mt-1">Reason: {order.cancellationReason}</span>}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Current status highlight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-surface border border-token p-6 flex items-center gap-4"
          >
            <span className="h-14 w-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
              {order.status === 'DELIVERED' ? <Check size={24} /> : <Truck size={24} />}
            </span>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Current Status</p>
              <p className="font-display text-2xl text-token">{ORDER_STATUS_FLOW[currentIdx]?.label}</p>
              <p className="font-body text-sm text-muted mt-0.5">{ORDER_STATUS_FLOW[currentIdx]?.description}</p>
            </div>
            {order.deliveryDate && order.status !== 'DELIVERED' && (
              <div className="ml-auto text-right hidden sm:block">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Expected by</p>
                <p className="font-display text-base text-token">{fmtDate(order.deliveryDate)}</p>
              </div>
            )}
          </motion.div>

          {/* Timeline */}
          <div className="mt-8">
            {/* Horizontal timeline for desktop */}
            <div className="hidden md:block">
              <div className="relative flex justify-between">
                {/* Progress line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-token-alt" />
                <motion.div
                  className="absolute top-6 left-0 h-0.5"
                  style={{ background: 'var(--primary)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentIdx / (ORDER_STATUS_FLOW.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                {ORDER_STATUS_FLOW.map((step, i) => {
                  const done = i < currentIdx;
                  const current = i === currentIdx;
                  const upcoming = i > currentIdx;
                  const Icon = STEP_ICONS[i] ?? Package;
                  return (
                    <div key={step.status} className="relative z-10 flex flex-col items-center text-center" style={{ width: '25%' }}>
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="h-12 w-12 rounded-full flex items-center justify-center border-2"
                        style={{
                          borderColor: done || current ? 'var(--primary)' : 'var(--border)',
                          background: done ? 'var(--primary)' : current ? 'var(--surface)' : 'var(--bg)',
                          color: done ? 'var(--btn-text)' : current ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                      >
                        {done ? <Check size={18} /> : <Icon size={18} />}
                      </motion.span>
                      <p className="font-display text-sm text-token mt-3">{step.label}</p>
                      <p className="font-body text-xs text-muted mt-1 max-w-[140px]">
                        {upcoming ? step.description : done ? 'Complete' : 'In progress'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vertical timeline for mobile */}
            <div className="md:hidden space-y-0">
              {ORDER_STATUS_FLOW.map((step, i) => {
                const done = i < currentIdx;
                const current = i === currentIdx;
                const upcoming = i > currentIdx;
                const Icon = STEP_ICONS[i] ?? Package;
                return (
                  <motion.div
                    key={step.status}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className="h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0"
                        style={{
                          borderColor: done || current ? 'var(--primary)' : 'var(--border)',
                          background: done ? 'var(--primary)' : current ? 'var(--surface)' : 'var(--bg)',
                          color: done ? 'var(--btn-text)' : current ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                      >
                        {done ? <Check size={16} /> : <Icon size={16} />}
                      </span>
                      {i < ORDER_STATUS_FLOW.length - 1 && (
                        <span className="w-0.5 flex-1 mt-1" style={{ background: done ? 'var(--primary)' : 'var(--border)', minHeight: '2.5rem' }} />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <p className={`font-display text-base ${upcoming ? 'text-muted' : 'text-token'}`}>{step.label}</p>
                      <p className="font-body text-xs text-muted mt-0.5">{step.description}</p>
                      <p className="font-body text-xs mt-1" style={{ color: done ? 'var(--anim-olive)' : current ? 'var(--anim-bronze)' : 'var(--text-muted)' }}>
                        {upcoming ? 'Upcoming' : done ? 'Complete' : 'In progress'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom piece note */}
          {order.items.some((i) => i.customizable) && order.status !== 'DELIVERED' && (
            <div className="mt-6 bg-surface border border-token p-4 flex items-start gap-3">
              <Scissors size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--anim-bronze)' }} />
              <div>
                <p className="font-body text-sm text-token">Your custom pieces are being crafted</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  This order includes boutique creations. Our atelier is preparing them with care — this may take a little longer than ready-made pieces.
                </p>
              </div>
            </div>
          )}

          {/* Delivery info */}
          {order.deliveryDate && (
            <div className="mt-6 bg-surface border border-token p-4 flex items-center gap-3">
              <Clock size={18} style={{ color: 'var(--anim-bronze)' }} />
              <p className="font-body text-sm text-token">
                {order.status === 'DELIVERED' ? 'Delivered on ' : 'Expected delivery by '}
                {fmtDate(order.deliveryDate)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
