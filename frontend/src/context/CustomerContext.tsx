import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  customerService,
  addressService,
  measurementService,
} from '@/services/customerService';
import type {
  CustomerProfile,
  ShippingAddress,
  CustomerMeasurement,
} from '@/types';

interface CustomerState {
  profile: CustomerProfile | null;
  addresses: ShippingAddress[];
  measurements: CustomerMeasurement | null;
  loading: boolean;
  hasMeasurements: boolean;
  defaultAddress: ShippingAddress | null;
  // profile
  updateProfile: (profile: CustomerProfile) => Promise<void>;
  // addresses
  saveAddresses: (addresses: ShippingAddress[]) => Promise<void>;
  addAddress: (addr: ShippingAddress) => Promise<void>;
  updateAddress: (id: string, addr: ShippingAddress) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  // measurements
  saveMeasurements: (data: CustomerMeasurement) => Promise<void>;
  refresh: () => void;
}

const CustomerContext = createContext<CustomerState | undefined>(undefined);

function uid(): string {
  return 'addr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [measurements, setMeasurements] = useState<CustomerMeasurement | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
  setLoading(true);

  try {
    // Profile
    try {
      const profile = await customerService.getProfile();
      setProfile(profile);
    } catch (err) {
      console.error("Profile:", err);
      setProfile(null);
    }

    // Addresses
    try {
      const addresses = await addressService.list();
      setAddresses(addresses);
    } catch (err) {
      console.log("Addresses API not ready");
      setAddresses([]);
    }

    // Measurements
    try {
      const measurements = await measurementService.get();
      setMeasurements(measurements);
    } catch (err) {
      console.log("Measurements API not ready");
      setMeasurements(null);
    }

  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      load();
    } else {
      setLoading(false);
    }
  }, [load]);

  const updateProfile = useCallback(async (next: CustomerProfile) => {
    const saved = await customerService.updateProfile(next);
    setProfile(saved);
  }, []);

  const saveAddresses = useCallback(async (list: ShippingAddress[]) => {
    // Replace the entire address list via the API by syncing each entry.
    // The backend is the source of truth; we reload after sync.
    try {
      const current = await addressService.list();
      const currentIds = new Set(current.map((a) => a.id));
      const newIds = new Set(list.map((a) => a.id));
      for (const addr of list) {
        if (currentIds.has(addr.id)) {
          await addressService.update(addr.id, addr);
        } else {
          await addressService.create(addr);
        }
      }
      for (const old of current) {
        if (!newIds.has(old.id)) {
          await addressService.remove(old.id);
        }
      }
      const reloaded = await addressService.list();
      setAddresses(reloaded);
    } catch {
      // graceful — keep local state
      setAddresses(list);
    }
  }, []);

  const addAddress = useCallback(
    async (addr: ShippingAddress) => {
      const withId = { ...addr, id: uid() };
      let list = [...addresses, withId];
      if (withId.isDefault) list = list.map((a) => ({ ...a, isDefault: a.id === withId.id }));
      await saveAddresses(list);
    },
    [addresses, saveAddresses]
  );

  const updateAddress = useCallback(
    async (id: string, next: ShippingAddress) => {
      let list = addresses.map((a) => (a.id === id ? { ...next, id } : a));
      if (next.isDefault) list = list.map((a) => ({ ...a, isDefault: a.id === id }));
      await saveAddresses(list);
    },
    [addresses, saveAddresses]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      let list = addresses.filter((a) => a.id !== id);
      // if removed default and others remain, promote first
      if (list.length > 0 && !list.some((a) => a.isDefault)) {
        list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      await saveAddresses(list);
    },
    [addresses, saveAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      const list = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
      await saveAddresses(list);
    },
    [addresses, saveAddresses]
  );

  const saveMeasurements = useCallback(async (data: CustomerMeasurement) => {
    const saved = await measurementService.save(data);
    setMeasurements(saved);
  }, []);

  const value: CustomerState = {
    profile,
    addresses,
    measurements,
    loading,
    hasMeasurements: Boolean(measurements),
    defaultAddress: addresses.find((a) => a.isDefault) ?? null,
    updateProfile,
    saveAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    saveMeasurements,
    refresh: load,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerState {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
