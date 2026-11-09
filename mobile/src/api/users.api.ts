import { api } from "./client";
import { Address, Profile } from "../types/user";

export const usersApi = {
  getProfile: () => api.get<Profile>("/users/me"),

  updateProfile: (payload: {
    fullName?: string;
    phone?: string;
    interests?: string[];


  }) => api.patch<Profile>("/users/me", payload),

  uploadAvatar: (fileUri: string) => {
    const form = new FormData();
    // React Native's fetch/FormData accepts this {uri, name, type} shape for
    // file parts — see frontend-architecture.md §10 (image handling).
    form.append("file", {
      uri: fileUri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
    return api.post<Profile>("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateNotificationPreferences: (payload: {
    push?: boolean;
    email?: boolean;
  }) => api.patch<Profile>("/users/me/notification-preferences", payload),

  getAddresses: () => api.get<Address[]>("/users/me/address"),

  addAddress: (
    payload: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean },
  ) => api.post<Address>("/users/me/address", payload),

  updateAddress: (id: string, payload: Partial<Omit<Address, "id">>) =>
    api.patch<Address>(`/users/me/address/${id}`, payload),

  deleteAddress: (id: string) => api.delete(`/users/me/address/${id}`),

  setDefaultAddress: (id: string) =>
    api.post(`/users/me/address/${id}/set-default`),

  setPushToken: (token: string) => api.post("/users/me/push-token", { token }),

  exportUserData: () => api.get<{ exportedAt: string; disclaimer: string; data: any }>("/users/me/export"),

  deleteAccount: (password: string) =>
    api.post<{ success: boolean; message: string }>("/users/me/delete-account", { password }),
};
