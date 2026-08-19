import { api } from './client';
import { Book } from '../types/catalogue';

interface Favourite {
  id: string;
  bookId: string;
  book: Book;
}

export const favouritesApi = {
  getMine: () => api.get<Favourite[]>('/favourites'),

  add: (bookId: string) => api.post('/favourites', { bookId }),

  remove: (bookId: string) => api.delete(`/favourites/${bookId}`),
};
