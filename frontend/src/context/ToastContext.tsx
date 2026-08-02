import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, ShoppingBag, Trash2, Info, X } from 'lucide-react';

type ToastType = 'cart' | 'wishlist' | 'remove' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  notify: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastState | undefined>(undefined);

const ICONS: Record<ToastType, typeof Check> = {
  cart: ShoppingBag,
  wishlist: Heart,
  remove: Trash2,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="pointer-events-auto flex items-center gap-3 bg-surface border border-token shadow-xl px-4 py-3 max-w-xs"
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                  style={{
                    background:
                      t.type === 'remove' ? 'transparent' : 'var(--primary)',
                    color: t.type === 'remove' ? 'var(--text-muted)' : 'var(--btn-text)',
                    border: t.type === 'remove' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <p className="font-body text-sm text-token leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="text-muted hover:text-token transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
