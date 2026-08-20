import { api } from './client';

export interface DynamicPermission {
  id: string;
  action: string;
  description: string | null;
}

export interface DynamicRole {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    roleId: string;
    permissionId: string;
    permission: DynamicPermission;
  }>;
}

export interface StaffMember {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'student';
  roleId: string | null;
  roleRecord: DynamicRole | null;
  profile: {
    fullName: string;
  } | null;
}

export interface GlobalSchool {
  id: string;
  name: string;
  departments: Array<{ id: string; name: string }>;
}

export interface GlobalLevel {
  id: string;
  name: string;
}

export const superAdminApi = {
  // Roles & Permissions
  getRoles: () => api.get<DynamicRole[]>('/super-admin/roles'),
  createRole: (payload: { name: string; description?: string }) =>
    api.post<DynamicRole>('/super-admin/roles', payload),
  setRolePermissions: (id: string, payload: { permissionIds: string[] }) =>
    api.put<DynamicRole>(`/super-admin/roles/${id}/permissions`, payload),
  getPermissions: () => api.get<DynamicPermission[]>('/super-admin/permissions'),

  // Staff Management
  getStaff: () => api.get<StaffMember[]>('/super-admin/staff'),
  createStaff: (payload: { email: string; fullName: string; password?: string; roleId: string }) =>
    api.post<StaffMember>('/super-admin/staff', payload),

  // Schools, Departments, Levels
  getSchools: () => api.get<GlobalSchool[]>('/super-admin/schools'),
  createSchool: (payload: { name: string }) => api.post<GlobalSchool>('/super-admin/schools', payload),
  deleteSchool: (id: string) => api.delete(`/super-admin/schools/${id}`),

  createDepartment: (schoolId: string, payload: { name: string }) =>
    api.post<any>(`/super-admin/schools/${schoolId}/departments`, payload),
  deleteDepartment: (id: string) => api.delete(`/super-admin/departments/${id}`),

  getLevels: () => api.get<GlobalLevel[]>('/super-admin/levels'),
  createLevel: (payload: { name: string }) => api.post<GlobalLevel>('/super-admin/levels', payload),
  deleteLevel: (id: string) => api.delete(`/super-admin/levels/${id}`),
};
