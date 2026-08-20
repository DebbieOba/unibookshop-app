import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type StudentTabParamList = {
  Home: undefined;
  Store: {
    categoryId?: string;
    search?: string;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    isPreOrder?: boolean;
    sort?: 'newest' | 'priceAsc' | 'priceDesc';
  } | undefined;
  Orders: undefined;
  Favourites: undefined;
  Account: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
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
  AcademicId: undefined;
  PreOrder: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Books: undefined;
  Inventory: undefined;
  More: undefined;
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabParamList> | undefined;
  Schools: undefined;
  Departments: undefined;
  Levels: undefined;
  Categories: undefined;
  ProfitLoss: undefined;
  Approvals: undefined;
  AdminNotifications: undefined;
  OrderDetails: { orderId: string };
};

export type SuperAdminStackParamList = {
  SuperAdminDashboard: undefined;
  RoleManagement: undefined;
  StaffManagement: undefined;
  SchoolManagement: undefined;
};
