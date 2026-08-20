import apiClient from './apiClient';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

function mapOrder(data: any): Order {
  return {
    id: String(data.id),

    orderNumber: data.order_number,
    orderDate: data.order_date,
    deliveryDate: data.delivery_date,

    boutique: data.boutique,

    items: (data.items ?? []).map((item: any) => ({
      itemType: item.item_type,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      notes: item.notes ?? '',
    })),

    totalAmount: Number(data.total_amount),
    advancePaid: Number(data.advance_paid),
    balanceAmount: Number(data.balance_amount),

    status: data.status,
    paymentStatus:
      Number(data.balance_amount) <= 0
        ? 'PAID'
        : Number(data.advance_paid) > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID',

    paymentMethod: data.payment_method,

    couponCode: data.coupon_code,
    couponDiscount: Number(data.discount_amount ?? 0),

    deliveryCharge: Number(data.delivery_charge),

    shippingAddress: data.shipping_address ?? {},

    customerName:
      data.customer_name ??
      data.customer?.full_name ??
      data.customer?.user?.full_name ??
      '',

    customerEmail:
      data.customer_email ??
      data.customer?.email ??
      data.customer?.user?.email ??
      '',

    notes: data.notes ?? '',
    cancellationReason: data.cancellation_reason ?? '',

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export const orderService = {

  async list(): Promise<Order[]> {
    const res = await apiClient.get('/orders/orders/');
    return (res.data ?? []).map(mapOrder);
  },

  async get(id: string): Promise<Order | null> {
    try {
      const res = await apiClient.get(`/orders/orders/${id}/`);
      return mapOrder(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }

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

      coupon_code: order.couponCode ?? null,

      items: (order.items ?? []).map((item) => ({
        item_type: 'OTHERS',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes ?? '',
      })),
    };

    const res = await apiClient.post(
      '/orders/orders/',
      payload
    );

    return mapOrder(res.data);
  },

  async cancel(
  id: string,
  reason: string
): Promise<Order> {
  const res = await apiClient.post(
    `/orders/orders/${id}/cancel/`,
    { reason }
  );

  return mapOrder(res.data);
},

  async payBalance(
  id: string,
  amount: number
): Promise<Order> {
  const res = await apiClient.post(
    `/orders/orders/${id}/pay/`,
    { amount }
  );

  return mapOrder(res.data);
},

  generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const num = Math.floor(
      1000 + Math.random() * 9000
    );

    return `SHR-${year}-${num}`;
  },

  canCancel(order: Order): boolean {
    return (
      order.status === 'PENDING' ||
      order.status === 'IN_PROGRESS'
    );
  },

  statusLabel(status: OrderStatus): string {
    return getStatusLabel(status);
  },
};