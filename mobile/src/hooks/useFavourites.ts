import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favouritesApi } from '../api/favourites.api';

const FAVOURITES_KEY = ['catalogue', 'favourites'];

export function useFavourites() {
  return useQuery({
    queryKey: FAVOURITES_KEY,
    queryFn: () => favouritesApi.getMine().then((res) => res.data),
  });
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: FAVOURITES_KEY });

  return useMutation({
    mutationFn: ({ bookId, isFavourited }: { bookId: string; isFavourited: boolean }) =>
      isFavourited ? favouritesApi.remove(bookId) : favouritesApi.add(bookId),
    onSuccess: invalidate,
  });
}
