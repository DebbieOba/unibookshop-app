export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
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
  subcategoryId?: string | null;
  subcategory?: Subcategory | null;

  // New generic bookshop fields
  isbn?: string | null;
  publisher?: string | null;
  edition?: string | null;
  publicationYear?: number | null;
  condition?: "NEW" | "USED";
  bookCondition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  language?: string | null;
  pages?: number | null;
  numberOfPages?: number | null;
  format?: "PAPERBACK" | "HARDCOVER" | "EBOOK";
  tags?: string[];

  stockQuantity: number;
  /** Per-book override of the seller dashboard's global low-stock threshold. */
  reorderThreshold?: number | null;
  attributes?: {


  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
