import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Star, Eye, EyeOff, Trash2, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { reviewModerationService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { OwnerReview } from '@/types';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Filter = 'all' | 'visible' | 'hidden';

export default function ReviewModerationPage() {
  const { notify } = useToast();
  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [selected, setSelected] = useState<OwnerReview | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
  reviewModerationService
    .list()
    .then((data) => {
      setReviews(Array.isArray(data) ? data : []);
    })
    .catch((error) => {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    })
    .finally(() => setLoading(false));
}, []);
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (search && !r.customerName.toLowerCase().includes(search.toLowerCase()) && !r.productName.toLowerCase().includes(search.toLowerCase()) && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'visible' && r.hidden) return false;
      if (filter === 'hidden' && !r.hidden) return false;
      if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
      return true;
    });
  }, [reviews, search, filter, ratingFilter]);

  const handleToggleHidden = async (id: string, hidden: boolean) => {
    try {
      const updated = await reviewModerationService.toggleHidden(id, hidden);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSelected(updated);
      notify(hidden ? 'Review hidden' : 'Review made visible', 'info');
    } catch { notify('Unable to update review', 'remove'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await reviewModerationService.remove(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setSelected(null);
      notify('Review deleted', 'remove');
    } catch { notify('Unable to delete review', 'remove'); }
    finally { setConfirmDelete(null); }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await reviewModerationService.reply(selected.id, replyText.trim());
      setReviews((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(updated);
      setReplyText('');
      notify('Reply posted', 'info');
    } catch {
      notify('Unable to post reply', 'remove');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Moderation</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Review Moderation</h1>
      <p className="font-body text-sm text-muted mt-2">Manage customer reviews and ratings.</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews…" className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Reviews</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Reviews list */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="font-body text-sm text-muted">Loading reviews…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-token p-10 text-center"><p className="font-display text-xl text-token">No reviews found</p></div>
        ) : (
          filtered.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }} className="bg-surface border border-token p-5">
              <div className="flex items-start gap-4">
                <img src={review.productImage} alt={review.productName} className="w-12 h-14 object-cover bg-token-alt shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-base text-token">{review.title}</p>
                      <p className="font-body text-xs text-muted mt-0.5">{review.productName}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} className={s <= review.rating ? 'fill-current' : ''} style={{ color: s <= review.rating ? 'var(--anim-bronze)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted mt-2 line-clamp-2">{review.body}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-token">
                    <div>
                      <p className="font-body text-xs text-token">{review.customerName}</p>
                      <p className="font-body text-xs text-muted">{fmtDate(review.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.hidden && <span className="px-2 py-1 text-[10px] uppercase tracking-[0.15em] font-body border" style={{ color: '#c0392b', borderColor: '#c0392b' }}>Hidden</span>}
                      <button onClick={() => handleToggleHidden(review.id, !review.hidden)} aria-label={review.hidden ? 'Show review' : 'Hide review'} className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                        {review.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => setConfirmDelete(review.id)} aria-label="Delete review" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><Trash2 size={15} /></button>
                      <button onClick={() => setSelected(review)} aria-label="View details" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }} className="relative w-full max-w-md h-full bg-token border-l border-token overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-token">Review Details</h2>
                <button onClick={() => setSelected(null)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>
              <img src={selected.productImage} alt={selected.productName} className="w-full h-48 object-cover bg-token-alt mb-4" />
              <p className="font-display text-lg text-token">{selected.productName}</p>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= selected.rating ? 'fill-current' : ''} style={{ color: s <= selected.rating ? 'var(--anim-bronze)' : 'var(--border)' }} />
                ))}
              </div>
              <h3 className="font-display text-xl text-token mt-4">{selected.title}</h3>
              <p className="font-body text-sm text-muted mt-2 leading-relaxed">{selected.body}</p>
              <p className="font-body text-xs text-muted mt-4">{selected.customerName} · {fmtDate(selected.createdAt)}</p>
              {selected.hidden && <p className="font-body text-xs mt-2" style={{ color: '#c0392b' }}>This review is hidden from customers.</p>}

              {/* Existing reply */}
              {selected.reply && (
                <div className="mt-4 p-3 bg-token-alt border border-token">
                  <p className="font-body text-xs uppercase tracking-[0.15em] text-muted mb-1">Your reply</p>
                  <p className="font-body text-sm text-token">{selected.reply}</p>
                  {selected.repliedAt && <p className="font-body text-xs text-muted mt-1">{fmtDate(selected.repliedAt)}</p>}
                </div>
              )}

              {/* Reply input */}
              <div className="mt-4">
                <label className="font-body text-sm text-token block mb-1.5">Reply to this review</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Write a reply…"
                  className="w-full px-3 py-2 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replying}
                  className="btn-primary mt-2 px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={13} /> {replying ? 'Posting…' : 'Post Reply'}
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => handleToggleHidden(selected.id, !selected.hidden)} className="btn-outline flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
                  {selected.hidden ? <><Eye size={15} /> Show</> : <><EyeOff size={15} /> Hide</>}
                </button>
                <button onClick={() => setConfirmDelete(selected.id)} className="btn-primary px-6 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2" style={{ background: '#c0392b', color: '#fff' }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[96] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <h3 className="font-display text-2xl text-token">Delete this review?</h3>
              <p className="font-body text-sm text-muted mt-2">This will permanently remove the review. This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body" style={{ background: '#c0392b', color: '#fff' }}>Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
