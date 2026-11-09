import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/seller.api";
import { AdjustInventoryPayload } from "../types/seller";

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookId,
      payload,
    }: {
      bookId: string;
      payload: AdjustInventoryPayload;
    }) => adminApi.adjustInventory(bookId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", "books"] });
    },
  });
}
