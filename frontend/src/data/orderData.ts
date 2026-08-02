import type { Order, OrderStatusUpdate, OrderStatus } from '@/types';
import { DEMO_ADDRESSES, DEMO_PROFILE } from './accountData';

/**
 * Temporary demo order data for Phase 4.
 * NOT real boutique data. Replaced by Django REST responses in a later phase.
 * Shapes mirror expected Django Order model for clean swap-in.
 */

export const ORDER_STATUS_FLOW: OrderStatusUpdate[] = [
  {
    status: 'PENDING',
    label: 'Order Placed',
    description: 'Your order has been received and is being confirmed.',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Your pieces are being crafted by our atelier.',
  },
  {
    status: 'READY',
    label: 'Ready for Delivery',
    description: 'Your order is ready and will be dispatched shortly.',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    description: 'Your order has been delivered. Enjoy your pieces!',
  },
];

export function getStatusLabel(status: OrderStatus): string {
  const found = ORDER_STATUS_FLOW.find((s) => s.status === status);
  return found?.label ?? status;
}

export function getStatusDescription(status: OrderStatus): string {
  const found = ORDER_STATUS_FLOW.find((s) => s.status === status);
  return found?.description ?? '';
}

export function getStatusIndex(status: OrderStatus): number {
  if (status === 'CANCELLED') return -1;
  return ORDER_STATUS_FLOW.findIndex((s) => s.status === status);
}

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'SHR-2025-1042',
    orderDate: '2025-10-28T14:30:00Z',
    deliveryDate: '2025-11-12T00:00:00Z',
    items: [
      {
        productId: 4,
        productName: 'Embroidered Lehenga Choli',
        productImage: 'https://images.pexels.com/photos/1445665/pexels-photo-1445665.jpeg?auto=compress&cs=tinysrgb&w=900',
        size: 'M',
        color: 'Wine',
        quantity: 1,
        unitPrice: 12500,
        customizable: true,
        hasMeasurements: true,
      },
    ],
    totalAmount: 12500,
    advancePaid: 6250,
    balanceAmount: 6250,
    status: 'IN_PROGRESS',
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'upi',
    deliveryCharge: 0,
    shippingAddress: DEMO_ADDRESSES[0],
    customerName: DEMO_PROFILE.fullName,
    customerEmail: DEMO_PROFILE.email,
    createdAt: '2025-10-28T14:30:00Z',
    updatedAt: '2025-10-30T09:00:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'SHR-2025-1038',
    orderDate: '2025-10-15T11:20:00Z',
    deliveryDate: '2025-10-22T00:00:00Z',
    items: [
      {
        productId: 1,
        productName: 'Kanjeevaram Silk Saree — Peacock Motif',
        productImage: 'https://images.pexels.com/photos/1104145/pexels-photo-1104145.jpeg?auto=compress&cs=tinysrgb&w=900',
        size: 'Free Size',
        color: 'Maroon',
        quantity: 1,
        unitPrice: 8450,
        customizable: false,
      },
      {
        productId: 11,
        productName: 'Linen Shirt Dress with Belt',
        productImage: 'https://images.pexels.com/photos/2249528/pexels-photo-2249528.jpeg?auto=compress&cs=tinysrgb&w=900',
        size: 'S',
        color: 'Cream',
        quantity: 1,
        unitPrice: 2950,
        customizable: false,
      },
    ],
    totalAmount: 11400,
    advancePaid: 11400,
    balanceAmount: 0,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'card',
    couponCode: 'WELCOME10',
    couponDiscount: 1140,
    deliveryCharge: 0,
    shippingAddress: DEMO_ADDRESSES[0],
    customerName: DEMO_PROFILE.fullName,
    customerEmail: DEMO_PROFILE.email,
    createdAt: '2025-10-15T11:20:00Z',
    updatedAt: '2025-10-22T16:00:00Z',
  },
  {
    id: 'ord-3',
    orderNumber: 'SHR-2025-1051',
    orderDate: '2025-11-05T10:00:00Z',
    deliveryDate: '2025-11-20T00:00:00Z',
    items: [
      {
        productId: 3,
        productName: 'Floral Wrap Maxi Dress',
        productImage: 'https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&cs=tinysrgb&w=900',
        size: 'M',
        color: 'Sage',
        quantity: 1,
        unitPrice: 3850,
        customizable: false,
      },
    ],
    totalAmount: 4000,
    advancePaid: 0,
    balanceAmount: 4000,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    deliveryCharge: 150,
    shippingAddress: DEMO_ADDRESSES[0],
    customerName: DEMO_PROFILE.fullName,
    customerEmail: DEMO_PROFILE.email,
    createdAt: '2025-11-05T10:00:00Z',
    updatedAt: '2025-11-05T10:00:00Z',
  },
];
