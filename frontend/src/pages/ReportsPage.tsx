import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
import { reportsService, ownerOrderService, ownerProductService, ownerCustomerService, paymentService } from '@/services/ownerService';
import type { Order, OwnerProduct, OwnerCustomer, PaymentRecord, ReportsData } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<OwnerProduct[]>([]);
  const [customers, setCustomers] = useState<OwnerCustomer[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      ownerOrderService.list(),
      ownerProductService.list(),
      ownerCustomerService.list(),
      paymentService.list(),
      reportsService.getReports().catch(() => null),
    ])
      .then(([o, p, c, pay, r]) => {
        setOrders(o);
        setProducts(p);
        setCustomers(c);
        setPayments(pay);
        setReports(r);
      })
      .catch(() => setError('Unable to load report data. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const paymentBreakdown = useMemo(() => {
    const paid = payments.filter((p) => p.state === 'Paid').reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.state === 'Pending').reduce((s, p) => s + p.amount, 0);
    const refunded = payments.filter((p) => p.state === 'Refunded').reduce((s, p) => s + p.amount, 0);
    return { paid, pending, refunded };
  }, [payments]);

  const revenueSeries = reports?.revenueSeries ?? [];
  const ordersSeries = reports?.ordersSeries ?? [];
  const customersSeries = reports?.customersSeries ?? [];
  const totalRevenue = reports?.totalRevenue ?? payments.filter((p) => p.state === 'Paid').reduce((s, p) => s + p.amount, 0);
  const revenueGrowth = reports?.revenueGrowth ?? 0;
  const ordersGrowth = reports?.ordersGrowth ?? 0;
  const customersGrowth = reports?.customersGrowth ?? 0;
  const productsGrowth = reports?.productsGrowth ?? 0;

  if (loading) return <p className="font-body text-sm text-muted">Loading reports…</p>;
  if (error) return <p className="font-body text-sm" style={{ color: '#c0392b' }}>{error}</p>;

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Analytics</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Reports & Insights</h1>
      <p className="font-body text-sm text-muted mt-2">A snapshot of your boutique's performance.</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        <KpiCard icon={TrendingUp} label="Total Revenue" value={formatPrice(totalRevenue)} trend={revenueGrowth} />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} trend={ordersGrowth} />
        <KpiCard icon={Users} label="Customers" value={String(customers.length)} trend={customersGrowth} />
        <KpiCard icon={Package} label="Products" value={String(products.length)} trend={productsGrowth} />
      </div>

      {/* Revenue chart */}
      <div className="bg-surface border border-token p-5 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-token flex items-center gap-2"><TrendingUp size={18} style={{ color: 'var(--anim-olive)' }} /> Revenue Trend</h2>
          <span className="font-body text-xs text-muted">Last 6 months</span>
        </div>
        {revenueSeries.length > 0 ? (
          <BarChart data={revenueSeries} color="var(--primary)" formatValue={formatPrice} />
        ) : (
          <EmptyChart label="No revenue data yet." />
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Orders chart */}
        <div className="bg-surface border border-token p-5">
          <h2 className="font-display text-xl text-token mb-6 flex items-center gap-2"><ShoppingBag size={18} style={{ color: 'var(--anim-bronze)' }} /> Orders per Month</h2>
          {ordersSeries.length > 0 ? (
            <BarChart data={ordersSeries} color="var(--anim-bronze)" formatValue={(v) => String(v)} />
          ) : (
            <EmptyChart label="No order data yet." />
          )}
        </div>

        {/* Customers chart */}
        <div className="bg-surface border border-token p-5">
          <h2 className="font-display text-xl text-token mb-6 flex items-center gap-2"><Users size={18} style={{ color: 'var(--anim-olive)' }} /> New Customers</h2>
          {customersSeries.length > 0 ? (
            <BarChart data={customersSeries} color="var(--anim-olive)" formatValue={(v) => String(v)} />
          ) : (
            <EmptyChart label="No customer data yet." />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Category breakdown */}
        <div className="bg-surface border border-token p-5">
          <h2 className="font-display text-xl text-token mb-6 flex items-center gap-2"><Package size={18} style={{ color: 'var(--anim-bronze)' }} /> Products by Category</h2>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map(([category, count], i) => {
                const max = Math.max(...categoryBreakdown.map(([, c]) => c));
                const pct = (count / max) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-sm text-token">{category}</span>
                      <span className="font-body text-sm text-muted">{count}</span>
                    </div>
                    <div className="h-2 bg-token-alt">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} className="h-full" style={{ background: 'var(--primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-sm text-muted py-4">No products to categorize yet.</p>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="bg-surface border border-token p-5">
          <h2 className="font-display text-xl text-token mb-6 flex items-center gap-2"><CreditCard size={18} style={{ color: 'var(--anim-olive)' }} /> Payment Summary</h2>
          <div className="space-y-4">
            <PaymentRow label="Collected" amount={paymentBreakdown.paid} total={paymentBreakdown.paid + paymentBreakdown.pending} color="var(--anim-olive)" />
            <PaymentRow label="Pending" amount={paymentBreakdown.pending} total={paymentBreakdown.paid + paymentBreakdown.pending} color="var(--anim-bronze)" />
            <PaymentRow label="Refunded" amount={paymentBreakdown.refunded} total={paymentBreakdown.paid + paymentBreakdown.pending} color="#c0392b" />
          </div>
          <div className="mt-6 pt-4 border-t border-token">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted">Net Collected</span>
              <span className="font-display text-lg text-token">{formatPrice(paymentBreakdown.paid - paymentBreakdown.refunded)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend }: { icon: typeof TrendingUp; label: string; value: string; trend: number }) {
  const positive = trend >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-surface border border-token p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="h-9 w-9 flex items-center justify-center text-muted"><Icon size={18} strokeWidth={1.6} /></span>
        <span className={`flex items-center gap-0.5 font-body text-xs ${positive ? 'text-green-600' : ''}`} style={{ color: positive ? 'var(--anim-olive)' : '#c0392b' }}>
          {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <p className="font-display text-xl text-token">{value}</p>
      <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">{label}</p>
    </motion.div>
  );
}

function BarChart({ data, color, formatValue }: { data: { month: string; value: number }[]; color: string; formatValue: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((d, i) => {
        const height = (d.value / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="font-body text-xs text-muted">{formatValue(d.value)}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
              className="w-full min-h-[2px] rounded-t-sm"
              style={{ background: color, minHeight: '4px' }}
            />
            <span className="font-body text-xs text-muted">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <p className="font-body text-sm text-muted">{label}</p>
    </div>
  );
}

function PaymentRow({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-body text-sm text-token">{label}</span>
        <span className="font-body text-sm text-token">{formatPrice(amount)}</span>
      </div>
      <div className="h-2 bg-token-alt">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full" style={{ background: color }} />
      </div>
    </div>
  );
}
