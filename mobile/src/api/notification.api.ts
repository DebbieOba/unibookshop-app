import { api } from './client';
import { NotificationRecipient } from '../types/notification';

export const notificationApi = {
  getFeed: () => api.get<NotificationRecipient[]>('/notifications'),

  markAllRead: () => api.post('/notifications/mark-all-read'),
};
