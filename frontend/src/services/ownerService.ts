import apiClient, { ownerRequest } from './apiClient';
import {
  getOwnerAccessToken,
  getOwnerRefreshToken,
  setOwnerTokens,
  clearOwnerTokens,
  getStoredOwnerUser,
  setStoredOwnerUser,
} from './apiConfig';

import type {
  BoutiqueProfile,
  OwnerProduct,
  OwnerCustomer,
  Order,
  OrderStatus,
  Employee,
  ProductionItem,
  ProductionStatus,
  PaymentRecord,
  PaymentState,
  OwnerReview,
  OwnerNotification,
  DashboardStats,
  ReportsData,
  CustomerDetail,
} from '@/types';


// ============================================================
// OWNER AUTH SERVICE
// ============================================================

export const ownerAuthService = {

  async login(
    email: string,
    password: string
  ): Promise<{
    id: number;
    fullName: string;
    email: string;
    role: 'owner';
  }> {

    const res = await apiClient.post('/auth/login/', {
      email,
      password,
    });

    const { access, refresh, user } = res.data as {
      access: string;
      refresh: string;
      user: {
        id: number;
        full_name?: string;
        fullName?: string;
        email: string;
        role?: string;
      };
    };

    setOwnerTokens(access, refresh);

    const ownerUser = {
      id: user.id,
      fullName:
        user.full_name ??
        user.fullName ??
        'Owner',
      email: user.email,
      role: 'owner' as const,
    };

    setStoredOwnerUser(ownerUser);

    return ownerUser;
  },


  me(): {
    id: number;
    fullName: string;
    email: string;
    role: 'owner';
  } | null {

    return getStoredOwnerUser<{
      id: number;
      fullName: string;
      email: string;
      role: 'owner';
    }>();
  },


  async refreshUser(): Promise<{
    id: number;
    fullName: string;
    email: string;
    role: 'owner';
  } | null> {

    if (!getOwnerAccessToken()) {
      return null;
    }

    try {

      const res = await apiClient.get('/auth/me/');

      const user = {
        id: res.data.id,
        fullName:
          res.data.full_name ??
          res.data.fullName ??
          'Owner',
        email: res.data.email,
        role: 'owner' as const,
      };

      setStoredOwnerUser(user);

      return user;

    } catch {

      return getStoredOwnerUser<{
        id: number;
        fullName: string;
        email: string;
        role: 'owner';
      }>();
    }
  },


  async logout(): Promise<void> {

    try {

      const refresh = getOwnerRefreshToken();

      if (refresh) {
        await apiClient
          .post('/auth/logout/', { refresh })
          .catch(() => {});
      }

    } finally {

      clearOwnerTokens();

    }
  },
};


// ============================================================
// BOUTIQUE SERVICE
// ============================================================

