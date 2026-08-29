import { useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, X, ImagePlus, Check, AlertCircle } from 'lucide-react';
import { useReviews } from '@/context/ReviewContext';
import { useOrders } from '@/context/OrderContext';
import { useToast } from '@/context/ToastContext';
import type { ReviewMedia } from '@/types';

export default function WriteReviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId') ?? '';
  const productId = Number(params.get('productId') ?? 0);
  const { orders } = useOrders();
  const { submitReview, hasReviewed } = useReviews();
  const { notify } = useToast();

  const order = orders.find((o) => o.id === orderId);
  const item = order?.items.find((i) => i.productId === productId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [errors, setErrors] = useState<{ rating?: string; body?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!order || !item) {
    return (
      <div>
        <p className="font-display text-2xl text-token">Unable to review this item</p>
        <p className="font-body text-sm text-muted mt-2">This item couldn't be found in your orders.</p>
        <Link to="/account/reviews" className="btn-primary mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Reviews
        </Link>
      </div>
    );
  }

  if (hasReviewed(productId)) {
    return (
      <div>
        <p className="font-display text-2xl text-token">Already reviewed</p>
        <p className="font-body text-sm text-muted mt-2">You've already shared your experience with this piece.</p>
        <Link to="/account/reviews" className="btn-primary mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Reviews
        </Link>
      </div>
    );
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 4 - media.length).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const preview = URL.createObjectURL(file);

setMedia((prev) => [
  ...prev,
  {
    id: 'media-' + Date.now() + Math.random().toString(36).slice(2, 6),
    name: file.name,
    preview,
    file,
  }
]);
    });
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const found = prev.find((m) => m.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (rating === 0) errs.rating = 'Please select a rating';
    if (body.trim().length < 10) errs.body = 'Please write at least a few words about your experience';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await submitReview({
        productId: item.productId ?? productId,
        productName: item.productName ?? '',
        productImage: item.productImage ?? '',
        orderId,
        rating,
        title,
        body,
        media,});
      notify('Review published', 'info');
      navigate('/account/reviews');
    } catch {
      notify('Unable to submit review', 'remove');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/account/reviews" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Reviews
      </Link>

      <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Write a Review</p>
      <h1 className="font-display text-3xl md:text-4xl text-token">Share Your Experience</h1>

      {/* Product summary */}
      <div className="flex gap-4 mt-6 mb-8 bg-surface border border-token p-4">
        <img src={item.productImage} alt={item.productName} className="w-16 h-20 object-cover bg-token-alt shrink-0" />
        <div>
          <Link to={`/product/${item.productId}`}>
            <h2 className="font-display text-lg text-token hover:text-primary transition-colors">{item.productName}</h2>
          </Link>
          <p className="font-body text-xs text-muted mt-0.5">{item.size} · {item.color}</p>
          <p className="font-body text-xs text-muted mt-0.5">Order {order.orderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="bg-surface border border-token p-5">
          <label className="font-body text-sm text-token block mb-3">Your Rating</label>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const filled = (hoverRating || rating) >= value;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={filled ? 'fill-current' : ''}
                    style={{ color: filled ? 'var(--anim-bronze)' : 'var(--border)' }}
                  />
                </button>
              );
            })}
            <span className="font-body text-sm text-muted ml-2">
              {rating > 0 ? `${rating} of 5` : 'Tap a star to rate'}
            </span>
          </div>
          {errors.rating && (
            <p className="flex items-center gap-1.5 font-body text-xs mt-2" style={{ color: '#c0392b' }}>
              <AlertCircle size={12} /> {errors.rating}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="bg-surface border border-token p-5">
          <label htmlFor="review-title" className="font-body text-sm text-token block mb-2">Review Title (optional)</label>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-3 bg-token-alt border border-token font-body text-base text-token outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Body */}
        <div className="bg-surface border border-token p-5">
          <label htmlFor="review-body" className="font-body text-sm text-token block mb-2">Your Review</label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us about the fit, fabric, craftsmanship and your overall experience…"
            rows={5}
            className="w-full px-4 py-3 bg-token-alt border border-token font-body text-base text-token outline-none focus:border-primary transition-colors resize-none"
          />
          {errors.body && (
            <p className="flex items-center gap-1.5 font-body text-xs mt-2" style={{ color: '#c0392b' }}>
              <AlertCircle size={12} /> {errors.body}
            </p>
          )}
        </div>

        {/* Media */}
        <div className="bg-surface border border-token p-5">
          <label className="font-body text-sm text-token block mb-2">Add Photos (optional)</label>
          <p className="font-body text-xs text-muted mb-3">Preview only — uploads to the boutique library arrive in a later phase.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-wrap gap-3">
            {media.map((m) => (
              <div key={m.id} className="relative w-20 h-20">
                <img src={m.preview} alt={m.name} className="w-full h-full object-cover border border-token" />
                <button
                  type="button"
                  onClick={() => removeMedia(m.id)}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--text)', color: 'var(--bg)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {media.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-token flex flex-col items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus size={20} />
                <span className="font-body text-[10px] mt-1">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? 'Publishing…' : (<><Check size={16} /> Publish Review</>)}
          </button>
          <Link to="/account/reviews" className="btn-outline px-6 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
