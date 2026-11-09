import { api } from './client';

export interface FinancialSummary {
  totalRevenue: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  totalRefunds: number;
  totalDiscounts: number;
  booksSold: number;
  totalOrders: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ExpenseBreakdown {
  name: string;
  amount: number;
}

export interface BookStats {
  title: string;
  copies: number;
  revenue: number;
  cost: number;
  profit?: number;
  profitMargin?: number;
}

export interface FinancialDashboardResponse {
  summary: FinancialSummary;
  chartData: ChartData[];
  expenseBreakdown: ExpenseBreakdown[];
  bestSellingBooks: BookStats[];
  mostProfitableBooks: BookStats[];
  insights: string[];
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'SALE' | 'EXPENSE' | 'REFUND';
  description: string;
  amount: number;
}

export interface InventoryValueResponse {
  totalTitles: number;
  totalCopies: number;
  inventoryCostValue: number;
  potentialSalesValue: number;
  potentialGrossProfit: number;
}

export const financialsApi = {
  getDashboardData: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data } = await api.get<FinancialDashboardResponse>(
      `/seller/financials/dashboard?${params.toString()}`
    );
    return data;
  },

  getTransactions: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data } = await api.get<FinancialTransaction[]>(
      `/seller/financials/transactions?${params.toString()}`
    );
    return data;
  },

  getInventoryValue: async () => {
    const { data } = await api.get<InventoryValueResponse>(
      `/seller/financials/inventory-value`
    );
    return data;
  },
};
