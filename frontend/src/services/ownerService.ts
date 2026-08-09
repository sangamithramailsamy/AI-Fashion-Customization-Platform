import apiClient, { ownerRequest } from './apiClient';
import {
  getOwnerAccessToken, getOwnerRefreshToken, setOwnerTokens, clearOwnerTokens,
  getStoredOwnerUser, setStoredOwnerUser,
} from './apiConfig';
import type {
  BoutiqueProfile, OwnerProduct, OwnerCustomer, Order, OrderStatus,
  Employee, ProductionItem, ProductionStatus, PaymentRecord, PaymentState,
  OwnerReview, OwnerNotification, OwnerNotificationType,
  DashboardStats, ReportsData, CustomerDetail, ShippingAddress, CustomerMeasurement,
} from '@/types';

export const ownerAuthService = {
  async login(email: string, password: string): Promise<{ id: number; fullName: string; email: string; role: 'owner' }> {
    const res = await apiClient.post('/auth/login/', { email, password });
    const { access, refresh, user } = res.data as {
      access: string;
      refresh: string;
      user: { id: number; full_name?: string; fullName?: string; email: string; role?: string };
    };
    setOwnerTokens(access, refresh);
    const ownerUser = {
      id: user.id,
      fullName: user.full_name ?? user.fullName ?? 'Owner',
      email: user.email,
      role: 'owner' as const,
    };
    setStoredOwnerUser(ownerUser);
    return ownerUser;
  },

  me(): { id: number; fullName: string; email: string; role: 'owner' } | null {
    return getStoredOwnerUser<{ id: number; fullName: string; email: string; role: 'owner' }>();
  },

  async refreshUser(): Promise<{ id: number; fullName: string; email: string; role: 'owner' } | null> {
    if (!getOwnerAccessToken()) return null;
    try {
      const res = await apiClient.get('/auth/me/');
      const user = {
        id: res.data.id,
        fullName: res.data.full_name ?? res.data.fullName ?? 'Owner',
        email: res.data.email,
        role: 'owner' as const,
      };
      setStoredOwnerUser(user);
      return user;
    } catch {
      return getStoredOwnerUser<{ id: number; fullName: string; email: string; role: 'owner' }>();
    }
  },

  async logout(): Promise<void> {
    try {
      const refresh = getOwnerRefreshToken();
      if (refresh) {
        await apiClient.post('/auth/logout/', { refresh }).catch(() => {});
      }
    } finally {
      clearOwnerTokens();
    }
  },
};

