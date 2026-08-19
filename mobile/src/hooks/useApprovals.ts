import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

const APPROVALS_KEY = ['admin', 'approvals'];
const ACTIVE_USERS_KEY = ['admin', 'users', 'active'];

export function useApprovals() {
  return useQuery({
    queryKey: APPROVALS_KEY,
    queryFn: () => adminApi.getPendingApprovals().then((res) => res.data),
  });
}

export function useDecideApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, decision }: { userId: string; decision: 'APPROVED' | 'REJECTED' }) =>
      adminApi.decideApproval(userId, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPROVALS_KEY }),
  });
}

/** Approved + restricted users — the "Active" tab of Users & Access. */
export function useActiveUsers() {
  return useQuery({
    queryKey: ACTIVE_USERS_KEY,
    queryFn: () => adminApi.getActiveUsers().then((res) => res.data),
  });
}

export function useRestrictUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.restrictUser(userId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVE_USERS_KEY }),
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.restoreUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVE_USERS_KEY }),
  });
}
