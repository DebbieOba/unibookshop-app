import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/seller.api";

export function useDashboard() {
  return useQuery({
    queryKey: ["seller", "dashboard"],
    queryFn: () => adminApi.getDashboard().then((res) => res.data),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ["seller", "inventory"],
    queryFn: () => adminApi.getInventory().then((res) => res.data),
  });
}
