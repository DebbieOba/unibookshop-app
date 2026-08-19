import { api } from './client';
import { Listing, ListingCondition } from '../types/exchange';
import { PaginatedResponse } from '../types/catalogue';

export interface BrowseListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: ListingCondition;
  mine?: boolean;
}

export interface CreateListingInput {
  title: string;
  author?: string;
  courseCode?: string;
  condition: ListingCondition;
  price: number;
  description?: string;
  imageUris: string[];
}

export const exchangeApi = {
  getListings: (params: BrowseListingsParams = {}) =>
    api.get<PaginatedResponse<Listing>>('/exchange/listings', { params }),

  getListingById: (id: string) => api.get<Listing>(`/exchange/listings/${id}`),

  createListing: ({ imageUris, ...fields }: CreateListingInput) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) form.append(key, String(value));
    });
    imageUris.forEach((uri, i) => {
      form.append('images', { uri, name: `listing-${i}.jpg`, type: 'image/jpeg' } as unknown as Blob);
    });
    return api.post<Listing>('/exchange/listings', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateListingStatus: (id: string, status: 'AVAILABLE' | 'SOLD' | 'REMOVED') =>
    api.patch<Listing>(`/exchange/listings/${id}`, { status }),

  deleteListing: (id: string) => api.delete(`/exchange/listings/${id}`),
};
