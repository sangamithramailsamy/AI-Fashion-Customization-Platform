import apiClient from './apiClient';
import type { Coupon, AppliedCoupon } from '@/types';

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === 'percent') return Math.round((subtotal * coupon.value) / 100);
  return coupon.value;
}

export const couponService = {
  async validate(code: string, subtotal: number): Promise<AppliedCoupon> {
    try {
      const res = await apiClient.post('/discounts/coupons/validate/', { code, subtotal });
      return res.data as AppliedCoupon;
    } catch (err: any) {
      const message = err.response?.data?.message ?? err.response?.data?.detail ?? 'Invalid coupon.';
      throw { status: 'invalid', message };
    }
  },
};
