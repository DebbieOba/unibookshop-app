import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useBroadcast() {
  return useMutation({ mutationFn: adminApi.broadcast });
}
