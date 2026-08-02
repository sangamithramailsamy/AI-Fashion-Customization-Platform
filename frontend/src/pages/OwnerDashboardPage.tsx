import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Clock, Scissors, Package, CheckCircle, Users,
  DollarSign, ArrowRight, Plus, Store, CreditCard, Bell, AlertTriangle, BarChart3,
  TrendingUp, Star,
} from 'lucide-react';
import { ownerOrderService, ownerProductService, ownerCustomerService, paymentService, productionService, ownerNotificationService, reportsService } from '@/services/ownerService';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OwnerProduct, OwnerCustomer, PaymentRecord, ProductionItem, OwnerNotification, DashboardStats } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface StatCard {
  label: string;
  value: string;
  icon: typeof ShoppingBag;
  accent: string;
}

export default function OwnerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<OwnerProduct[]>([]);
  const [customers, setCustomers] = useState<OwnerCustomer[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [production, setProduction] = useState<ProductionItem[]>([]);
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ownerOrderService.list(), ownerProductService.list(), ownerCustomerService.list(),
      paymentService.list(), productionService.list(), ownerNotificationService.list(),
      reportsService.getDashboardStats().catch(() => null),
    ])
      .then(([o, p, c, pay, prod, n, stats]) => {
        setOrders(o); setProducts(p); setCustomers(c); setPayments(pay); setProduction(prod); setNotifications(n);
        setDashboardStats(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const revenue = dashboardStats?.totalRevenue ?? orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.advancePaid, 0);
  const monthlyRevenue = dashboardStats?.monthlyRevenue ?? 0;
  const pendingPayments = payments.filter((p) => p.state === 'Pending').reduce((s, p) => s + p.amount, 0);
  const pendingProduction = production.filter((p) => p.status === 'Pending' || p.status === 'Designing').length;
  const lowStock = products.filter((p) => p.stock <= 5);
  const lowStockCount = lowStock.length;

  const stats: StatCard[] = [
    { label: 'Total Revenue', value: formatPrice(revenue), icon: DollarSign, accent: 'var(--anim-olive)' },
    { label: 'Monthly Revenue', value: formatPrice(monthlyRevenue), icon: TrendingUp, accent: 'var(--anim-bronze)' },
    { label: 'Total Orders', value: String(orders.length), icon: ShoppingBag, accent: 'var(--primary)' },
    { label: 'Active Orders', value: String(activeOrders), icon: Scissors, accent: 'var(--anim-olive)' },
    { label: 'Delivered', value: String(deliveredCount), icon: CheckCircle, accent: 'var(--primary)' },
    { label: 'Pending Production', value: String(pendingProduction), icon: Clock, accent: 'var(--anim-bronze)' },
    { label: 'Pending Payments', value: formatPrice(pendingPayments), icon: CreditCard, accent: 'var(--anim-bronze)' },
    { label: 'Customers', value: String(customers.length), icon: Users, accent: 'var(--anim-bronze)' },
    { label: 'Employees', value: String(dashboardStats?.totalEmployees ?? 0), icon: Users, accent: 'var(--anim-olive)' },
    { label: 'Inventory', value: `${lowStockCount} low`, icon: Package, accent: lowStockCount > 0 ? '#c0392b' : 'var(--primary)' },
    { label: 'Reviews', value: String(dashboardStats?.totalReviews ?? 0), icon: Star, accent: 'var(--anim-bronze)' },
    { label: 'Notifications', value: String(notifications.length), icon: Bell, accent: 'var(--anim-olive)' },
  ];

  if (loading) {
    return <p className="font-body text-sm text-muted">Loading dashboard…</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Dashboard</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Boutique Overview</h1>
          <p className="font-body text-sm text-muted mt-2">A snapshot of your atelier today.</p>
        </div>
        <Link to="/owner/reports" className="btn-outline px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <BarChart3 size={14} /> Reports
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-surface border border-token p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="h-9 w-9 flex items-center justify-center" style={{ color: stat.accent }}>
                  <Icon size={18} strokeWidth={1.6} />
                </span>
              </div>
              <p className="font-display text-2xl text-token">{stat.value}</p>
              <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link to="/owner/products" className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Plus size={14} /> Add Product
        </Link>
        <Link to="/owner/orders" className="btn-outline px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ShoppingBag size={14} /> View Orders
        </Link>
        <Link to="/owner/boutique" className="btn-outline px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Store size={14} /> Manage Boutique
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Recent orders */}
        <div className="bg-surface border border-token p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-token">Recent Orders</h2>
            <Link to="/owner/orders" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <li key={order.id}>
                <Link to={`/owner/orders/${order.id}`} className="flex items-center gap-3 py-2 border-t border-token hover:text-primary transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-token group-hover:text-primary transition-colors">{order.orderNumber}</p>
                    <p className="font-body text-xs text-muted">{order.customerName} · {fmtDate(order.orderDate)}</p>
                  </div>
                  <span className="font-body text-xs text-muted">{getStatusLabel(order.status)}</span>
                  <span className="font-body text-sm text-token font-medium whitespace-nowrap">{formatPrice(order.totalAmount)}</span>
                </Link>
              </li>
            ))}
            {orders.length === 0 && <p className="font-body text-sm text-muted py-4">No orders yet.</p>}
          </ul>
        </div>

        {/* Low stock */}
        <div className="bg-surface border border-token p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-token flex items-center gap-2">
              {lowStockCount > 0 && <AlertTriangle size={18} style={{ color: '#c0392b' }} />} Low Stock Products
            </h2>
            <Link to="/owner/inventory" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="space-y-3">
            {lowStock.slice(0, 4).map((product) => (
              <li key={product.id} className="flex items-center gap-3 py-2 border-t border-token">
                <img src={product.image} alt={product.name} className="w-10 h-12 object-cover bg-token-alt shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base text-token line-clamp-1">{product.name}</p>
                  <p className="font-body text-xs text-muted">{product.category}</p>
                </div>
                <span className="font-body text-sm font-medium" style={{ color: product.stock <= 5 ? '#c0392b' : 'var(--text)' }}>
                  {product.stock} left
                </span>
              </li>
            ))}
            {lowStock.length === 0 && <p className="font-body text-sm text-muted py-4">All products well stocked.</p>}
          </ul>
        </div>

        {/* Recent notifications */}
        <div className="bg-surface border border-token p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-token flex items-center gap-2"><Bell size={18} style={{ color: 'var(--anim-bronze)' }} /> Recent Notifications</h2>
            <Link to="/owner/notifications" className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="py-2 border-t border-token">
                <p className="font-display text-base text-token">{n.title}</p>
                <p className="font-body text-xs text-muted line-clamp-1">{n.message}</p>
                <p className="font-body text-xs text-muted mt-0.5">{fmtDate(n.sentAt)}</p>
              </li>
            ))}
            {notifications.length === 0 && <p className="font-body text-sm text-muted py-4">No notifications sent.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
