import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { catalogueApi } from '../api/catalogue.api';
import { localStorage } from '../lib/localStorage';
import { Book } from '../types/catalogue';

/** Small client-only view-history list (no backend endpoint for this) — ids
 * are recorded by `useRecordBookViewed` and resolved here via the same
 * per-book query key `useBook` uses, so results share cache with the rest of
 * the app rather than double-fetching. */
export function useRecentlyViewedBooks(excludeId?: string): { data: Book[]; isLoading: boolean } {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    localStorage.getRecentlyViewedBookIds().then(setIds);
  }, []);

  const relevantIds = ids.filter((id) => id !== excludeId);

  const results = useQueries({
    queries: relevantIds.map((id) => ({
      queryKey: ['catalogue', 'book', id],
      queryFn: () => catalogueApi.getBookById(id).then((res) => res.data),
    })),
  });

  return {
    data: results.map((r) => r.data).filter((b): b is Book => !!b),
    isLoading: relevantIds.length > 0 && results.some((r) => r.isLoading),
  };
}

export function useRecordBookViewed(bookId: string | undefined) {
  useEffect(() => {
    if (bookId) void localStorage.recordBookViewed(bookId);
  }, [bookId]);
}
