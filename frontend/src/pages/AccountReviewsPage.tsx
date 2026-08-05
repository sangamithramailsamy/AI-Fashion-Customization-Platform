import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Edit2, Trash2, X, Check } from 'lucide-react';
import { useReviews } from '@/context/ReviewContext';
import { useOrders } from '@/context/OrderContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Tab = 'published' | 'pending';

export default function AccountReviewsPage() {
  const { reviews, removeReview } = useReviews();
  const { orders } = useOrders();
  
  console.log("ORDERS:", orders);
  console.log("REVIEWS:", reviews);

  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>('published');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Pending reviews = delivered order items not yet reviewed
  const reviewedProductIds = new Set(reviews.filter((r) => r.status === 'published').map((r) => r.productId));
  const pendingItems = orders
    .filter((o) => o.status === 'DELIVERED')
    .flatMap((o) => o.items.map((item) => ({ ...item, orderId: o.id })))
    .filter((item) => !reviewedProductIds.has(item.productId));

  const publishedReviews = reviews.filter((r) => r.status === 'published');

  return (
    <div>
      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Reviews</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Your Reviews</h1>
      <p className="font-body text-sm text-muted mt-2">Share your experience with pieces you've received.</p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mt-6 mb-6">
        <button
          onClick={() => setTab('published')}
          className={`flex items-center gap-2 px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] border-b-2 transition-colors ${tab === 'published' ? 'text-primary' : 'text-muted hover:text-token'}`}
          style={tab === 'published' ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}
        >
          Published ({publishedReviews.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 font-body text-xs uppercase tracking-[0.15em] border-b-2 transition-colors ${tab === 'pending' ? 'text-primary' : 'text-muted hover:text-token'}`}
          style={tab === 'pending' ? { borderColor: 'var(--primary)' } : { borderColor: 'transparent' }}
        >
          Pending ({pendingItems.length})
        </button>
      </div>

      {tab === 'pending' && (
        pendingItems.length === 0 ? (
          <div className="bg-surface border border-token p-10 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
              <Star size={26} strokeWidth={1.5} />
            </span>
            <h2 className="font-display text-2xl text-token">No pending reviews</h2>
            <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
              After you receive a piece, you'll be able to share your experience here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {pendingItems.map((item, i) => (
                <motion.div
                  key={`${item.orderId}-${item.productId}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bg-surface border border-token p-5 flex items-center gap-4"
                >
                  <img src={item.productImage} alt={item.productName} className="w-16 h-20 object-cover bg-token-alt shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-display text-lg text-token hover:text-primary transition-colors line-clamp-1">{item.productName}</h3>
                    </Link>
                    <p className="font-body text-xs text-muted mt-0.5">{item.size} · {item.color} · Qty {item.quantity}</p>
                    <p className="font-body text-xs mt-1" style={{ color: 'var(--anim-bronze)' }}>Awaiting your review</p>
                  </div>
                  <Link
                    to={`/account/reviews/write?orderId=${item.orderId}&productId=${item.productId}`}
                    className="btn-primary px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Star size={13} /> Write Review
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {tab === 'published' && (
        publishedReviews.length === 0 ? (
          <div className="bg-surface border border-token p-10 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
              <Star size={26} strokeWidth={1.5} />
            </span>
            <h2 className="font-display text-2xl text-token">No published reviews yet</h2>
            <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
              Your published reviews will appear here. Check the Pending tab for items awaiting review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {publishedReviews.map((r, i) => (
                <motion.article
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bg-surface border border-token p-5"
                >
                  <div className="flex gap-4">
                    <Link to={`/product/${r.productId}`}>
                      <img src={r.productImage} alt={r.productName} className="w-16 h-20 object-cover bg-token-alt shrink-0" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${r.productId}`}>
                            <h3 className="font-display text-lg text-token hover:text-primary transition-colors">{r.productName}</h3>
                          </Link>
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={13}
                                className={idx < r.rating ? 'fill-current' : ''}
                                style={{ color: idx < r.rating ? 'var(--anim-bronze)' : 'var(--border)' }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button aria-label="Edit review" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setConfirmDelete(r.id)} aria-label="Delete review" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <p className="font-display text-base text-token mt-2">{r.title}</p>
                      <p className="font-body text-sm text-muted mt-1 leading-relaxed">{r.body}</p>
                      {r.media && r.media.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {r.media.map((m) => (
                            <img key={m.id} src={m.preview} alt={m.name} className="w-16 h-16 object-cover border border-token" />
                          ))}
                        </div>
                      )}
                      <p className="font-body text-xs text-muted mt-2">{fmtDate(r.createdAt)}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <h3 className="font-display text-2xl text-token">Delete this review?</h3>
              <p className="font-body text-sm text-muted mt-2">This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => { await removeReview(confirmDelete); notify('Review deleted', 'remove'); setConfirmDelete(null); }}
                  className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body"
                  style={{ background: '#c0392b', color: '#fff' }}
                >
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
