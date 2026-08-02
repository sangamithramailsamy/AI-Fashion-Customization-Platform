import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Megaphone, ShoppingBag, CreditCard, Scissors, Bell, CheckCheck, Trash2, Check } from 'lucide-react';
import { ownerNotificationService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { OwnerNotification, OwnerNotificationType } from '@/types';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TYPE_META: Record<OwnerNotificationType, { icon: typeof Bell; label: string; color: string }> = {
  broadcast: { icon: Megaphone, label: 'Broadcast', color: 'var(--primary)' },
  order: { icon: ShoppingBag, label: 'Order Update', color: 'var(--anim-bronze)' },
  payment: { icon: CreditCard, label: 'Payment', color: 'var(--anim-olive)' },
  production: { icon: Scissors, label: 'Production', color: 'var(--anim-bronze)' },
};

interface SendForm {
  type: OwnerNotificationType;
  title: string;
  message: string;
  audience: 'all' | 'order';
}

const EMPTY_FORM: SendForm = { type: 'broadcast', title: '', message: '', audience: 'all' };

export default function NotificationManagementPage() {
  const { notify } = useToast();
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SendForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    ownerNotificationService.list().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    try {
      const created = await ownerNotificationService.send({
        type: form.type, title: form.title.trim(), message: form.message.trim(), audience: form.audience,
      });
      setNotifications((prev) => [created, ...prev]);
      notify('Notification sent', 'info');
      setModalOpen(false);
      setForm(EMPTY_FORM);
    } catch { notify('Unable to send notification', 'remove'); }
    finally { setSending(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await ownerNotificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notify('Notification deleted', 'remove');
    } catch {
      notify('Unable to delete notification', 'remove');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await ownerNotificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      notify('Unable to mark notification', 'remove');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ownerNotificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      notify('All notifications marked as read', 'info');
    } catch {
      notify('Unable to mark all notifications', 'remove');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Communications</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Notification Management</h1>
          <p className="font-body text-sm text-muted mt-2">Send and track customer notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleMarkAllRead} className="btn-outline px-4 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <CheckCheck size={14} /> Mark All Read
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); }} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <Plus size={14} /> Send Notification
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="font-body text-sm text-muted">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="bg-surface border border-token p-10 text-center"><p className="font-display text-xl text-token">No notifications sent yet</p></div>
        ) : (
          notifications.map((n, i) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }} className="bg-surface border border-token p-5">
                <div className="flex items-start gap-4">
                  <span className="h-10 w-10 flex items-center justify-center border border-token shrink-0" style={{ color: meta.color }}>
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-base text-token">{n.title}</p>
                        <p className="font-body text-xs uppercase tracking-[0.1em] mt-0.5" style={{ color: meta.color }}>{meta.label}</p>
                      </div>
                      <span className="font-body text-xs text-muted shrink-0">{fmtDate(n.sentAt)}</span>
                    </div>
                    <p className="font-body text-sm text-muted mt-2 leading-relaxed">{n.message}</p>
                    <p className="font-body text-xs text-muted mt-2">Audience: {n.audience === 'all' ? 'All customers' : 'Specific order'}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n.id)} className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary inline-flex items-center gap-1">
                          <Check size={12} /> Mark Read
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="font-body text-xs uppercase tracking-[0.15em] hover:text-primary inline-flex items-center gap-1" style={{ color: '#c0392b' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Send modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-md bg-token border border-token shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-token">Send Notification</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as OwnerNotificationType }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
                    <option value="broadcast">Broadcast</option>
                    <option value="order">Order Update</option>
                    <option value="payment">Payment</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Audience</label>
                  <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as 'all' | 'order' }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
                    <option value="all">All Customers</option>
                    <option value="order">Specific Order</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Title</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" style={errors.title ? { borderColor: '#c0392b' } : {}} />
                  {errors.title && <p className="font-body text-xs mt-1" style={{ color: '#c0392b' }}>{errors.title}</p>}
                </div>
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none" style={errors.message ? { borderColor: '#c0392b' } : {}} />
                  {errors.message && <p className="font-body text-xs mt-1" style={{ color: '#c0392b' }}>{errors.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSend} disabled={sending} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending ? 'Sending…' : (<><Send size={15} /> Send</>)}
                </button>
                <button onClick={() => setModalOpen(false)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
