import apiClient from './apiClient';
import type {
  CustomerProfile,
  ShippingAddress,
  CustomerMeasurement,
} from '@/types';

console.log("CustomerService loaded");

export const customerService = {
  async getProfile(): Promise<CustomerProfile> {
  console.log("Calling /customer/profile");

  try {
      const res = await apiClient.get("/customer/profile/");

      console.log("SUCCESS", res);

      return res.data as CustomerProfile;
  } catch (err) {
    console.error("PROFILE ERROR", err);
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
    const res = await apiClient.get('/shopping/addresses/');
    return res.data as ShippingAddress[];
  },
  async create(address: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
    const res = await apiClient.post('/shopping/addresses/', address);
    return res.data as ShippingAddress;
  },
  async update(id: string, address: Partial<ShippingAddress>): Promise<ShippingAddress> {
    const res = await apiClient.patch(`/shopping/addresses/${id}/`, address);
    return res.data as ShippingAddress;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shopping/addresses/${id}/`);
  },
  async setDefault(id: string): Promise<ShippingAddress[]> {
    const res = await apiClient.post(`/shopping/addresses/${id}/set-default/`);
    return res.data as ShippingAddress[];
  },
};

export const measurementService = {
  async get(): Promise<CustomerMeasurement | null> {
    try {
      const res = await apiClient.get('/measurements/customer/');
      return res.data as CustomerMeasurement;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  async save(data: CustomerMeasurement): Promise<CustomerMeasurement> {
    const res = await apiClient.put('/measurements/customer/', data);
    return res.data as CustomerMeasurement;
  },
  async getSleeveTypes() {
    const res = await apiClient.get('/measurements/sleeve-types/');
    return res.data;
  },
  async getNeckTypes() {
    const res = await apiClient.get('/measurements/neck-types/');
    return res.data;
  },
};
