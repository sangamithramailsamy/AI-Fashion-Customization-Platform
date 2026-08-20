import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { orderService } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';

interface OrderState {
  orders: Order[];
  loading: boolean;
  getOrder: (id: string) => Order | undefined;
  createOrder: (order: Order) => Promise<Order>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
  payBalance: (id: string, amount: number) => Promise<void>;
  refresh: () => void;
}

const OrderContext = createContext<OrderState | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await orderService.list();
      setOrders(list);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getOrder = useCallback(
  (id: string) => orders.find((o) => String(o.id) === String(id)),
  [orders]
);

  const createOrder = useCallback(async (order: Order) => {
    const created = await orderService.create(order);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const cancelOrder = useCallback(async (id: string, reason: string) => {
    const updated = await orderService.cancel(id, reason);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const payBalance = useCallback(async (id: string, amount: number) => {
    const updated = await orderService.payBalance(id, amount);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, []);

  const value: OrderState = {
    orders,
    loading,
    getOrder,
    createOrder,
    cancelOrder,
    payBalance,
    refresh: load,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderState {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
