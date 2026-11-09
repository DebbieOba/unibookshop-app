import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../api/seller.api";

export function useBroadcast() {
  return useMutation({ mutationFn: adminApi.broadcast });
}
