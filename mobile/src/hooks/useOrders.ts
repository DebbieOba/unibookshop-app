import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order.api";

export function useOrders() {
  return useQuery({
    queryKey: ["order", "list"],
    queryFn: () => orderApi.getOrders().then((res) => res.data),
  });
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

/** Pass `poll: true` while an order may still resolve from PROCESSING (e.g.
 * OrderConfirmationScreen right after checkout) — mirrors the polling
 * pattern in PendingApprovalScreen.tsx, bounded so a stuck order doesn't
 * poll forever. */
export function useOrder(id: string, options: { poll?: boolean } = {}) {
  const pollStartedAt = useRef<number | null>(null);

  return useQuery({
    queryKey: ["order", "detail", id],
    queryFn: () => orderApi.getOrderById(id).then((res) => res.data),
    enabled: !!id,
    refetchInterval: (query) => {
      if (!options.poll) return false;
      if (query.state.data && query.state.data.status !== "PROCESSING")
        return false;
      pollStartedAt.current ??= Date.now();
      if (Date.now() - pollStartedAt.current > POLL_TIMEOUT_MS) return false;
      return POLL_INTERVAL_MS;
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "cart"] });
      queryClient.invalidateQueries({ queryKey: ["order", "list"] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      orderApi.verifyPayment(orderId).then((res) => res.data),
    onSuccess: (order) => {
      queryClient.setQueryData(["order", "detail", order.id], order);
    },
  });
}

export function useSavingsSummary() {
  return useQuery({
    queryKey: ["order", "savings-summary"],
    queryFn: () => orderApi.getSavingsSummary().then((res) => res.data),
  });
}

export function useSyllabusProgress() {
  return useQuery({
    queryKey: ["order", "syllabus-progress"],
    queryFn: () => orderApi.getSyllabusProgress().then((res) => res.data),
  });
}
