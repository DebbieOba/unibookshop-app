import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { secureStorage } from "../lib/secureStorage";
import { registerPushToken } from "../lib/push";

export function useBookshops() {
  return useQuery({
    queryKey: ["auth", "bookshops"],
    queryFn: () => authApi.getBookshops().then((res) => res.data),
  });
}

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      const { data: tokens } = await authApi.login(identifier, password);
      await secureStorage.setRefreshToken(tokens.refreshToken);

      // Token must be in the store before `me()` fires — the request
      // interceptor reads it from there to attach the Authorization header.
      setAccessToken(tokens.accessToken);
      const { data: user } = await authApi.me();
      setSession(tokens.accessToken, user);
      void registerPushToken();
      return user;
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
      await secureStorage.clearRefreshToken();
      clearSession();
    },
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
  });
}
