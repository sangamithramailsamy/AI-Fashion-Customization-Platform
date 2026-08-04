import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { notificationService } from '@/services/notificationService';
import type { NotificationItem } from '@/types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  add: (notification: NotificationItem) => Promise<void>;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await notificationService.list();

if (Array.isArray(list)) {
  setNotifications(list);
} else {
  console.log("Notification API returned:", list);
  setNotifications([]);
}
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback(async (id: string) => {
    await notificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const add = useCallback(async (notification: NotificationItem) => {
    await notificationService.add(notification);
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const unreadCount = Array.isArray(notifications)
  ? notifications.filter((n) => !n.read).length
  : 0;

  const value: NotificationState = {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    remove,
    add,
    refresh: load,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
