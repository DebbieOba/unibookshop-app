import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookInput, BrowseBooksParams, catalogueApi } from '../api/catalogue.api';

export function useBooks(params: BrowseBooksParams = {}) {
  return useQuery({
    queryKey: ['catalogue', 'books', params],
    queryFn: () => catalogueApi.getBooks(params).then((res) => res.data),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['catalogue', 'book', id],
    queryFn: () => catalogueApi.getBookById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCategories(bookshopId?: string) {
  return useQuery({
    queryKey: ['catalogue', 'categories', bookshopId],
    queryFn: () => catalogueApi.getCategories(bookshopId).then((res) => res.data),
  });
}

function useInvalidateBooks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['catalogue', 'books'] });
}

export function useCreateBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({ mutationFn: catalogueApi.createBook, onSuccess: invalidate });
}

export function useUpdateBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BookInput> }) =>
      catalogueApi.updateBook(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteBook() {
  const invalidate = useInvalidateBooks();
  return useMutation({ mutationFn: catalogueApi.deleteBook, onSuccess: invalidate });
}

export function useUploadBookCover() {
  const invalidate = useInvalidateBooks();
  return useMutation({
    mutationFn: ({ bookId, fileUri }: { bookId: string; fileUri: string }) =>
      catalogueApi.uploadCover(bookId, fileUri),
    onSuccess: invalidate,
  });
}

export function useCreateCategory() {
  const invalidate = useInvalidateBooks();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: catalogueApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'categories'] });
      invalidate();
    },
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateBooks();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: catalogueApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'categories'] });
      invalidate();
    },
  });
}
