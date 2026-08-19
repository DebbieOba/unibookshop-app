import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/order.api';

const CART_KEY = ['order', 'cart'];

export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => orderApi.getCart().then((res) => res.data),
  });
}

export function useSetCartLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: string; quantity: number }) =>
      orderApi.setCartLine(bookId, quantity).then((res) => res.data),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  });
}

export function useApplyPromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => orderApi.applyPromoCode(code).then((res) => res.data),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  });
}

export function useRemovePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orderApi.removePromoCode().then((res) => res.data),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  });
}
