import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preOrdersApi } from '../api/pre-orders.api';

const PRE_ORDERS_KEY = ['catalogue', 'pre-orders'];

export function usePreOrders() {
  return useQuery({
    queryKey: PRE_ORDERS_KEY,
    queryFn: () => preOrdersApi.getMine().then((res) => res.data),
  });
}

export function useTogglePreOrderReservation() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRE_ORDERS_KEY });

  return useMutation({
    mutationFn: ({ bookId, isReserved }: { bookId: string; isReserved: boolean }) =>
      isReserved ? preOrdersApi.cancel(bookId) : preOrdersApi.reserve(bookId),
    onSuccess: invalidate,
  });
}
