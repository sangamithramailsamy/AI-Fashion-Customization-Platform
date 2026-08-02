import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { reviewService, type ReviewSubmission } from '@/services/reviewService';
import type { ReviewItem } from '@/types';

interface ReviewState {
  reviews: ReviewItem[];
  loading: boolean;
  submitReview: (submission: ReviewSubmission) => Promise<ReviewItem>;
  updateReview: (id: string, updates: Partial<ReviewItem>) => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  hasReviewed: (productId: number) => boolean;
  refresh: () => void;
}

const ReviewContext = createContext<ReviewState | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await reviewService.list();
      setReviews(list);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitReview = useCallback(async (submission: ReviewSubmission) => {
    const review = await reviewService.submit(submission);
    setReviews((prev) => [review, ...prev]);
    return review;
  }, []);

  const updateReview = useCallback(async (id: string, updates: Partial<ReviewItem>) => {
    const updated = await reviewService.update(id, updates);
    setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const removeReview = useCallback(async (id: string) => {
    await reviewService.remove(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const hasReviewed = useCallback(
    (productId: number) => reviews.some((r) => r.productId === productId && r.status === 'published'),
    [reviews]
  );

  const value: ReviewState = {
    reviews,
    loading,
    submitReview,
    updateReview,
    removeReview,
    hasReviewed,
    refresh: load,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviews(): ReviewState {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewProvider');
  return ctx;
}
