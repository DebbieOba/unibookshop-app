import { api } from "./client";
import { Book } from "../types/catalogue";

export interface PreOrderReservation {
  id: string;
  bookId: string;
  book: Book;
}

export const preOrdersApi = {
  getMine: () => api.get<PreOrderReservation[]>("/pre-orders"),

  reserve: (bookId: string) => api.post("/pre-orders", { bookId }),

  cancel: (bookId: string) => api.delete(`/pre-orders/${bookId}`),
};
