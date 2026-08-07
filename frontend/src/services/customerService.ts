import apiClient from './apiClient';
import type {
  CustomerProfile,
  ShippingAddress,
  CustomerMeasurement,
} from '@/types';

console.log("CustomerService loaded");

export const customerService = {
  async getProfile(): Promise<CustomerProfile> {
    console.log("========== PROFILE REQUEST ==========");

    try {
      const res = await apiClient.get("/customer/profile/");

      console.log("Status:", res.status);
      console.log("Data:", res.data);

      return res.data as CustomerProfile;
    } catch (err: any) {
      console.log("========== PROFILE ERROR ==========");
      console.log(err);
      console.log("Message:", err.message);
      console.log("Code:", err.code);
      console.log("Response:", err.response);
      console.log("Request:", err.request);

      throw err;
    }
  },
  async updateProfile(profile: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const res = await apiClient.patch('/customer/profile/', profile);
    return res.data as CustomerProfile;
  },
};

export const addressService = {
  async list(): Promise<ShippingAddress[]> {
    const res = await apiClient.get('/shopping/shipping-addresses/');
    return res.data as ShippingAddress[];
  },
  async create(address: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
    const res = await apiClient.post('/shopping/shipping-addresses/', address);
    return res.data as ShippingAddress;
  },
  async update(id: string, address: Partial<ShippingAddress>): Promise<ShippingAddress> {
    const res = await apiClient.patch(`/shopping/shipping-addresses/${id}/`, address);
    return res.data as ShippingAddress;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shopping/shipping-addresses/${id}/`);
  },
  async setDefault(id: string): Promise<ShippingAddress[]> {
    const res = await apiClient.post(`/shopping/shipping-addresses/${id}/set-default/`);
    return res.data as ShippingAddress[];
  },
};

export const measurementService = {
  async get(): Promise<CustomerMeasurement | null> {
    return null;
  },

  async save(
    data: CustomerMeasurement
  ): Promise<CustomerMeasurement> {
    return data;
  },

  async getSleeveTypes() {
    return [];
  },

  async getNeckTypes() {
    return [];
  },
};