import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Check, AlertCircle, Mail, Phone, Scissors, Palette, Headphones, Truck } from 'lucide-react';
import { employeeService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { Employee, EmployeeRole } from '@/types';

const ROLES: EmployeeRole[] = ['Tailor', 'Designer', 'Reception', 'Delivery Staff'];

const ROLE_ICON: Record<EmployeeRole, typeof Scissors> = {
  Tailor: Scissors,
  Designer: Palette,
  Reception: Headphones,
  'Delivery Staff': Truck,
};

interface EmployeeForm {
  fullName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  active: boolean;
}

const EMPTY_FORM: EmployeeForm = { fullName: '', email: '', phone: '', role: 'Tailor', active: true };

export default function EmployeeManagementPage() {
  const { notify } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    employeeService.list().then(setEmployees).finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && e.role !== roleFilter) return false;
    return true;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setErrors({}); setModalOpen(true); };
  const openEdit = (e: Employee) => {
    setForm({ fullName: e.fullName, email: e.email, phone: e.phone, role: e.role, active: e.active });
    setEditingId(e.id); setErrors({}); setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        const updated = await employeeService.update(editingId, { ...form, joinedAt: employees.find((e) => e.id === editingId)?.joinedAt ?? new Date().toISOString() });
        setEmployees((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
        notify('Employee updated', 'info');
      } else {
        const created = await employeeService.create(form);
        setEmployees((prev) => [created, ...prev]);
        notify('Employee added', 'info');
      }
      setModalOpen(false);
    } catch { notify('Unable to save employee', 'remove'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeService.remove(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      notify('Employee removed', 'remove');
    } catch { notify('Unable to remove employee', 'remove'); }
    finally { setConfirmDelete(null); }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Team</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Employee Management</h1>
          <p className="font-body text-sm text-muted mt-2">Manage your atelier staff and their roles.</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees…" className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as EmployeeRole | 'all')} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="font-body text-sm text-muted col-span-full">Loading employees…</p>
        ) : filtered.length === 0 ? (
          <p className="font-body text-sm text-muted col-span-full text-center py-8">No employees found.</p>
        ) : (
          filtered.map((e) => {
            const RoleIcon = ROLE_ICON[e.role];
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-surface border border-token p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="h-11 w-11 rounded-full flex items-center justify-center border border-token font-display text-base text-token">
                    {e.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${e.active ? 'bg-green-500' : 'bg-red-400'}`} />
                </div>
                <p className="font-display text-lg text-token">{e.fullName}</p>
                <p className="font-body text-xs text-muted flex items-center gap-1.5 mt-1"><RoleIcon size={12} /> {e.role}</p>
                <p className="font-body text-xs text-muted mt-2 truncate">{e.email}</p>
                <p className="font-body text-xs text-muted">{e.phone}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-token">
                  <span className="font-body text-xs text-muted">{e.assignedOrders} assigned</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(e)} aria-label="Edit" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => setConfirmDelete(e.id)} aria-label="Delete" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-md bg-token border border-token shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-token">{editingId !== null ? 'Edit Employee' : 'Add Employee'}</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <FormInput label="Full Name" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} error={errors.fullName} />
                <FormInput label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} error={errors.email} icon={<Mail size={14} />} />
                <FormInput label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} error={errors.phone} icon={<Phone size={14} />} />
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as EmployeeRole }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="sr-only peer" />
                  <span className="h-4 w-4 border border-token flex items-center justify-center" style={form.active ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {form.active && <Check size={11} style={{ color: 'var(--btn-text)' }} />}
                  </span>
                  <span className="font-body text-sm text-token">Active</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? 'Saving…' : (<><Check size={15} /> {editingId !== null ? 'Save' : 'Add'}</>)}
                </button>
                <button onClick={() => setModalOpen(false)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <h3 className="font-display text-2xl text-token">Remove employee?</h3>
              <p className="font-body text-sm text-muted mt-2">This will remove the employee from your team. This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body" style={{ background: '#c0392b', color: '#fff' }}>Remove</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange, error, type = 'text', icon }: { label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="font-body text-sm text-token block mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon ? 'pl-9' : 'pl-4'} pr-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors`} style={error ? { borderColor: '#c0392b' } : {}} />
      </div>
      {error && <p className="flex items-center gap-1 font-body text-xs mt-1" style={{ color: '#c0392b' }}><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}
