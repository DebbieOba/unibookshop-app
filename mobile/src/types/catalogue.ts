export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  /** Undiscounted reference price — only ever set server-side when it's genuinely > price. */
  compareAtPrice?: number | null;
  costPrice: number;
  courseCode?: string | null;
  courseTitle?: string | null;
  isPreOrder?: boolean;
  releaseDate?: string | null;
  coverUrl?: string;
  categoryId: string;
  category?: Category;
  stockQuantity: number;
  /** Per-book override of the admin dashboard's global low-stock threshold. */
  reorderThreshold?: number | null;
  attributes?: {
    level?: string;
    departmentId?: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
