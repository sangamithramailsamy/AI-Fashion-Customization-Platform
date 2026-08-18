import apiClient from './apiClient';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

export const orderService = {
  async list(): Promise<Order[]> {
    const res = await apiClient.get('/orders/orders/');
    return res.data as Order[];
  },

  async get(id: string): Promise<Order | null> {
    try {
      const res = await apiClient.get(`/orders/orders/${id}/`);
      return res.data as Order;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async create(order: Partial<Order>): Promise<Order> {
    const payload = {
  boutique: order.boutique,

  order_date: order.orderDate?.split('T')[0],
  delivery_date: order.deliveryDate?.split('T')[0],

  advance_paid: order.advancePaid ?? 0,
  status: order.status ?? 'PENDING',
  notes: order.notes ?? '',

  // Send coupon code to Django.
  // Django will validate and calculate the discount.
  coupon_code: order.couponCode ?? null,

  items: (order.items ?? []).map((item) => ({
    item_type: 'OTHERS',

    quantity: item.quantity,
    unit_price: item.unitPrice,
    notes: item.notes ?? '',
  })),
};

    const res = await apiClient.post('/orders/orders/', payload);

    return res.data as Order;
  },

  async cancel(id: string, reason: string): Promise<Order> {
    const res = await apiClient.post(`/orders/${id}/cancel/`, { reason });
    return res.data as Order;
  },

  async payBalance(id: string, amount: number): Promise<Order> {
    const res = await apiClient.post(`/orders/${id}/pay/`, { amount });
    return res.data as Order;
  },

  generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `SHR-${year}-${num}`;
  },

  canCancel(order: Order): boolean {
    return order.status === 'PENDING' || order.status === 'IN_PROGRESS';
  },

  statusLabel(status: OrderStatus): string {
    return getStatusLabel(status);
  },
};
