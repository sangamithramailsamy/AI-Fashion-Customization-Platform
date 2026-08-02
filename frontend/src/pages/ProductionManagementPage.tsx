import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Palette, User, X, ChevronRight } from 'lucide-react';
import { productionService, employeeService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { ProductionItem, ProductionStatus, Employee } from '@/types';

const PRODUCTION_STATUSES: ProductionStatus[] = [
  'Pending', 'Designing', 'Cutting', 'Stitching', 'Embroidery', 'Quality Check', 'Ready', 'Delivered',
];

const STATUS_COLOR: Record<ProductionStatus, string> = {
  Pending: 'var(--anim-bronze)',
  Designing: 'var(--anim-olive)',
  Cutting: 'var(--anim-olive)',
  Stitching: 'var(--primary)',
  Embroidery: 'var(--primary)',
  'Quality Check': 'var(--anim-bronze)',
  Ready: 'var(--anim-olive)',
  Delivered: 'var(--text-muted)',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ProductionManagementPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProductionStatus | 'all'>('all');
  const [assigning, setAssigning] = useState<ProductionItem | null>(null);

  useEffect(() => {
    Promise.all([productionService.list(), employeeService.list()])
      .then(([p, e]) => { setItems(p); setEmployees(e); })
      .finally(() => setLoading(false));
  }, []);

  const tailors = employees.filter((e) => e.role === 'Tailor' && e.active);
  const designers = employees.filter((e) => e.role === 'Designer' && e.active);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const handleStatusChange = async (id: number, status: ProductionStatus) => {
    try {
      const updated = await productionService.update(id, { status });
      setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
      notify(`Production status updated to ${status}`, 'info');
    } catch { notify('Unable to update status', 'remove'); }
  };

  const handleAssign = async (id: number, updates: Partial<ProductionItem>) => {
    try {
      const updated = await productionService.update(id, updates);
      setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
      notify('Assignment updated', 'info');
    } catch { notify('Unable to update assignment', 'remove'); }
  };

  const statusIndex = (s: ProductionStatus) => PRODUCTION_STATUSES.indexOf(s);

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Atelier</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Production Management</h1>
      <p className="font-body text-sm text-muted mt-2">Track and assign production work in your atelier.</p>

      {/* Filters */}
      <div className="flex items-center gap-1 mt-6 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilter('all')} className={`px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] whitespace-nowrap border-b-2 transition-colors ${filter === 'all' ? 'text-primary' : 'text-muted hover:text-token'}`} style={filter === 'all' ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}>All ({items.length})</button>
        {PRODUCTION_STATUSES.map((s) => {
          const count = items.filter((i) => i.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] whitespace-nowrap border-b-2 transition-colors ${filter === s ? 'text-primary' : 'text-muted hover:text-token'}`} style={filter === s ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted">Loading production queue…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-token p-10 text-center"><p className="font-display text-xl text-token">No items in this stage</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => {
            const idx = statusIndex(item.status);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }} className="bg-surface border border-token p-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Product info */}
                  <div className="flex items-start gap-4 lg:w-80 shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-14 h-16 object-cover bg-token-alt shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display text-base text-token line-clamp-2">{item.productName}</p>
                      <p className="font-body text-xs text-muted mt-1">{item.orderNumber}</p>
                      <p className="font-body text-xs text-muted">{item.customerName}</p>
                      <p className="font-body text-xs text-muted mt-1">Updated {fmtDate(item.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Status pipeline */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                      {PRODUCTION_STATUSES.map((s, si) => {
                        const done = si < idx;
                        const current = si === idx;
                        return (
                          <div key={s} className="flex items-center shrink-0">
                            <button
                              onClick={() => handleStatusChange(item.id, s)}
                              className="px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-body border transition-colors whitespace-nowrap"
                              style={{
                                borderColor: done || current ? STATUS_COLOR[s] : 'var(--border)',
                                background: current ? STATUS_COLOR[s] : 'transparent',
                                color: current ? 'var(--btn-text)' : done ? STATUS_COLOR[s] : 'var(--text-muted)',
                                opacity: done || current ? 1 : 0.5,
                              }}
                            >
                              {s}
                            </button>
                            {si < PRODUCTION_STATUSES.length - 1 && <ChevronRight size={12} className="text-muted mx-0.5 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Assignments */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <AssignmentCard
                        icon={<Scissors size={14} />}
                        label="Tailor"
                        name={item.tailorName}
                        onAssign={() => setAssigning(item)}
                      />
                      <AssignmentCard
                        icon={<Palette size={14} />}
                        label="Designer"
                        name={item.designerName}
                        onAssign={() => setAssigning(item)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign modal */}
      {assigning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssigning(null)} />
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-md bg-token border border-token shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-token">Assign Staff</h2>
              <button onClick={() => setAssigning(null)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
            </div>
            <p className="font-body text-sm text-muted mb-4">{assigning.orderNumber} — {assigning.productName}</p>

            {/* Tailor */}
            <div className="mb-5">
              <p className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-2 flex items-center gap-1.5"><Scissors size={12} /> Tailor</p>
              <div className="space-y-1.5">
                <button onClick={() => handleAssign(assigning.id, { tailorId: null, tailorName: null })} className={`w-full text-left px-3 py-2.5 font-body text-sm border transition-colors ${!assigning.tailorId ? 'text-primary' : 'text-token hover:text-primary'}`} style={{ borderColor: !assigning.tailorId ? 'var(--primary)' : 'var(--border)' }}>Unassigned</button>
                {tailors.map((t) => (
                  <button key={t.id} onClick={() => handleAssign(assigning.id, { tailorId: t.id, tailorName: t.fullName })} className={`w-full text-left px-3 py-2.5 font-body text-sm border transition-colors ${assigning.tailorId === t.id ? 'text-primary' : 'text-token hover:text-primary'}`} style={{ borderColor: assigning.tailorId === t.id ? 'var(--primary)' : 'var(--border)' }}>
                    {t.fullName}
                  </button>
                ))}
              </div>
            </div>

            {/* Designer */}
            <div>
              <p className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-2 flex items-center gap-1.5"><Palette size={12} /> Designer</p>
              <div className="space-y-1.5">
                <button onClick={() => handleAssign(assigning.id, { designerId: null, designerName: null })} className={`w-full text-left px-3 py-2.5 font-body text-sm border transition-colors ${!assigning.designerId ? 'text-primary' : 'text-token hover:text-primary'}`} style={{ borderColor: !assigning.designerId ? 'var(--primary)' : 'var(--border)' }}>Unassigned</button>
                {designers.map((d) => (
                  <button key={d.id} onClick={() => handleAssign(assigning.id, { designerId: d.id, designerName: d.fullName })} className={`w-full text-left px-3 py-2.5 font-body text-sm border transition-colors ${assigning.designerId === d.id ? 'text-primary' : 'text-token hover:text-primary'}`} style={{ borderColor: assigning.designerId === d.id ? 'var(--primary)' : 'var(--border)' }}>
                    {d.fullName}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function AssignmentCard({ icon, label, name, onAssign }: { icon: React.ReactNode; label: string; name: string | null; onAssign: () => void }) {
  return (
    <button onClick={onAssign} className="flex items-center gap-3 p-3 border border-token hover:border-primary transition-colors text-left">
      <span className="text-muted">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs uppercase tracking-[0.1em] text-muted">{label}</p>
        <p className="font-body text-sm text-token truncate">{name ?? 'Unassigned'}</p>
      </div>
      <User size={14} className="text-muted shrink-0" />
    </button>
  );
}
