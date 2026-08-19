import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard().then((res) => res.data),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: () => adminApi.getInventory().then((res) => res.data),
  });
}
