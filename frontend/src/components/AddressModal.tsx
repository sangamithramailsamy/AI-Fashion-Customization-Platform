import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import AddressForm from './AddressForm';
import type { ShippingAddress } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: ShippingAddress | null;
  onSubmit: (addr: ShippingAddress) => void;
  title?: string;
}

export default function AddressModal({ open, onClose, initial, onSubmit, title = 'Add Address' }: Props) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-lg mt-16 mb-8 mx-4 bg-token border border-token shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-token sticky top-0 bg-token z-10">
          <h3 className="font-display text-2xl text-token">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
            <X size={22} />
          </button>
        </div>
        <div className="p-5">
          <AddressForm
            initial={initial}
            onSubmit={(addr) => {
              onSubmit(addr);
              onClose();
            }}
            onCancel={onClose}
            submitLabel={initial ? 'Update Address' : 'Save Address'}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
