export interface CartItem {
  bookId: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  discountAmount: number;
  promoCode: string | null;
}

export type OrderStatus = "PROCESSING" | "COMPLETED" | "CANCELLED";
export type DeliveryMethod = "PICKUP" | "DELIVERY";
export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE";

export interface Order {
  id: string;
  status: OrderStatus;
  subtotalAmount?: number | null;
  discountAmount?: number;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    bookId: string;
    titleSnapshot: string;
    unitPrice: number;
    quantity: number;
  }>;
  /** Only populated on seller-facing endpoints. */
  user?: { email: string };
}

export interface SavingsSummary {
  totalSaved: number;
  totalSpent: number;
  percentageSaved: number;
  orderCount: number;
}

export interface SyllabusCourseProgress {
  courseCode: string;
  courseTitle: string | null;
  requiredBookCount: number;
  ownedBookCount: number;
}
