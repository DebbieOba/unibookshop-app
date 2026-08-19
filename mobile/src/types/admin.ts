// CrudService.findAll (backend/src/common/crud.service.ts) paginates every
// list it returns — Schools/Departments/Levels all go through it, so their
// GET responses are never a bare array.
export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface School {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  schoolId: string;
}

export interface Level {
  id: string;
  name: string;
}

export interface PendingUser {
  id: string;
  email: string;
  matricNumber?: string | null;
  profile: { fullName: string } | null;
  department: Department | null;
}

/** Approved + restricted users — the "Active" side of Users & Access. */
export interface ActiveUser {
  id: string;
  email: string;
  matricNumber?: string | null;
  profile: { fullName: string } | null;
  department: Department | null;
  accountState: 'APPROVED' | 'RESTRICTED';
  restrictionReason?: string | null;
}

export type InventoryMovementType = 'RESTOCK' | 'DAMAGE' | 'CORRECTION' | 'RETURN' | 'MANUAL_REDUCTION';

export interface AdjustInventoryPayload {
  type: InventoryMovementType;
  quantityDelta: number;
  reason: string;
}

export interface DashboardKpis {
  totalUsers: number;
  pendingApprovals: number;
  totalBooks: number;
  totalOrders: number;
  recentOrders: Array<{ id: string; status: string; totalAmount: number; createdAt: string }>;
}

export interface InventorySummary {
  totalBooks: number;
  lowStock: number;
  outOfStock: number;
  lowStockThreshold: number;
}

export interface ProfitLossSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  revenueGrowth: number;
  profitGrowth: number;
}

export interface DailyProfitLoss {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface ProfitLossData {
  summary: ProfitLossSummary;
  dailyBreakdown: DailyProfitLoss[];
}
