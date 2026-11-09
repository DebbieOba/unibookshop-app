import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingsApi } from "../api/ratings.api";

export function useBookRatings(bookId: string) {
  return useQuery({
    queryKey: ["catalogue", "ratings", bookId],
    queryFn: () => ratingsApi.getForBook(bookId).then((res) => res.data),
    enabled: !!bookId,
  });
}

export function useRateBook(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ score, comment }: { score: number; comment?: string }) =>
      ratingsApi.rate(bookId, score, comment),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["catalogue", "ratings", bookId],
      }),
  });
}