export const boutiqueService = {
  async get(): Promise<BoutiqueProfile | null> {
    try {
      const data = await ownerRequest<BoutiqueProfile>({
        method: 'GET',
        url: '/owner/boutique/',
      });

      return data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async create(data: Partial<BoutiqueProfile>): Promise<BoutiqueProfile> {
    return ownerRequest<BoutiqueProfile>({
      method: 'POST',
      url: '/owner/boutique/',
      data,
    });
  },

  async update(
  updates: Partial<BoutiqueProfile>,
  logoFile?: File | null
): Promise<BoutiqueProfile> {

  const formData = new FormData();

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (logoFile) {
    formData.append('logo', logoFile);
  }

    const data = await ownerRequest<BoutiqueProfile>({
      method: 'PATCH',
      url: '/owner/boutique/',
      data: formData,
      });

return data;
  },
};

export const ownerProductService = {
  async list(): Promise<OwnerProduct[]> {
    const res = await apiClient.get('/owner/products/');
    return res.data as OwnerProduct[];
  },
  async get(id: number): Promise<OwnerProduct | null> {
    try {
      const res = await apiClient.get(`/owner/products/${id}/`);
      return res.data as OwnerProduct;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  async create(product: Omit<OwnerProduct, 'id' | 'createdAt'>): Promise<OwnerProduct> {
    const res = await apiClient.post('/owner/products/', product);
    return res.data as OwnerProduct;
  },
  async createWithImage(formData: FormData): Promise<OwnerProduct> {
    const res = await apiClient.post('/owner/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as OwnerProduct;
  },
  async update(id: number, updates: Partial<OwnerProduct>): Promise<OwnerProduct> {
    const res = await apiClient.patch(`/owner/products/${id}/`, updates);
    return res.data as OwnerProduct;
  },
  async updateWithImage(id: number, formData: FormData): Promise<OwnerProduct> {
    const res = await apiClient.patch(`/owner/products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as OwnerProduct;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/owner/products/${id}/`);
  },
};

export const ownerOrderService = {
  async list(): Promise<Order[]> {
    const res = await apiClient.get('/owner/orders/');
    return res.data as Order[];
  },
  async get(id: string): Promise<Order | null> {
    try {
      const res = await apiClient.get(`/owner/orders/${id}/`);
      return res.data as Order;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await apiClient.patch(`/owner/orders/${id}/status/`, { status });
    return res.data as Order;
  },
  async cancel(id: string, reason: string): Promise<Order> {
    const res = await apiClient.post(`/owner/orders/${id}/cancel/`, { reason });
    return res.data as Order;
  },
};

export const ownerCustomerService = {
  async list(): Promise<OwnerCustomer[]> {
    const res = await apiClient.get('/owner/customers/');
    return res.data as OwnerCustomer[];
  },
  async get(id: number): Promise<CustomerDetail | null> {
    try {
      const res = await apiClient.get(`/owner/customers/${id}/`);
      return res.data as CustomerDetail;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  async update(id: number, updates: Partial<OwnerCustomer>): Promise<OwnerCustomer> {
    const res = await apiClient.patch(`/owner/customers/${id}/`, updates);
    return res.data as OwnerCustomer;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/owner/customers/${id}/`);
  },
};

export const employeeService = {
  async list(): Promise<Employee[]> {
    const res = await apiClient.get('/owner/employees/');
    return res.data as Employee[];
  },
  async create(employee: Omit<Employee, 'id' | 'joinedAt' | 'assignedOrders'>): Promise<Employee> {
    const res = await apiClient.post('/owner/employees/', employee);
    return res.data as Employee;
  },
  async update(id: number, updates: Partial<Employee>): Promise<Employee> {
    const res = await apiClient.patch(`/owner/employees/${id}/`, updates);
    return res.data as Employee;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/owner/employees/${id}/`);
  },
};

export const productionService = {
  async list(): Promise<ProductionItem[]> {
    const res = await apiClient.get('/owner/production/');
    return res.data as ProductionItem[];
  },
  async update(id: number, updates: Partial<ProductionItem>): Promise<ProductionItem> {
    const res = await apiClient.patch(`/owner/production/${id}/`, updates);
    return res.data as ProductionItem;
  },
  async assignTailor(id: number, employeeId: number): Promise<ProductionItem> {
    const res = await apiClient.post(`/owner/production/${id}/assign/`, { employee_id: employeeId });
    return res.data as ProductionItem;
  },
  async updateStatus(id: number, status: ProductionStatus): Promise<ProductionItem> {
    const res = await apiClient.patch(`/owner/production/${id}/status/`, { status });
    return res.data as ProductionItem;
  },
};

export const paymentService = {
  async list(): Promise<PaymentRecord[]> {
    const res = await apiClient.get('/owner/payments/');
    return res.data as PaymentRecord[];
  },
  async get(id: string): Promise<PaymentRecord | null> {
    try {
      const res = await apiClient.get(`/owner/payments/${id}/`);
      return res.data as PaymentRecord;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  async updateState(id: string, state: PaymentState): Promise<PaymentRecord> {
    const res = await apiClient.patch(`/owner/payments/${id}/`, { state });
    return res.data as PaymentRecord;
  },
};

export const reviewModerationService = {
  async list(): Promise<OwnerReview[]> {
    const res = await apiClient.get('/owner/reviews/');
    return res.data as OwnerReview[];
  },
  async toggleHidden(id: string, hidden: boolean): Promise<OwnerReview> {
    const res = await apiClient.patch(`/owner/reviews/${id}/`, { hidden });
    return res.data as OwnerReview;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/owner/reviews/${id}/`);
  },
  async reply(id: string, reply: string): Promise<OwnerReview> {
    const res = await apiClient.post(`/owner/reviews/${id}/reply/`, { reply });
    return res.data as OwnerReview;
  },
};

export const ownerNotificationService = {
  async list(): Promise<OwnerNotification[]> {
    const res = await apiClient.get('/owner/notifications/');
    return res.data as OwnerNotification[];
  },
  async send(notification: Omit<OwnerNotification, 'id' | 'sentAt'>): Promise<OwnerNotification> {
    const res = await apiClient.post('/owner/notifications/', notification);
    return res.data as OwnerNotification;
  },
  async markRead(id: string): Promise<void> {
    await apiClient.post(`/owner/notifications/${id}/read/`);
  },
  async markAllRead(): Promise<void> {
    await apiClient.post('/owner/notifications/read-all/');
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/owner/notifications/${id}/`);
  },
};

// ---------- Reports / Stats ----------

export const reportsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get('/owner/dashboard/stats/');
    return res.data as DashboardStats;
  },
  async getReports(): Promise<ReportsData> {
    const res = await apiClient.get('/owner/reports/');
    return res.data as ReportsData;
  },
};
