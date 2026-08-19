import { api } from './client';
import { AuthUser } from '../store/authStore';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // fullName/departmentId are collected post-signup on CompleteProfileScreen
  // now, not at registration — see RegisterDto.
  register: (payload: {
    email: string;
    password: string;
    matricNumber?: string;
    fullName?: string;
    departmentId?: string;
    bookshopId?: string;
    bookshopName?: string;
    role?: string;
  }) => api.post('/auth/register', payload),

  getBookshops: () => api.get<Array<{ id: string; name: string; slug: string }>>('/auth/bookshops'),

  login: (identifier: string, password: string) =>
    api.post<TokenPair>('/auth/login', { identifier, password }),

  refresh: (refreshToken: string) => api.post<TokenPair>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthUser>('/auth/me'),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};
