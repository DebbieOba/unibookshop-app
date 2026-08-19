import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

// Reads are used by both self-service screens (SignUp/Preferences) and the
// admin CRUD screens; mutations are admin-only (enforced server-side).

const SCHOOLS_KEY = ['admin', 'schools'];
const DEPARTMENTS_KEY = ['admin', 'departments'];
const LEVELS_KEY = ['admin', 'levels'];

// CrudService.findAll wraps every list in `{ data, meta }` (pagination
// envelope) — `res.data` is axios's own field and only unwraps one layer,
// so `.data.data` is required to reach the actual array.
export function useSchools() {
  return useQuery({
    queryKey: SCHOOLS_KEY,
    queryFn: () => adminApi.getSchools().then((res) => res.data.data),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_KEY,
    queryFn: () => adminApi.getDepartments().then((res) => res.data.data),
  });
}

export function useLevels() {
  return useQuery({
    queryKey: LEVELS_KEY,
    queryFn: () => adminApi.getLevels().then((res) => res.data.data),
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createSchool,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY }),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      adminApi.updateSchool(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY }),
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteSchool,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY }),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createDepartment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      adminApi.updateDepartment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteDepartment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}

export function useCreateLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createLevel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEVELS_KEY }),
  });
}

export function useUpdateLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      adminApi.updateLevel(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEVELS_KEY }),
  });
}

export function useDeleteLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteLevel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEVELS_KEY }),
  });
}
