import { api } from "./client";
import {
  ActiveUser,
  AdjustInventoryPayload,
  DashboardKpis,
  InventorySummary,
  PendingUser,
  ProfitLossData,
} from "../types/seller";
import { Book, Category, Subcategory } from "../types/catalogue";
import { Order } from "../types/order";

export const adminApi = {
  // Categories & Subcategories (Science, Fiction, Engineering, etc.)
  getCategories: (bookshopId?: string) =>
    api.get<Category[]>("/categories", { params: { bookshopId } }),
  createCategory: (payload: { name: string }) =>
    api.post<Category>("/categories", payload),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  getSubcategories: (categoryId?: string) =>
    api.get<Subcategory[]>("/subcategories", { params: { categoryId } }),
  createSubcategory: (payload: { name: string; categoryId: string }) =>
    api.post<Subcategory>("/subcategories", payload),
  deleteSubcategory: (id: string) => api.delete(`/subcategories/${id}`),

  // Approvals
  getPendingApprovals: () => api.get<PendingUser[]>("/seller/approvals"),
  decideApproval: (userId: string, decision: "APPROVED" | "REJECTED") =>
    api.post(`/seller/approvals/${userId}/decide`, { decision }),

  // Users & Access — Active tab (approved/restricted users)
  getActiveUsers: () => api.get<ActiveUser[]>("/seller/approvals/active"),
  restrictUser: (userId: string, reason: string) =>
    api.post(`/seller/approvals/${userId}/restrict`, { reason }),
  restoreUser: (userId: string) =>
    api.post(`/seller/approvals/${userId}/restore`),

  // Dashboard & Inventory
  getDashboard: () => api.get<DashboardKpis>("/seller/dashboard"),
  getProfitLoss: (range = "30d") =>
    api.get<ProfitLossData>("/seller/dashboard/profit-loss", {
      params: { range },
    }),
  getInventory: () => api.get<InventorySummary>("/seller/inventory"),
  adjustInventory: (bookId: string, payload: AdjustInventoryPayload) =>
    api.patch<{ book: Book; movement: unknown }>(
      `/seller/inventory/${bookId}/adjust`,
      payload,
    ),

  // Orders
  getOrders: (status?: "PROCESSING" | "COMPLETED" | "CANCELLED") =>
    api.get<Order[]>("/seller/orders", { params: { status } }),
  getOrder: (id: string) => api.get<Order>(`/seller/orders/${id}`),
  updateOrderStatus: (
    id: string,
    status: "CANCELLED" | "COMPLETED",
    reason?: string,
  ) => api.patch<Order>(`/seller/orders/${id}/status`, { status, reason }),

  // Broadcast
  broadcast: (payload: {
    title: string;
    body: string;
    audience?: "customer" | "seller" | "all";
  }) => api.post("/notifications/broadcast", payload),
};
