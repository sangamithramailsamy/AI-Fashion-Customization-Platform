import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, MapPin, Check, AlertTriangle } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/context/ToastContext';
import AddressModal from '@/components/AddressModal';
import type { ShippingAddress } from '@/types';

export default function AccountAddressesPage() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useCustomer();
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingAddress | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (addr: ShippingAddress) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleSubmit = async (addr: ShippingAddress) => {
    if (editing) {
      await updateAddress(editing.id, addr);
      notify('Address updated', 'info');
    } else {
      await addAddress(addr);
      notify('Address added', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    await removeAddress(id);
    notify('Address removed', 'remove');
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Addresses</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Saved Addresses</h1>
          <p className="font-body text-sm text-muted mt-2">Manage where your Shreemithra pieces are delivered.</p>
        </div>
        {addresses.length > 0 && (
          <button onClick={openAdd} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <Plus size={15} /> Add
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-token">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
            <MapPin size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl text-token">No saved addresses</h2>
          <p className="font-body text-sm text-muted mt-2 max-w-sm mx-auto">
            Add an address to make checkout faster and smoother.
          </p>
          <button onClick={openAdd} className="btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <Plus size={15} /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                transition={{ duration: 0.3 }}
                className="bg-surface border border-token p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-body border border-token text-token">{addr.type}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-body" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                        <Check size={11} /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(addr)} aria-label="Edit address" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(addr.id)} aria-label="Delete address" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="font-display text-lg text-token">{addr.fullName}</p>
                <p className="font-body text-sm text-muted mt-1 leading-relaxed">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}{addr.landmark ? `, near ${addr.landmark}` : ''}<br />
                  {addr.city}, {addr.state} — {addr.pincode}<br />
                  {addr.country} · {addr.phone}
                </p>
                {!addr.isDefault && (
                  <button onClick={() => setDefaultAddress(addr.id)} className="self-start mt-4 font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors">
                    Set as default
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddressModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} onSubmit={handleSubmit} title={editing ? 'Edit Address' : 'Add Address'} />

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-token mb-4" style={{ color: '#c0392b' }}>
                <AlertTriangle size={22} />
              </span>
              <h3 className="font-display text-2xl text-token">Delete this address?</h3>
              <p className="font-body text-sm text-muted mt-2">This cannot be undone. You can add a new address anytime.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body" style={{ background: '#c0392b', color: '#fff' }}>
                  Delete
                </button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
