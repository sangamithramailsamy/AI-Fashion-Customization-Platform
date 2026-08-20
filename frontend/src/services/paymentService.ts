import apiClient from './apiClient';
import type { PaymentMethod, PaymentStatus } from '@/types';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

    config?: {
      display?: {
        blocks?: {
          [key: string]: {
          name: string;
          instruments: {
            method: string;
          }[];
        };
      };
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };

  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

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
  {
    method: 'upi',
    label: 'UPI',
    description: 'Pay using any UPI app (GPay, PhonePe, Paytm)',
    enabled: true,
  },
  {
    method: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    enabled: true,
  },
  {
    method: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    enabled: false,
  },
];

export const paymentService = {

  async processPayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {

    // 1. Create Razorpay order through Django
    const res = await apiClient.post(
      '/payments/create-razorpay-order/',
      {
        order_id: Number(request.orderId),
        amount: request.amount,
        payment_type: request.isAdvance
          ? 'ADVANCE'
          : 'FULL',
      }
    );

    const data = res.data;

    // 2. Open Razorpay Checkout
    return new Promise<PaymentResult>((resolve, reject) => {

      const options: RazorpayOptions = {
        key: data.razorpay_key_id,

        amount: data.amount,

        currency: data.currency,

        name: 'Shreemithra Ladies Boutique',

        description: request.isAdvance
          ? 'Advance Payment'
          : 'Order Payment',

        order_id: data.razorpay_order_id,

        config: {
  display: {
    blocks: {
      upi_only: {
        name: 'Pay via UPI',
        instruments: [
          {
            method: 'upi',
          },
        ],
      },
    },
    sequence: ['block.upi_only'],
    preferences: {
      show_default_blocks: false,
    },
  },
},


        // 3. Razorpay calls this after successful payment
        handler: async (
          response: RazorpayResponse
        ) => {

          try {

            // 4. Send payment details to Django
            const verifyResponse =
              await apiClient.post(
                '/payments/verify-razorpay-payment/',
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            // 5. Payment is successful only
            // after Django verification
            resolve({
              success: true,

              paymentId:
                response.razorpay_payment_id,

              status:
                verifyResponse.data.status === 'SUCCESS'
                  ? 'PAID'
                  : 'FAILED',
            });

          } catch (error) {

            console.error(
              'Payment verification failed:',
              error
            );

            reject(
              new Error(
                'Payment verification failed.'
              )
            );
          }
        },

        // 6. Customer closes Razorpay
        modal: {
          ondismiss: () => {
            reject(
              new Error(
                'Payment cancelled by customer.'
              )
            );
          },
        },
      };

      // 7. Create Razorpay instance
      const razorpay =
        new window.Razorpay(options);

      // 8. Open Razorpay Checkout
      razorpay.open();
    });
  },

  getEnabledOptions(): PaymentOption[] {
    return PAYMENT_OPTIONS.filter(
      (option) => option.enabled
    );
  },
};