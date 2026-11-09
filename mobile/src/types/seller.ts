export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface PendingUser {
  id: string;
  email: string;

  profile: { fullName: string } | null;

}

/** Approved + restricted users — the "Active" side of Users & Access. */
export interface ActiveUser {
  id: string;
  email: string;

  profile: { fullName: string } | null;

  accountState: "APPROVED" | "RESTRICTED";
  restrictionReason?: string | null;
}

export type InventoryMovementType =
  "RESTOCK" | "DAMAGE" | "CORRECTION" | "RETURN" | "MANUAL_REDUCTION";

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
  totalCopiesAvailable: number;
  todayRevenue: number;
  currentStockValue: number;
  lowStock: number;
  outOfStock: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export interface InventorySummary {
  totalBooks: number;
  totalCopiesAvailable: number;
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
  unitsSold: number;
}

export interface ProfitLossData {
  summary: ProfitLossSummary;
  dailyBreakdown: DailyProfitLoss[];
}
