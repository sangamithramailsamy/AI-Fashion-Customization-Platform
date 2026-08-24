import apiClient from './apiClient';
import { getStatusLabel } from '@/data/orderData';
import type { Order, OrderStatus } from '@/types';

/**
 * Convert Django Order response → Frontend Order
 */
function mapOrder(data: any): Order {
  return {
    id: String(data.id),

    orderNumber: data.order_number,
    orderDate: data.order_date,
    deliveryDate: data.delivery_date,

    boutique: data.boutique,

    items: (data.items ?? []).map((item: any) => ({
      id: item.id,

      order: item.order,
      variant: item.variant ?? null,

      itemType: item.item_type,

      /*
       * Product information returned by backend serializer
       */
      productId:
        item.product_id ??
        item.design_id ??
        item.product?.id ??
        item.design?.id ??
        undefined,

      productName:
        item.product_name ??
        item.product?.name ??
        item.design?.name ??
        undefined,

      productImage:
        item.product_image ??
        item.product?.image ??
        item.design?.image ??
        undefined,

      /*
       * Selected variant information
       */
      size:
        item.size ??
        item.variant_size ??
        item.variant?.size ??
        undefined,

      color:
        item.color ??
        item.variant_color ??
        item.variant?.color ??
        undefined,

      customizable:
        item.customizable ??
        item.is_customizable ??
        item.product?.customizable ??
        item.design?.customizable ??
        false,

      hasMeasurements:
        item.has_measurements ??
        item.hasMeasurements ??
        false,

      quantity: Number(item.quantity ?? 0),

      unitPrice: Number(item.unit_price ?? 0),

      subtotal:
        item.subtotal !== undefined && item.subtotal !== null
          ? Number(item.subtotal)
          : Number(item.unit_price ?? 0) *
            Number(item.quantity ?? 0),

      notes: item.notes ?? '',
    })),

    totalAmount: Number(data.total_amount ?? 0),

    advancePaid: Number(data.advance_paid ?? 0),

    balanceAmount: Number(data.balance_amount ?? 0),

    status: data.status,

    paymentStatus:
      Number(data.balance_amount ?? 0) <= 0
        ? 'PAID'
        : Number(data.advance_paid ?? 0) > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID',

    paymentMethod: data.payment_method,

    couponCode: data.coupon_code,

    couponDiscount: Number(
      data.discount_amount ?? 0
    ),

    deliveryCharge: Number(
      data.delivery_charge ?? 0
    ),

    /*
     * Backend now returns the complete shipping address.
     */
    shippingAddress: data.shipping_address ?? {
      id: '',
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'Home',
      isDefault: false,
    },

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

    cancellationReason:
      data.cancellation_reason ?? '',

    createdAt: data.created_at,

    updatedAt: data.updated_at,
  };
}

export const orderService = {
  // --------------------------------------------------
  // LIST ORDERS
  // --------------------------------------------------

  async list(): Promise<Order[]> {
    const res = await apiClient.get(
      '/orders/orders/'
    );

    const data = Array.isArray(res.data)
      ? res.data
      : res.data?.results ?? [];

    return data.map(mapOrder);
  },

  // --------------------------------------------------
  // GET SINGLE ORDER
  // --------------------------------------------------

  async get(id: string): Promise<Order | null> {
    try {
      const res = await apiClient.get(
        `/orders/orders/${id}/`
      );

      return mapOrder(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },

  // --------------------------------------------------
  // CREATE ORDER
  // --------------------------------------------------

  async create(order: Partial<Order>): Promise<Order> {
    const payload = {
      boutique: order.boutique,

      order_date:
        order.orderDate?.split('T')[0],

      delivery_date:
        order.deliveryDate?.split('T')[0],

      advance_paid:
        order.advancePaid ?? 0,

      status:
        order.status ?? 'PENDING',

      notes:
        order.notes ?? '',

      coupon_code:
        order.couponCode ?? null,

      /*
       * IMPORTANT:
       * Send the selected shipping address ID
       * to Django.
       */
      shippingAddress:
        order.shippingAddress?.id
        ? Number(order.shippingAddress.id)
        : null,

      /*
       * IMPORTANT:
       * Send the selected product variant ID.
       *
       * Example:
       * XS + Cream → variant 47
       */
      items: (order.items ?? []).map((item) => ({
        variant:
          item.variant ?? null,

        item_type:
          item.itemType ?? 'OTHERS',

        quantity:
          item.quantity,

        unit_price:
          item.unitPrice,

        notes:
          item.notes ?? '',
      })),
    };

    console.log(
      'CREATE ORDER PAYLOAD:',
      payload
    );

    const res = await apiClient.post(
      '/orders/orders/',
      payload
    );

    return mapOrder(res.data);
  },

  // --------------------------------------------------
  // CANCEL ORDER
  // --------------------------------------------------

  async cancel(
    id: string,
    reason: string
  ): Promise<Order> {
    const res = await apiClient.post(
      `/orders/orders/${id}/cancel/`,
      {
        reason,
      }
    );

    return mapOrder(res.data);
  },

  // --------------------------------------------------
  // PAY BALANCE
  // --------------------------------------------------

  async payBalance(
    id: string,
    amount: number
  ): Promise<Order> {
    const res = await apiClient.post(
      `/orders/orders/${id}/pay/`,
      {
        amount,
      }
    );

    return mapOrder(res.data);
  },

  // --------------------------------------------------
  // GENERATE ORDER NUMBER
  // --------------------------------------------------

  generateOrderNumber(): string {
    const year =
      new Date().getFullYear();

    const num = Math.floor(
      1000 + Math.random() * 9000
    );

    return `SHR-${year}-${num}`;
  },

  // --------------------------------------------------
  // CAN CANCEL
  // --------------------------------------------------

  canCancel(order: Order): boolean {
    return (
      order.status === 'PENDING' ||
      order.status === 'IN_PROGRESS'
    );
  },

  // --------------------------------------------------
  // STATUS LABEL
  // --------------------------------------------------

  statusLabel(
    status: OrderStatus
  ): string {
    return getStatusLabel(status);
  },
};