export const boutiqueService = {

  async get(): Promise<BoutiqueProfile | null> {

    try {

      return await ownerRequest<BoutiqueProfile>({
        method: 'GET',
        url: '/owner/boutique/',
      });

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },


  async update(
    updates: Partial<BoutiqueProfile>
  ): Promise<BoutiqueProfile> {

    return ownerRequest<BoutiqueProfile>({
      method: 'PATCH',
      url: '/owner/boutique/',
      data: updates,
    });
  },


  async create(
    data: Partial<BoutiqueProfile>
  ): Promise<BoutiqueProfile> {

    return ownerRequest<BoutiqueProfile>({
      method: 'POST',
      url: '/owner/boutique/',
      data,
    });
  },
};


// ============================================================
// OWNER PRODUCT SERVICE
// ============================================================

export const ownerProductService = {

  async list(): Promise<OwnerProduct[]> {

    return ownerRequest<OwnerProduct[]>({
      method: 'GET',
      url: '/owner/products/products/',
    });
  },


  async get(
    id: number
  ): Promise<OwnerProduct | null> {

    try {

      return await ownerRequest<OwnerProduct>({
        method: 'GET',
        url: `/owner/products/products/${id}/`,
      });

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },


  async create(
    product: Omit<OwnerProduct, 'id' | 'createdAt'>
  ): Promise<OwnerProduct> {

    return ownerRequest<OwnerProduct>({
      method: 'POST',
      url: '/owner/products/products/',
      data: product,
    });
  },


  async createWithImage(
    formData: FormData
  ): Promise<OwnerProduct> {

    return ownerRequest<OwnerProduct>({
      method: 'POST',
      url: '/owner/products/products/',
      data: formData,
    });
  },


  async update(
    id: number,
    updates: Partial<OwnerProduct>
  ): Promise<OwnerProduct> {

    return ownerRequest<OwnerProduct>({
      method: 'PATCH',
      url: `/owner/products/products/${id}/`,
      data: updates,
    });
  },


  async updateWithImage(
    id: number,
    formData: FormData
  ): Promise<OwnerProduct> {

    return ownerRequest<OwnerProduct>({
      method: 'PATCH',
      url: `/owner/products/products/${id}/`,
      data: formData,
    });
  },


  async remove(
    id: number
  ): Promise<void> {

    await ownerRequest({
      method: 'DELETE',
      url: `/owner/products/products/${id}/`,
    });
  },
};


// ============================================================
// OWNER ORDER SERVICE
// ============================================================

// Backend OrderSerializer returns Django snake_case fields.
// The frontend Order type uses camelCase fields.
// Convert the backend response here so all owner order pages
// receive the structure they already expect.
function normalizeOwnerOrder(raw: any): Order {
  const totalAmount = Number(raw.total_amount ?? 0);
  const advancePaid = Number(raw.advance_paid ?? 0);
  const balanceAmount = Number(raw.balance_amount ?? 0);

  let paymentStatus: Order['paymentStatus'] = 'UNPAID';

  if (totalAmount > 0 && balanceAmount <= 0) {
    paymentStatus = 'PAID';
  } else if (advancePaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  const customer = raw.customer;

  const customerName =
    raw.customer_name ??
    raw.customerName ??
    customer?.full_name ??
    customer?.fullName ??
    customer?.name ??
    (customer ? `Customer #${customer}` : 'Customer');

  const customerEmail =
    raw.customer_email ??
    raw.customerEmail ??
    customer?.email ??
    '';

  return {
    id: String(raw.id),
    orderNumber: raw.order_number ?? '',
    orderDate: raw.order_date ?? '',
    deliveryDate: raw.delivery_date ?? undefined,
    boutique: Number(raw.boutique ?? 0),

    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          itemType: item.item_type ?? 'OTHERS',
          quantity: Number(item.quantity ?? 1),
          unitPrice: Number(item.unit_price ?? 0),
          notes: item.notes ?? '',

          // These fields are expected by OwnerOrderDetailsPage.
          productName: item.product_name ?? item.item_type ?? 'Order Item',
          productImage: item.product_image ?? '',
          size: item.size ?? '',
          color: item.color ?? '',
          customizable: Boolean(item.customizable ?? false),
          hasMeasurements: Boolean(item.has_measurements ?? false),
        }))
      : [],

    totalAmount,
    advancePaid,
    balanceAmount,
    status: raw.status as OrderStatus,

    paymentStatus,
    paymentMethod: raw.payment_method ?? undefined,

    couponCode: raw.coupon_code ?? undefined,
    couponDiscount: Number(
      raw.discount_amount ?? raw.coupon_discount ?? 0
    ),
    deliveryCharge: Number(raw.delivery_charge ?? 0),

    // The current OrderSerializer does not return a shipping address,
    // so keep a safe empty object instead of crashing the owner details page.
    shippingAddress: raw.shipping_address ?? {
      fullName: customerName,
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      phone: '',
    },

    customerName,
    customerEmail,

    notes: raw.notes ?? '',
    cancellationReason: raw.cancellation_reason ?? '',

    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  } as Order;
}


// ============================================================
// OWNER ORDER SERVICE
// ============================================================

export const ownerOrderService = {

  async list(): Promise<Order[]> {

    const data = await ownerRequest<any>({
      method: 'GET',

      // DO NOT change this to /owner/orders/.
      // The working backend endpoint is /api/orders/orders/.
      url: '/orders/orders/',
    });

    // DRF normally returns an array here.
    // This also safely handles a paginated response if one is enabled later.
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];

    return rows.map(normalizeOwnerOrder);
  },


  async get(
    id: string
  ): Promise<Order | null> {

    try {

      const data = await ownerRequest<any>({
        method: 'GET',
        url: `/orders/orders/${id}/`,
      });

      return normalizeOwnerOrder(data);

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },


  async updateStatus(
    id: string,
    status: OrderStatus
  ): Promise<Order> {

    const data = await ownerRequest<any>({
      method: 'PATCH',
      url: `/orders/orders/${id}/`,
      data: {
        status,
      },
    });

    return normalizeOwnerOrder(data);
  },


  async cancel(
    id: string,
    reason: string
  ): Promise<Order> {

    const data = await ownerRequest<any>({
      method: 'POST',
      url: `/orders/orders/${id}/cancel/`,
      data: {
        reason,
      },
    });

    return normalizeOwnerOrder(data);
  },
};


// ============================================================
// OWNER CUSTOMER SERVICE
// ============================================================

