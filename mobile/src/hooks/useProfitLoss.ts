import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useProfitLoss(range: string = '30d') {
  return useQuery({
    queryKey: ['admin', 'profit-loss', range],
    queryFn: () => adminApi.getProfitLoss(range).then((res) => res.data),
  });
}
