import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { OrderStatus } from '../types/order';

export function useAdminOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => adminApi.getOrders(status).then((res) => res.data),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin', 'orders', 'detail', id],
    queryFn: () => adminApi.getOrder(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'CANCELLED' | 'COMPLETED'; reason?: string }) =>
      adminApi.updateOrderStatus(id, status, reason),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