export const ownerCustomerService = {

  async list(): Promise<OwnerCustomer[]> {

    return ownerRequest<OwnerCustomer[]>({
      method: 'GET',
      url: '/owner/customers/',
    });
  },


  async get(
    id: number
  ): Promise<CustomerDetail | null> {

    try {

      return await ownerRequest<CustomerDetail>({
        method: 'GET',
        url: `/owner/customers/${id}/`,
      });

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },


  async update(
    id: number,
    updates: Partial<OwnerCustomer>
  ): Promise<OwnerCustomer> {

    return ownerRequest<OwnerCustomer>({
      method: 'PATCH',
      url: `/owner/customers/${id}/`,
      data: updates,
    });
  },


  async remove(
    id: number
  ): Promise<void> {

    await ownerRequest({
      method: 'DELETE',
      url: `/owner/customers/${id}/`,
    });
  },
};


// ============================================================
// EMPLOYEE SERVICE
// ============================================================

export const employeeService = {

  async list(): Promise<Employee[]> {

    return ownerRequest<Employee[]>({
      method: 'GET',
      url: '/owner/employees/',
    });
  },


  async create(
    employee: Omit<
      Employee,
      'id' | 'joinedAt' | 'assignedOrders'
    >
  ): Promise<Employee> {

    return ownerRequest<Employee>({
      method: 'POST',
      url: '/owner/employees/',
      data: employee,
    });
  },


  async update(
    id: number,
    updates: Partial<Employee>
  ): Promise<Employee> {

    return ownerRequest<Employee>({
      method: 'PATCH',
      url: `/owner/employees/${id}/`,
      data: updates,
    });
  },


  async remove(
    id: number
  ): Promise<void> {

    await ownerRequest({
      method: 'DELETE',
      url: `/owner/employees/${id}/`,
    });
  },
};


// ============================================================
// PRODUCTION SERVICE
// ============================================================

export const productionService = {

  async list(): Promise<ProductionItem[]> {

    return ownerRequest<ProductionItem[]>({
      method: 'GET',
      url: '/owner/production/',
    });
  },


  async update(
    id: number,
    updates: Partial<ProductionItem>
  ): Promise<ProductionItem> {

    return ownerRequest<ProductionItem>({
      method: 'PATCH',
      url: `/owner/production/${id}/`,
      data: updates,
    });
  },


  async assignTailor(
    id: number,
    employeeId: number
  ): Promise<ProductionItem> {

    return ownerRequest<ProductionItem>({
      method: 'POST',
      url: `/owner/production/${id}/assign/`,
      data: {
        employee_id: employeeId,
      },
    });
  },


  async updateStatus(
    id: number,
    status: ProductionStatus
  ): Promise<ProductionItem> {

    return ownerRequest<ProductionItem>({
      method: 'PATCH',
      url: `/owner/production/${id}/status/`,
      data: {
        status,
      },
    });
  },
};


// ============================================================
// PAYMENT SERVICE
// ============================================================

export const paymentService = {

  async list(): Promise<PaymentRecord[]> {

    return ownerRequest<PaymentRecord[]>({
      method: 'GET',
      url: '/owner/payments/',
    });
  },


  async get(
    id: string
  ): Promise<PaymentRecord | null> {

    try {

      return await ownerRequest<PaymentRecord>({
        method: 'GET',
        url: `/owner/payments/${id}/`,
      });

    } catch (err: any) {

      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },


  async updateState(
    id: string,
    state: PaymentState
  ): Promise<PaymentRecord> {

    return ownerRequest<PaymentRecord>({
      method: 'PATCH',
      url: `/owner/payments/${id}/`,
      data: {
        state,
      },
    });
  },
};


// ============================================================
// REVIEW MODERATION SERVICE
// ============================================================

export const reviewModerationService = {

  async list(): Promise<OwnerReview[]> {

    return ownerRequest<OwnerReview[]>({
      method: 'GET',
      url: '/owner/reviews/',
    });
  },


  async toggleHidden(
    id: string,
    hidden: boolean
  ): Promise<OwnerReview> {

    return ownerRequest<OwnerReview>({
      method: 'PATCH',
      url: `/owner/reviews/${id}/`,
      data: {
        hidden,
      },
    });
  },


  async remove(
    id: string
  ): Promise<void> {

    await ownerRequest({
      method: 'DELETE',
      url: `/owner/reviews/${id}/`,
    });
  },


  async reply(
    id: string,
    reply: string
  ): Promise<OwnerReview> {

    return ownerRequest<OwnerReview>({
      method: 'POST',
      url: `/owner/reviews/${id}/reply/`,
      data: {
        reply,
      },
    });
  },
};


// ============================================================
// OWNER NOTIFICATION SERVICE
// ============================================================

export const ownerNotificationService = {

  async list(): Promise<OwnerNotification[]> {

    return ownerRequest<OwnerNotification[]>({
      method: 'GET',
      url: '/owner/notifications/',
    });
  },


  async send(
    notification: Omit<
      OwnerNotification,
      'id' | 'sentAt'
    >
  ): Promise<OwnerNotification> {

    return ownerRequest<OwnerNotification>({
      method: 'POST',
      url: '/owner/notifications/',
      data: notification,
    });
  },


  async markRead(
    id: string
  ): Promise<void> {

    await ownerRequest({
      method: 'POST',
      url: `/owner/notifications/${id}/read/`,
    });
  },


  async markAllRead(): Promise<void> {

    await ownerRequest({
      method: 'POST',
      url: '/owner/notifications/read-all/',
    });
  },


  async remove(
    id: string
  ): Promise<void> {

    await ownerRequest({
      method: 'DELETE',
      url: `/owner/notifications/${id}/`,
    });
  },
};


// ============================================================
// REPORTS / STATS
// ============================================================

export const reportsService = {

  async getDashboardStats(): Promise<DashboardStats> {

    return ownerRequest<DashboardStats>({
      method: 'GET',
      url: '/owner/dashboard/stats/',
    });
  },


  async getReports(): Promise<ReportsData> {

    return ownerRequest<ReportsData>({
      method: 'GET',
      url: '/owner/reports/',
    });
  },
};