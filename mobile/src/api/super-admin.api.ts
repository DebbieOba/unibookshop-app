import { api } from "./client";

export interface DynamicPermission {
  id: string;
  action: string;
  description?: string | null;
}

export interface DynamicRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Array<{
    roleId: string;
    permissionId: string;
    permission: DynamicPermission;
  }>;
}

export interface StaffMember {
  id: string;
  email: string;
  profile?: { fullName?: string | null } | null;
  roleRecord?: { id: string; name: string } | null;
  isActive: boolean;
}

export const superSellerApi = {
  // Roles & Permissions
  getRoles: () => api.get<DynamicRole[]>("/super-admin/roles"),
  createRole: (payload: { name: string; description?: string }) =>
    api.post<DynamicRole>("/super-admin/roles", payload),
  setRolePermissions: (id: string, payload: { permissionIds: string[] }) =>
    api.put<DynamicRole>(`/super-admin/roles/${id}/permissions`, payload),
  getPermissions: () =>
    api.get<DynamicPermission[]>("/super-admin/permissions"),

  // Staff Management
  getStaff: () => api.get<StaffMember[]>("/super-admin/staff"),
  createStaff: (payload: {
    email: string;
    fullName: string;
    password?: string;
    roleId: string;
  }) => api.post<StaffMember>("/super-admin/staff", payload),
};
