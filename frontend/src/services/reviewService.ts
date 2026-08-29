import apiClient from './apiClient';
import type { ReviewItem, ReviewMedia } from '@/types';
import { catalogService } from './catalogService';

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
  const [reviewRes, designs] = await Promise.all([
    apiClient.get('/reviews/reviews/'),
    catalogService.listProducts(),
  ]);

  console.log('REVIEW API RESPONSE:', reviewRes.data);
  console.log('DESIGNS API RESPONSE:', designs);

  const data = Array.isArray(reviewRes.data)
    ? reviewRes.data
    : reviewRes.data?.results ?? [];

  return data.map((review: any) => {
    const design = designs.find(
      (d: any) => Number(d.id) === Number(review.design)
    );

    console.log('REVIEW:', review);
    console.log('MATCHED DESIGN:', design);

    return {
      id: String(review.id),

      productId: Number(review.design),

      productName:
        review.design_name ??
        review.product_name ??
        design?.name ??
        `Design #${review.design}`,

      productImage:
        review.design_image ??
        review.product_image ??
        design?.image ??
        '',

      rating: Number(review.rating ?? 0),

      title:
        review.title ??
        'My Review',

      body:
        review.review_text ??
        '',

      createdAt:
        review.created_at,

      status:
        review.is_approved
          ? 'published'
          : 'pending',

      media:
        review.media ?? [],
    };
  });
},

    async listByProduct(productId: number): Promise<any[]> {
    const res = await apiClient.get(
      `/reviews/reviews/product/${productId}/`
    );

    console.log('PRODUCT REVIEWS RESPONSE:', res.data);

    return Array.isArray(res.data)
      ? res.data
      : res.data?.results ?? [];
  },
  
  async submit(submission: ReviewSubmission): Promise<ReviewItem> {
  const payload = {
    review_text: submission.body,
    rating: submission.rating,
    order: Number(submission.orderId),
    design: submission.productId,
  };

  console.log('REVIEW SUBMIT PAYLOAD:', payload);

  const res = await apiClient.post(
    '/reviews/reviews/',
    payload
  );

  console.log('REVIEW CREATED:', res.data);
    // Upload review media after the review is created
if (submission.media && submission.media.length > 0) {
  for (const media of submission.media) {
    if (!media.file) continue;

    const formData = new FormData();

    formData.append('review', String(res.data.id));
    formData.append('media_type', 'IMAGE');
    formData.append('file', media.file);

    console.log('UPLOADING REVIEW MEDIA:', {
      review: res.data.id,
      file: media.file.name,
    });

    await apiClient.post(
      '/reviews/media/',
      formData
    );
  }
}

  return {
    id: String(res.data.id),
    productId: Number(res.data.design),
    productName: submission.productName,
    productImage: submission.productImage,
    rating: Number(res.data.rating),
    title: submission.title || 'My Review',
    body: res.data.review_text ?? '',
    createdAt: res.data.created_at,
    status: res.data.is_approved
      ? 'published'
      : 'pending',
  };
},
  async update(id: string, updates: Partial<ReviewItem>): Promise<ReviewItem> {
    const res = await apiClient.patch(`/reviews/reviews/${id}/`, updates);
    return res.data as ReviewItem;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reviews/reviews/${id}/`);
  },
};
