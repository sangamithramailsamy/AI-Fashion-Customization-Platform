import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mail, Phone, ShoppingBag, MapPin, Ruler, CreditCard, Calendar, Trash2, Edit2 } from 'lucide-react';
import { ownerCustomerService, ownerOrderService, paymentService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { OwnerCustomer, Order, PaymentRecord, CustomerDetail, ShippingAddress, CustomerMeasurement } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<OwnerCustomer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OwnerCustomer | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    Promise.all([ownerCustomerService.list(), ownerOrderService.list(), paymentService.list()])
      .then(([c, o, p]) => {
        setCustomers(c);
        setOrders(o);
        setPayments(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (c: OwnerCustomer) => {
    setSelected(c);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await ownerCustomerService.get(c.id);
      setDetail(d);
    } catch {
      // graceful — fall back to filtered data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ownerCustomerService.remove(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSelected(null);
      notify('Customer removed', 'remove');
    } catch {
      notify('Unable to remove customer', 'remove');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  const customerOrders = detail ? detail.orders : (selected ? orders.filter((o) => o.customerName === selected.fullName) : []);
  const customerPayments = detail ? detail.payments : (selected ? payments.filter((p) => p.customerName === selected.fullName) : []);
  const customerAddresses: ShippingAddress[] = detail ? detail.addresses : [];
  const customerMeasurements: CustomerMeasurement | null = detail ? detail.measurements : null;

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Customers</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Customer Management</h1>
      <p className="font-body text-sm text-muted mt-2">View customer profiles, orders and payment history.</p>

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted mt-6">Loading customers…</p>
      ) : (
        <div className="mt-6 bg-surface border border-token overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-token">
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Customer</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden sm:table-cell">Phone</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">Joined</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Orders</th>
                <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden lg:table-cell">Spent</th>
                <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-token last:border-0 hover:bg-token-alt transition-colors cursor-pointer" onClick={() => openDetail(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 rounded-full flex items-center justify-center border border-token font-display text-sm text-token shrink-0">
                        {c.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-display text-sm text-token">{c.fullName}</p>
                        <p className="font-body text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted hidden sm:table-cell">{c.phone}</td>
                  <td className="px-4 py-3 font-body text-sm text-muted hidden md:table-cell">{fmtDate(c.joinedAt)}</td>
                  <td className="px-4 py-3 font-body text-sm text-token">{c.ordersCount}</td>
                  <td className="px-4 py-3 font-body text-sm text-token hidden lg:table-cell">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="font-body text-xs uppercase tracking-[0.15em] text-primary hover:underline">Profile</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 font-body text-sm text-muted text-center">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="relative w-full max-w-md h-full bg-token border-l border-token overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-token">Customer Profile</h2>
                <button onClick={() => setSelected(null)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="h-14 w-14 rounded-full flex items-center justify-center border border-token font-display text-xl text-token">
                  {selected.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
                <div>
                  <p className="font-display text-xl text-token">{selected.fullName}</p>
                  <p className="font-body text-sm text-muted">Customer since {fmtDate(selected.joinedAt)}</p>
                </div>
              </div>

              <dl className="space-y-3 mb-6">
                <div className="flex items-center gap-3 font-body text-sm"><Mail size={15} className="text-muted" /><span className="text-token">{selected.email}</span></div>
                <div className="flex items-center gap-3 font-body text-sm"><Phone size={15} className="text-muted" /><span className="text-token">{selected.phone}</span></div>
                <div className="flex items-center gap-3 font-body text-sm"><Calendar size={15} className="text-muted" /><span className="text-token">Joined {fmtDate(selected.joinedAt)}</span></div>
              </dl>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <Stat icon={ShoppingBag} label="Orders" value={String(selected.ordersCount)} />
                <Stat icon={CreditCard} label="Spent" value={formatPrice(selected.totalSpent)} />
                <Stat icon={MapPin} label="Addresses" value={String(selected.addressCount)} />
                <Stat icon={Ruler} label="Measurements" value={String(selected.measurementsCount)} />
              </div>

              {detailLoading ? (
                <p className="font-body text-sm text-muted mb-4">Loading details…</p>
              ) : (
                <>
                  {/* Addresses */}
                  <h3 className="font-display text-lg text-token mb-3 flex items-center gap-2"><MapPin size={16} className="text-muted" /> Addresses</h3>
                  <ul className="space-y-2 mb-6">
                    {customerAddresses.map((a) => (
                      <li key={a.id} className="py-2 border-t border-token font-body text-sm text-token">
                        <p>{a.fullName}, {a.phone}</p>
                        <p className="text-muted text-xs mt-0.5">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
                        {a.isDefault && <span className="text-xs text-primary">Default</span>}
                      </li>
                    ))}
                    {customerAddresses.length === 0 && <p className="font-body text-sm text-muted">No saved addresses.</p>}
                  </ul>

                  {/* Measurements */}
                  <h3 className="font-display text-lg text-token mb-3 flex items-center gap-2"><Ruler size={16} className="text-muted" /> Measurements</h3>
                  {customerMeasurements ? (
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {Object.entries(customerMeasurements).filter(([k]) => k !== 'id' && k !== 'customerId' && k !== 'createdAt' && k !== 'updatedAt').map(([key, val]) => (
                        val != null && typeof val !== 'object' ? (
                          <div key={key} className="bg-surface border border-token p-2">
                            <p className="font-body text-xs text-muted uppercase tracking-[0.1em]">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="font-body text-sm text-token">{String(val)}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted mb-6">No measurements saved.</p>
                  )}
                </>
              )}

              {/* Orders */}
              <h3 className="font-display text-lg text-token mb-3">Orders</h3>
              <ul className="space-y-2 mb-6">
                {customerOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2 border-t border-token">
                    <div>
                      <p className="font-display text-sm text-token">{o.orderNumber}</p>
                      <p className="font-body text-xs text-muted">{fmtDate(o.orderDate)}</p>
                    </div>
                    <span className="font-body text-sm text-token">{formatPrice(o.totalAmount)}</span>
                  </li>
                ))}
                {customerOrders.length === 0 && <p className="font-body text-sm text-muted">No orders.</p>}
              </ul>

              {/* Payments */}
              <h3 className="font-display text-lg text-token mb-3">Payment History</h3>
              <ul className="space-y-2">
                {customerPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 border-t border-token">
                    <div>
                      <p className="font-body text-sm text-token">{p.type}</p>
                      <p className="font-body text-xs text-muted">{p.orderNumber} · {fmtDate(p.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-sm text-token">{formatPrice(p.amount)}</p>
                      <p className="font-body text-xs text-muted">{p.state}</p>
                    </div>
                  </li>
                ))}
                {customerPayments.length === 0 && <p className="font-body text-sm text-muted">No payments.</p>}
              </ul>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-token">
                <button onClick={() => setConfirmDelete(selected.id)} className="btn-outline flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2" style={{ color: '#c0392b', borderColor: '#c0392b' }}>
                  <Trash2 size={15} /> Delete Customer
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[96] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <h3 className="font-display text-2xl text-token">Delete this customer?</h3>
              <p className="font-body text-sm text-muted mt-2">This will permanently remove the customer record. This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body" style={{ background: '#c0392b', color: '#fff' }}>Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="bg-surface border border-token p-3">
      <div className="flex items-center gap-2 mb-1 text-muted"><Icon size={14} /><span className="font-body text-xs uppercase tracking-[0.1em]">{label}</span></div>
      <p className="font-display text-lg text-token">{value}</p>
    </div>
  );
}
