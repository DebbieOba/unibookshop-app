import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/seller.api";
import { OrderStatus } from "../types/order";

export function useSellerOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ["seller", "orders", status],
    queryFn: () => adminApi.getOrders(status).then((res) => res.data),
  });
}

export function useSellerOrder(id: string) {
  return useQuery({
    queryKey: ["seller", "orders", "detail", id],
    queryFn: () => adminApi.getOrder(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "CANCELLED" | "COMPLETED";
      reason?: string;
    }) => adminApi.updateOrderStatus(id, status, reason),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["seller", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["seller", "orders", "detail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
    },
  });
}
