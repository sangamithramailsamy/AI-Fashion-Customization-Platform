import apiClient from './apiClient';
import type { PaymentMethod, PaymentStatus } from '@/types';

export interface PaymentOption {
  method: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  isAdvance: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { method: 'upi', label: 'UPI', description: 'Pay using any UPI app (GPay, PhonePe, Paytm)', enabled: true },
  { method: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay', enabled: true },
  { method: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives', enabled: false },
];

export const paymentService = {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const res = await apiClient.post('/payments/create-razorpay-order/', {
      order_id: Number(request.orderId),
      amount: request.amount,
      payment_type: request.isAdvance ? 'ADVANCE' : 'FULL',
    });

    return res.data as PaymentResult;
  },

  getEnabledOptions(): PaymentOption[] {
    return PAYMENT_OPTIONS.filter((o) => o.enabled);
  },
};
