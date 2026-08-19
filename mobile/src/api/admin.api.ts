import { api } from './client';
import {
  ActiveUser,
  AdjustInventoryPayload,
  DashboardKpis,
  Department,
  InventorySummary,
  Level,
  Paginated,
  PendingUser,
  School,
  ProfitLossData,
} from '../types/admin';
import { Book } from '../types/catalogue';
import { Order } from '../types/order';

export const adminApi = {
  // Schools
  getSchools: () => api.get<Paginated<School>>('/admin/schools'),
  createSchool: (payload: { name: string }) => api.post<School>('/admin/schools', payload),
  updateSchool: (id: string, payload: { name: string }) =>
    api.patch<School>(`/admin/schools/${id}`, payload),
  deleteSchool: (id: string) => api.delete(`/admin/schools/${id}`),

  // Departments
  getDepartments: () => api.get<Paginated<Department>>('/admin/departments'),
  createDepartment: (payload: { name: string; schoolId: string }) =>
    api.post<Department>('/admin/departments', payload),
  updateDepartment: (id: string, payload: { name: string }) =>
    api.patch<Department>(`/admin/departments/${id}`, payload),
  deleteDepartment: (id: string) => api.delete(`/admin/departments/${id}`),

  // Levels
  getLevels: () => api.get<Paginated<Level>>('/admin/levels'),
  createLevel: (payload: { name: string }) => api.post<Level>('/admin/levels', payload),
  updateLevel: (id: string, payload: { name: string }) =>
    api.patch<Level>(`/admin/levels/${id}`, payload),
  deleteLevel: (id: string) => api.delete(`/admin/levels/${id}`),

  // Approvals
  getPendingApprovals: () => api.get<PendingUser[]>('/admin/approvals'),
  decideApproval: (userId: string, decision: 'APPROVED' | 'REJECTED') =>
    api.post(`/admin/approvals/${userId}/decide`, { decision }),

  // Users & Access — Active tab (approved/restricted users)
  getActiveUsers: () => api.get<ActiveUser[]>('/admin/approvals/active'),
  restrictUser: (userId: string, reason: string) =>
    api.post(`/admin/approvals/${userId}/restrict`, { reason }),
  restoreUser: (userId: string) => api.post(`/admin/approvals/${userId}/restore`),

  // Dashboard & Inventory
  getDashboard: () => api.get<DashboardKpis>('/admin/dashboard'),
  getProfitLoss: (range = '30d') =>
    api.get<ProfitLossData>('/admin/dashboard/profit-loss', { params: { range } }),
  getInventory: () => api.get<InventorySummary>('/admin/inventory'),
  adjustInventory: (bookId: string, payload: AdjustInventoryPayload) =>
    api.patch<{ book: Book; movement: unknown }>(`/admin/inventory/${bookId}/adjust`, payload),

  // Orders
  getOrders: (status?: 'PROCESSING' | 'COMPLETED' | 'CANCELLED') =>
    api.get<Order[]>('/admin/orders', { params: { status } }),
  getOrder: (id: string) => api.get<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: 'CANCELLED' | 'COMPLETED', reason?: string) =>
    api.patch<Order>(`/admin/orders/${id}/status`, { status, reason }),

  // Broadcast
  broadcast: (payload: { title: string; body: string; audience?: 'student' | 'admin' | 'all' }) =>
    api.post('/notifications/broadcast', payload),
};
