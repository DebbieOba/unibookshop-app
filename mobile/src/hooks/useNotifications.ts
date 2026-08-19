import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';

const FEED_KEY = ['notification', 'feed'];

export function useNotifications() {
  return useQuery({
    queryKey: FEED_KEY,
    queryFn: () => notificationApi.getFeed().then((res) => res.data),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FEED_KEY }),
  });
}
