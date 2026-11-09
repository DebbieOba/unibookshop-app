import { api } from "./client";
import { Rating } from "../types/rating";

export const ratingsApi = {
  getForBook: (bookId: string) => api.get<Rating[]>(`/books/${bookId}/ratings`),

  rate: (bookId: string, score: number, comment?: string) =>
    api.post<Rating>(`/books/${bookId}/ratings`, { score, comment }),
};
