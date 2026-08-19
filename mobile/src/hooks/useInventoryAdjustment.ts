import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { AdjustInventoryPayload } from '../types/admin';

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, payload }: { bookId: string; payload: AdjustInventoryPayload }) =>
      adminApi.adjustInventory(bookId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'books'] });
    },
  });
}
