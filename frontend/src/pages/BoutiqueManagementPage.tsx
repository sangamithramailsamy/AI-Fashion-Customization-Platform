import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Save, X, Check, ImagePlus, Clock } from 'lucide-react';
import { boutiqueService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { BoutiqueProfile } from '@/types';

export default function BoutiqueManagementPage() {
  const { notify } = useToast();
  const [boutique, setBoutique] = useState<BoutiqueProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BoutiqueProfile | null>(null);

  useEffect(() => {
    boutiqueService.get().then((b) => {
      setBoutique(b);
      setForm(b);
    });
  }, []);

  if (!boutique || !form) {
    return <p className="font-body text-sm text-muted">Loading boutique…</p>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await boutiqueService.update(form);
      setBoutique(updated);
      setEditing(false);
      notify('Boutique details saved', 'info');
    } catch {
      notify('Unable to save boutique details', 'remove');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm(boutique);
    setEditing(false);
  };

  const set = <K extends keyof BoutiqueProfile>(key: K, value: BoutiqueProfile[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Boutique</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Boutique Management</h1>
      <p className="font-body text-sm text-muted mt-2">Manage your boutique profile and operating details.</p>

      <div className="flex items-center gap-3 mt-6">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <Store size={14} /> Edit Boutique
          </button>
        ) : (
          <>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2 disabled:opacity-60">
              {saving ? 'Saving…' : (<><Save size={14} /> Save Changes</>)}
            </button>
            <button onClick={cancel} className="btn-outline px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
              <X size={14} /> Cancel
            </button>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid lg:grid-cols-[1fr_2fr] gap-6 mt-8"
      >
        {/* Logo / image placeholder */}
        <div className="bg-surface border border-token p-6">
          <div className="aspect-square border-2 border-dashed border-token flex flex-col items-center justify-center text-muted">
            <ImagePlus size={32} strokeWidth={1.4} />
            <p className="font-body text-xs mt-2 text-center px-4">Logo / boutique image upload</p>
            <p className="font-body text-[10px] mt-1 text-muted/70">Arrives with Cloudinary integration</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${boutique.active ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="font-body text-sm text-token">{boutique.active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-surface border border-token p-6">
          <dl className="space-y-4">
            <Field label="Boutique Name" editing={editing} value={form.name} onChange={(v) => set('name', v)} />
            <Field label="Owner" editing={editing} value={form.owner} onChange={(v) => set('owner', v)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone" editing={editing} value={form.phone} onChange={(v) => set('phone', v)} />
              <Field label="Email" editing={editing} value={form.email} onChange={(v) => set('email', v)} />
            </div>
            <Field label="Address Line 1" editing={editing} value={form.line1} onChange={(v) => set('line1', v)} />
            <Field label="Address Line 2" editing={editing} value={form.line2 ?? ''} onChange={(v) => set('line2', v)} />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="City" editing={editing} value={form.city} onChange={(v) => set('city', v)} />
              <Field label="State" editing={editing} value={form.state} onChange={(v) => set('state', v)} />
              <Field label="Pincode" editing={editing} value={form.pincode} onChange={(v) => set('pincode', v)} />
            </div>
            <div>
              <dt className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-1.5">Description</dt>
              {editing ? (
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none"
                />
              ) : (
                <dd className="font-body text-sm text-token leading-relaxed">{form.description}</dd>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <dt className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-1.5 flex items-center gap-1.5"><Clock size={12} /> Opening Time</dt>
                {editing ? (
                  <input type="time" value={form.openingTime} onChange={(e) => set('openingTime', e.target.value)} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
                ) : (
                  <dd className="font-body text-sm text-token">{form.openingTime}</dd>
                )}
              </div>
              <div>
                <dt className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-1.5 flex items-center gap-1.5"><Clock size={12} /> Closing Time</dt>
                {editing ? (
                  <input type="time" value={form.closingTime} onChange={(e) => set('closingTime', e.target.value)} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
                ) : (
                  <dd className="font-body text-sm text-token">{form.closingTime}</dd>
                )}
              </div>
            </div>
            {editing && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="sr-only peer" />
                <span className="h-4 w-4 border border-token flex items-center justify-center" style={form.active ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                  {form.active && <Check size={11} style={{ color: 'var(--btn-text)' }} />}
                </span>
                <span className="font-body text-sm text-token">Boutique is active</span>
              </label>
            )}
          </dl>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, editing, value, onChange }: { label: string; editing: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <dt className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-1.5">{label}</dt>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        />
      ) : (
        <dd className="font-body text-sm text-token">{value || '—'}</dd>
      )}
    </div>
  );
}
