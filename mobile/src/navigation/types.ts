import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  VerifyEmail: {
    email: string;
    purpose: "verify-email" | "sign-in";
    /** Passed from sign-up so the screen can auto-login after verification */
    password?: string;
  };
};

export type CustomerTabParamList = {
  Home: undefined;
  Store:
    | {
        categoryId?: string;
        search?: string;
        inStockOnly?: boolean;
        minPrice?: number;
        maxPrice?: number;
        onSale?: boolean;
        isPreOrder?: boolean;
        sort?: "newest" | "priceAsc" | "priceDesc";
      }
    | undefined;
  Orders: undefined;
  Favourites: undefined;
  Account: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  BookDetails: { bookId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderDetails: { orderId: string };
  Notifications: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  NotificationPreferences: undefined;
  Security: undefined;
  Reviews: { bookId: string; bookTitle: string };
  WriteReview: { bookId: string; bookTitle: string };
  HelpCentre: undefined;
  ContactSupport: { category?: string } | undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  RefundPolicy: undefined;
  ExchangeListings: undefined;
  CreateListing: undefined;
  ListingDetails: { listingId: string };

  PreOrder: undefined;
};

export type SellerTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Books: undefined;
  Inventory: undefined;
  More: undefined;
};

export type SellerStackParamList = {
  SellerTabs: NavigatorScreenParams<SellerTabParamList> | undefined;
  Categories: undefined;
  FinancialDashboard: undefined;
  Expenses: undefined;
  TransactionHistory: undefined;
  ProfitLoss: undefined;
  Approvals: undefined;
  SellerNotifications: undefined;
  OrderDetails: { orderId: string };
  BookstoreSettings: undefined;
};

export type SuperAdminStackParamList = {
  SuperAdminDashboard: undefined;
  RoleManagement: undefined;
  StaffManagement: undefined;
  SuperAdminSettings: undefined;
};
