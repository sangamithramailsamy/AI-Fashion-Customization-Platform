import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/context/ToastContext';
import { FormField } from '@/components/FormField';
import type { CustomerProfile, Gender } from '@/types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

export default function AccountProfilePage() {
  const { profile, updateProfile } = useCustomer();
  console.log("PROFILE DATA:", profile);
  const { notify } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CustomerProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile) {
      setForm(profile);
    }
  }, [profile]);

  if (!profile || !form) {
    return <p className="font-body text-muted">Loading profile...</p>;
  }

  const set = <K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+\d][\d\s-]{8,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile(form);
      notify('Profile updated', 'info');
      setEditing(false);
    } catch {
      notify('Unable to save profile', 'remove');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setErrors({});
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Profile</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Your Profile</h1>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body">
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-surface border border-token flex items-center justify-center font-display text-2xl" style={{ color: 'var(--primary)' }}>
            {(form.fullName || "").charAt(0).toUpperCase()}
          </div>
          {editing && (
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center"
              style={{ color: 'var(--btn-text)' }}
              aria-label="Change profile image"
            >
              <Camera size={15} />
            </button>
          )}
        </div>
        <div>
          <p className="font-display text-xl text-token">{form.fullName}</p>
          <p className="font-body text-sm text-muted">{form.email}</p>
        </div>
      </div>

      <motion.div layout className="bg-surface border border-token p-6 md:p-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="profile-name" label="Full Name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName ?? null} disabled={!editing} autoComplete="name" />
          <FormField id="profile-email" label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email ?? null} disabled={!editing} autoComplete="email" />
          <FormField id="profile-phone" label="Phone Number" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone ?? null} disabled={!editing} autoComplete="tel" />
          <FormField id="profile-dob" label="Date of Birth (optional)" type="date" value={form.dob ?? ''} onChange={(e) => set('dob', e.target.value)} disabled={!editing} />
        </div>

        <div className="mt-5">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-muted block mb-2">Gender (optional)</span>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => {
              const selected = form.gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  disabled={!editing}
                  onClick={() => set('gender', g.value)}
                  className={`px-4 py-2 text-sm font-body border transition-colors disabled:opacity-60 ${
                    selected ? 'border-primary text-primary' : 'border-token text-token hover:border-primary'
                  }`}
                  style={selected ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-8">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? 'Saving…' : (<><Check size={16} /> Save Changes</>)}
            </button>
            <button onClick={handleCancel} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">
              Cancel
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
