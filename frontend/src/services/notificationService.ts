import apiClient from './apiClient';
import type { NotificationItem } from '@/types';

export const notificationService = {
  async list(): Promise<NotificationItem[]> {
    const res = await apiClient.get('/notifications/');
    return res.data as NotificationItem[];
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read/`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all/');
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}/`);
  },

  async add(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): Promise<void> {
    await apiClient.post('/notifications/', notification);
  },
};
