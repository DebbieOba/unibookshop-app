import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '../api/super-admin.api';

export function useSuperAdminRoles() {
  return useQuery({
    queryKey: ['super-admin', 'roles'],
    queryFn: () => superAdminApi.getRoles().then((res) => res.data),
  });
}

export function useSuperAdminPermissions() {
  return useQuery({
    queryKey: ['super-admin', 'permissions'],
    queryFn: () => superAdminApi.getPermissions().then((res) => res.data),
  });
}

export function useSuperAdminStaff() {
  return useQuery({
    queryKey: ['super-admin', 'staff'],
    queryFn: () => superAdminApi.getStaff().then((res) => res.data),
  });
}

export function useSuperAdminSchools() {
  return useQuery({
    queryKey: ['super-admin', 'schools'],
    queryFn: () => superAdminApi.getSchools().then((res) => res.data),
  });
}

export function useSuperAdminLevels() {
  return useQuery({
    queryKey: ['super-admin', 'levels'],
    queryFn: () => superAdminApi.getLevels().then((res) => res.data),
  });
}

// --- Mutations ---

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.createRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'roles'] });
    },
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      superAdminApi.setRolePermissions(id, { permissionIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'roles'] });
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.createStaff,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'staff'] });
    },
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.createSchool,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'schools'] });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.deleteSchool,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'schools'] });
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, name }: { schoolId: string; name: string }) =>
      superAdminApi.createDepartment(schoolId, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'schools'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.deleteDepartment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'schools'] });
    },
  });
}

export function useCreateLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.createLevel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'levels'] });
    },
  });
}

export function useDeleteLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.deleteLevel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['super-admin', 'levels'] });
    },
  });
}
