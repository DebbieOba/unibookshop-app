import { api } from "./client";
import { Book, Category, Subcategory, PaginatedResponse } from "../types/catalogue";

export interface BrowseBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  audience?: string;
  condition?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSale?: boolean;
  isPreOrder?: boolean;
  courseCode?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
}

export interface BookInput {
  title: string;
  author: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  courseCode?: string;
  courseTitle?: string;
  isPreOrder?: boolean;
  releaseDate?: string;
  categoryId: string;
  subcategoryId?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  condition?: "NEW" | "USED";
  bookCondition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  language?: string;
  pages?: number;
  numberOfPages?: number;
  format?: "PAPERBACK" | "HARDCOVER" | "EBOOK";
  tags?: string[];
  stockQuantity: number;
  reorderThreshold?: number;
}

export const catalogueApi = {
  // ...
  getBooks: (params: BrowseBooksParams = {}) =>
    api.get<PaginatedResponse<Book>>("/books", { params }),

  getBookById: (id: string) => api.get<Book>(`/books/${id}`),

  createBook: (payload: BookInput) => api.post<Book>("/books", payload),

  updateBook: (id: string, payload: Partial<BookInput>) =>
    api.patch<Book>(`/books/${id}`, payload),

  deleteBook: (id: string) => api.delete(`/books/${id}`),

  uploadCover: (bookId: string, fileUri: string) => {
    const form = new FormData();
    // Same {uri, name, type} multipart pattern as avatar upload — see
    // frontend-architecture.md §12.
    form.append("file", {
      uri: fileUri,
      name: "cover.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
    return api.post<Book>(`/books/${bookId}/cover`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadSample: (bookId: string, fileUri: string) => {
    const form = new FormData();
    form.append("file", {
      uri: fileUri,
      name: "sample.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
    return api.post<Book>(`/books/${bookId}/sample`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getCategories: (bookshopId?: string) =>
    api.get<Category[]>("/categories", { params: { bookshopId } }),

  createCategory: (payload: { name: string }) =>
    api.post<Category>("/categories", payload),

  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  getSubcategories: (categoryId?: string) =>
    api.get<Subcategory[]>("/subcategories", { params: { categoryId } }),

  createSubcategory: (payload: { name: string; categoryId: string }) =>
    api.post<Subcategory>("/subcategories", payload),

  deleteSubcategory: (id: string) => api.delete(`/subcategories/${id}`),
};
