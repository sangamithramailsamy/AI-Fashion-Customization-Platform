import { useState } from 'react';
import { FormField } from './FormField';
import type { ShippingAddress, AddressType } from '@/types';

interface Props {
  initial?: ShippingAddress | null;
  onSubmit: (addr: ShippingAddress) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other'];

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save Address' }: Props) {
  const [form, setForm] = useState<ShippingAddress>(
    initial ?? {
      id: '',
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'Home',
      isDefault: false,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+\d][\d\s-]{8,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!form.line1.trim()) e.line1 = 'Address line 1 is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'PIN code is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="addr-fullname"
        label="Full Name"
        value={form.fullName}
        onChange={(e) => set('fullName', e.target.value)}
        error={errors.fullName ?? null}
        autoComplete="name"
      />
      <FormField
        id="addr-phone"
        label="Phone Number"
        value={form.phone}
        onChange={(e) => set('phone', e.target.value)}
        error={errors.phone ?? null}
        helper="Include country code, e.g. +91 98765 43210"
        autoComplete="tel"
      />
      <FormField
        id="addr-line1"
        label="Address Line 1"
        value={form.line1}
        onChange={(e) => set('line1', e.target.value)}
        error={errors.line1 ?? null}
        placeholder="House / Flat number, street"
      />
      <FormField
        id="addr-line2"
        label="Address Line 2 (optional)"
        value={form.line2 ?? ''}
        onChange={(e) => set('line2', e.target.value)}
      />
      <FormField
        id="addr-landmark"
        label="Landmark (optional)"
        value={form.landmark ?? ''}
        onChange={(e) => set('landmark', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="addr-city"
          label="City"
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          error={errors.city ?? null}
        />
        <FormField
          id="addr-state"
          label="State"
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
          error={errors.state ?? null}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="addr-pincode"
          label="PIN Code"
          value={form.pincode}
          onChange={(e) => set('pincode', e.target.value)}
          error={errors.pincode ?? null}
          inputMode="numeric"
          maxLength={6}
        />
        <FormField
          id="addr-country"
          label="Country"
          value={form.country}
          onChange={(e) => set('country', e.target.value)}
        />
      </div>

      <div>
        <span className="font-body text-xs uppercase tracking-[0.2em] text-muted block mb-2">Address Type</span>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_TYPES.map((t) => {
            const selected = form.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`px-4 py-2 text-sm font-body border transition-colors ${
                  selected ? 'border-primary text-primary' : 'border-token text-token hover:border-primary'
                }`}
                style={selected ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set('isDefault', e.target.checked)}
          className="sr-only peer"
        />
        <span
          className="h-4 w-4 border border-token flex items-center justify-center"
          style={form.isDefault ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
        >
          {form.isDefault && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
        </span>
        <span className="font-body text-sm text-token">Set as default address</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">
          Cancel
        </button>
      </div>
    </form>
  );
}
