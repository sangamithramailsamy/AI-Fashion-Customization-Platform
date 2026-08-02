import apiClient from './apiClient';
import type { ReviewItem, ReviewMedia } from '@/types';

export interface ReviewSubmission {
  productId: number;
  productName: string;
  productImage: string;
  orderId: string;
  rating: number;
  title: string;
  body: string;
  media?: ReviewMedia[];
}

export const reviewService = {
  async list(): Promise<ReviewItem[]> {
    const res = await apiClient.get('/reviews/');
    return res.data as ReviewItem[];
  },

  async submit(submission: ReviewSubmission): Promise<ReviewItem> {
    const res = await apiClient.post('/reviews/', submission);
    return res.data as ReviewItem;
  },

  async update(id: string, updates: Partial<ReviewItem>): Promise<ReviewItem> {
    const res = await apiClient.patch(`/reviews/${id}/`, updates);
    return res.data as ReviewItem;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}/`);
  },
};
