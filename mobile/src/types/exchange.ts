export type ListingCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
export type ListingStatus = "AVAILABLE" | "SOLD" | "REMOVED";

export interface ListingSeller {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  author?: string | null;
  courseCode?: string | null;
  condition: ListingCondition;
  price: number;
  description?: string | null;
  images: string[];
  status: ListingStatus;
  createdAt: string;
  seller: ListingSeller;
}
