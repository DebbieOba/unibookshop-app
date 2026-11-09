import { api } from './client';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: string;
}

export const expensesApi = {
  findAll: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data } = await api.get<Expense[]>(
      `/seller/expenses?${params.toString()}`
    );
    return data;
  },

  create: async (payload: { amount: number; description: string; category?: string; date?: string }) => {
    const { data } = await api.post<Expense>('/seller/expenses', payload);
    return data;
  },

  update: async (id: string, payload: { amount?: number; description?: string; category?: string; date?: string }) => {
    const { data } = await api.patch<Expense>(`/seller/expenses/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    await api.delete(`/seller/expenses/${id}`);
  },
};
