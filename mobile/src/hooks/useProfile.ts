import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";

const PROFILE_KEY = ["users", "profile"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => usersApi.getProfile().then((res) => res.data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (res) => queryClient.setQueryData(PROFILE_KEY, res.data),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.uploadAvatar,
    onSuccess: (res) => queryClient.setQueryData(PROFILE_KEY, res.data),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateNotificationPreferences,
    onSuccess: (res) => queryClient.setQueryData(PROFILE_KEY, res.data),
  });
}
