import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BrowseListingsParams,
  CreateListingInput,
  exchangeApi,
} from "../api/exchange.api";

export function useListings(params: BrowseListingsParams = {}) {
  return useQuery({
    queryKey: ["exchange", "listings", params],
    queryFn: () => exchangeApi.getListings(params).then((res) => res.data),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["exchange", "listing", id],
    queryFn: () => exchangeApi.getListingById(id).then((res) => res.data),
    enabled: !!id,
  });
}

function useInvalidateListings() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["exchange", "listings"] });
}

export function useCreateListing() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (input: CreateListingInput) =>
      exchangeApi.createListing(input).then((res) => res.data),
    onSuccess: invalidate,
  });
}

export function useUpdateListingStatus() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "AVAILABLE" | "SOLD" | "REMOVED";
    }) => exchangeApi.updateListingStatus(id, status).then((res) => res.data),
    onSuccess: invalidate,
  });
}

export function useDeleteListing() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (id: string) => exchangeApi.deleteListing(id),
    onSuccess: invalidate,
  });
}
