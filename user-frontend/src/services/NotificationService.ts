import { API_ENDPOINTS } from './api.config';
import { fetchWithAuth } from './fetchClient';

export interface AppNotification {
  _id: string;
  type: 'LIKE' | 'REPLY' | 'INTERVIEW_COMPLETE' | 'SYSTEM';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<{ notifications: AppNotification[], unreadCount: number }> => {
  const res = await fetchWithAuth(API_ENDPOINTS.NOTIFICATIONS.GET_ALL);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markAsRead = async (id: string): Promise<AppNotification> => {
  const res = await fetchWithAuth(API_ENDPOINTS.NOTIFICATIONS.READ(id), {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to mark as read');
  return res.json();
};

export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  const res = await fetchWithAuth(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
};
