import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CreditCard, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { paymentService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { PaymentRecord, PaymentState, PaymentType } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATE_META: Record<PaymentState, { icon: typeof CheckCircle; color: string }> = {
  Paid: { icon: CheckCircle, color: 'var(--anim-olive)' },
  Pending: { icon: Clock, color: 'var(--anim-bronze)' },
  Refunded: { icon: RotateCcw, color: '#c0392b' },
};

const TYPES: PaymentType[] = ['Full Payment', 'Advance Payment', 'Balance Payment'];

type Filter = 'all' | PaymentState;

export default function PaymentManagementPage() {
  const { notify } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    paymentService.list().then(setPayments).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (search && !p.orderNumber.toLowerCase().includes(search.toLowerCase()) && !p.customerName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter !== 'all' && p.state !== filter) return false;
      return true;
    });
  }, [payments, search, filter]);

  const totalPaid = payments.filter((p) => p.state === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.state === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.state === 'Refunded').reduce((s, p) => s + p.amount, 0);

  const handleStateChange = async (id: string, state: PaymentState) => {
    try {
      const updated = await paymentService.updateState(id, state);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setSelected(updated);
      notify(`Payment marked as ${state}`, 'info');
    } catch { notify('Unable to update payment', 'remove'); }
  };

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Payments</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Payment Management</h1>
      <p className="font-body text-sm text-muted mt-2">Track transactions and payment statuses.</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl text-token">{formatPrice(totalPaid)}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Collected</p>
        </div>
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl" style={{ color: 'var(--anim-bronze)' }}>{formatPrice(totalPending)}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Pending</p>
        </div>
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl" style={{ color: '#c0392b' }}>{formatPrice(totalRefunded)}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Refunded</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order or customer…" className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'Paid', 'Pending', 'Refunded'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] border-b-2 transition-colors ${filter === f ? 'text-primary' : 'text-muted hover:text-token'}`} style={filter === f ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-surface border border-token overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Order</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden sm:table-cell">Customer</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">Type</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Amount</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Status</th>
              <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 font-body text-sm text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 font-body text-sm text-muted text-center">No payments found.</td></tr>
            ) : (
              filtered.map((p) => {
                const meta = STATE_META[p.state];
                const Icon = meta.icon;
                return (
                  <tr key={p.id} className="border-b border-token last:border-0 hover:bg-token-alt transition-colors cursor-pointer" onClick={() => setSelected(p)}>
                    <td className="px-4 py-3 font-display text-sm text-token">{p.orderNumber}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted hidden sm:table-cell">{p.customerName}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted hidden md:table-cell">{p.type}</td>
                    <td className="px-4 py-3 font-body text-sm text-token">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted hidden lg:table-cell">{fmtDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-body text-xs" style={{ color: meta.color }}>
                        <Icon size={13} /> {p.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="font-body text-xs uppercase tracking-[0.15em] text-primary hover:underline">Details</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }} className="relative w-full max-w-md h-full bg-token border-l border-token overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-token">Payment Details</h2>
                <button onClick={() => setSelected(null)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="bg-surface border border-token p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard size={18} className="text-muted" />
                    <p className="font-display text-lg text-token">{selected.orderNumber}</p>
                  </div>
                  <p className="font-body text-sm text-muted">{selected.customerName}</p>
                  <p className="font-body text-xs text-muted mt-1">{fmtDate(selected.date)}</p>
                </div>

                <dl className="space-y-2 font-body text-sm border-t border-token pt-3">
                  <div className="flex justify-between"><dt className="text-muted">Type</dt><dd className="text-token">{selected.type}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Method</dt><dd className="text-token uppercase">{selected.method}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd className="font-display text-lg text-token">{formatPrice(selected.amount)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Status</dt><dd style={{ color: STATE_META[selected.state].color }}>{selected.state}</dd></div>
                </dl>

                {/* Update status */}
                <div className="pt-4 border-t border-token">
                  <p className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-2">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Paid', 'Pending', 'Refunded'] as PaymentState[]).map((s) => (
                      <button key={s} onClick={() => handleStateChange(selected.id, s)} className={`py-2.5 text-xs uppercase tracking-[0.1em] font-body border transition-colors ${selected.state === s ? 'text-primary' : 'text-token hover:text-primary'}`} style={{ borderColor: selected.state === s ? 'var(--primary)' : 'var(--border)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
