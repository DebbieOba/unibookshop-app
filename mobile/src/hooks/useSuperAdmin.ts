import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superSellerApi } from "../api/super-admin.api";

// --- Queries ---

export function useSuperAdminRoles() {
  return useQuery({
    queryKey: ["super-admin", "roles"],
    queryFn: () => superSellerApi.getRoles().then((res) => res.data),
  });
}

export function useSuperAdminPermissions() {
  return useQuery({
    queryKey: ["super-admin", "permissions"],
    queryFn: () => superSellerApi.getPermissions().then((res) => res.data),
  });
}

export function useSuperAdminStaff() {
  return useQuery({
    queryKey: ["super-admin", "staff"],
    queryFn: () => superSellerApi.getStaff().then((res) => res.data),
  });
}

// --- Mutations ---

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superSellerApi.createRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["super-admin", "roles"],
      });
    },
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => superSellerApi.setRolePermissions(roleId, { permissionIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["super-admin", "roles"],
      });
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superSellerApi.createStaff,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["super-admin", "staff"],
      });
    },
  });
}
