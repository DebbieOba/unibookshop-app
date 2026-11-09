import { api } from "./client";
import { AuthUser } from "../store/authStore";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  
  // now, not at registration — see RegisterDto.
  register: (payload: {
    email: string;
    password: string;

    firstName?: string;
    lastName?: string;
    fullName?: string;

    bookshopId?: string;
    bookshopName?: string;
    role?: string;
  }) => api.post("/auth/register", payload),

  getBookshops: () =>
    api.get<Array<{ id: string; name: string; slug: string }>>(
      "/auth/bookshops",
    ),

  login: (identifier: string, password: string) =>
    api.post<TokenPair>("/auth/login", { identifier, password }),

  refresh: (refreshToken: string) =>
    api.post<TokenPair>("/auth/refresh", { refreshToken }),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<AuthUser>("/auth/me"),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),

  sendOtp: (email: string, purpose: "verify-email" | "sign-in") =>
    api.post("/auth/otp/send", { email, purpose }),

  verifyOtp: (
    email: string,
    code: string,
    purpose: "verify-email" | "sign-in"
  ) => api.post<{ accessToken?: string; refreshToken?: string; verified?: boolean }>("/auth/otp/verify", { email, code, purpose }),
};
