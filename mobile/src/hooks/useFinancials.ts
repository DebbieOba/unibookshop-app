import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialsApi } from '../api/financials.api';

export const useFinancialDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['financials', 'dashboard', startDate, endDate],
    queryFn: () => financialsApi.getDashboardData(startDate, endDate),
  });
};

export const useFinancialTransactions = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['financials', 'transactions', startDate, endDate],
    queryFn: () => financialsApi.getTransactions(startDate, endDate),
  });
};

export const useInventoryValue = () => {
  return useQuery({
    queryKey: ['financials', 'inventory-value'],
    queryFn: () => financialsApi.getInventoryValue(),
  });
};
