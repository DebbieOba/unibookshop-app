export interface Rating {
  id: string;
  bookId: string;
  userId: string;
  score: number;
  comment?: string | null;
  createdAt: string;
}
