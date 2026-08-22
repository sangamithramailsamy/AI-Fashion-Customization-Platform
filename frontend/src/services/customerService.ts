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
  async updateProfile(formData: FormData): Promise<CustomerProfile> {
    const res = await apiClient.patch(
        "/customer/profile/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
  },
};

export const addressService = {
  async list(): Promise<ShippingAddress[]> {
    const res = await apiClient.get('/shopping/shipping-addresses/');

    return res.data.map((address: any) => ({
      id: String(address.id),
      fullName: address.full_name ?? '',
      phone: address.phone_number ?? '',
      line1: address.address_line_1 ?? '',
      line2: address.address_line_2 ?? '',
      landmark: address.landmark ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      pincode: address.pincode ?? '',
      country: address.country ?? '',
      type: address.type ?? 'Home',
      isDefault: Boolean(address.is_default),
    }));
  },

  async create(
    address: Omit<ShippingAddress, 'id'>
  ): Promise<ShippingAddress> {

    const payload = {
      full_name: address.fullName,
      phone_number: address.phone,
      address_line_1: address.line1,
      address_line_2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
    };

    console.log('CREATE SHIPPING ADDRESS PAYLOAD:', payload);

    const res = await apiClient.post(
      '/shopping/shipping-addresses/',
      payload
    );

    const saved = res.data;

    return {
      id: String(saved.id),
      fullName: saved.full_name ?? '',
      phone: saved.phone_number ?? '',
      line1: saved.address_line_1 ?? '',
      line2: saved.address_line_2 ?? '',
      landmark: saved.landmark ?? '',
      city: saved.city ?? '',
      state: saved.state ?? '',
      pincode: saved.pincode ?? '',
      country: saved.country ?? '',
      type: saved.type ?? 'Home',
      isDefault: Boolean(saved.is_default),
    };
  },

  async update(
    id: string,
    address: Partial<ShippingAddress>
  ): Promise<ShippingAddress> {

    const payload: Record<string, unknown> = {};

    if (address.fullName !== undefined) {
      payload.full_name = address.fullName;
    }

    if (address.phone !== undefined) {
      payload.phone_number = address.phone;
    }

    if (address.line1 !== undefined) {
      payload.address_line_1 = address.line1;
    }

    if (address.line2 !== undefined) {
      payload.address_line_2 = address.line2;
    }

    if (address.city !== undefined) {
      payload.city = address.city;
    }

    if (address.state !== undefined) {
      payload.state = address.state;
    }

    if (address.country !== undefined) {
      payload.country = address.country;
    }

    if (address.pincode !== undefined) {
      payload.pincode = address.pincode;
    }

    console.log('UPDATE SHIPPING ADDRESS PAYLOAD:', payload);

    const res = await apiClient.patch(
      `/shopping/shipping-addresses/${id}/`,
      payload
    );

    const saved = res.data;

    return {
      id: String(saved.id),
      fullName: saved.full_name ?? '',
      phone: saved.phone_number ?? '',
      line1: saved.address_line_1 ?? '',
      line2: saved.address_line_2 ?? '',
      landmark: saved.landmark ?? '',
      city: saved.city ?? '',
      state: saved.state ?? '',
      pincode: saved.pincode ?? '',
      country: saved.country ?? '',
      type: saved.type ?? 'Home',
      isDefault: Boolean(saved.is_default),
    };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(
      `/shopping/shipping-addresses/${id}/`
    );
  },

  async setDefault(id: string): Promise<ShippingAddress[]> {
    const res = await apiClient.post(
      `/shopping/shipping-addresses/${id}/set-default/`
    );

    return res.data.map((address: any) => ({
      id: String(address.id),
      fullName: address.full_name ?? '',
      phone: address.phone_number ?? '',
      line1: address.address_line_1 ?? '',
      line2: address.address_line_2 ?? '',
      landmark: address.landmark ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      pincode: address.pincode ?? '',
      country: address.country ?? '',
      type: address.type ?? 'Home',
      isDefault: Boolean(address.is_default),
    }));
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