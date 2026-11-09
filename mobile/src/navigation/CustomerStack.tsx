import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "./types";
import { CustomerTabNavigator } from "./CustomerTabNavigator";
import { BookDetailsScreen } from "../screens/customer/BookDetails/BookDetailsScreen";
import { CartScreen } from "../screens/customer/Cart/CartScreen";
import { CheckoutScreen } from "../screens/customer/Checkout/CheckoutScreen";
import { OrderConfirmationScreen } from "../screens/customer/OrderConfirmation/OrderConfirmationScreen";
import { OrderDetailsScreen } from "../screens/customer/OrderDetails/OrderDetailsScreen";
import { NotificationsScreen } from "../screens/customer/Notifications/NotificationsScreen";
import { EditProfileScreen } from "../screens/customer/EditProfile/EditProfileScreen";
import { AddressesScreen } from "../screens/customer/Addresses/AddressesScreen";
import { NotificationPreferencesScreen } from "../screens/customer/NotificationPreferences/NotificationPreferencesScreen";
import { SecurityScreen } from "../screens/customer/Security/SecurityScreen";
import { ReviewsScreen } from "../screens/customer/Reviews/ReviewsScreen";
import { WriteReviewScreen } from "../screens/customer/WriteReview/WriteReviewScreen";
import { HelpCentreScreen } from "../screens/customer/HelpCentre/HelpCentreScreen";
import { ContactSupportScreen } from "../screens/customer/ContactSupport/ContactSupportScreen";
import { TermsScreen } from "../screens/customer/Legal/TermsScreen";
import { PrivacyPolicyScreen } from "../screens/customer/Legal/PrivacyPolicyScreen";
import { RefundPolicyScreen } from "../screens/customer/Legal/RefundPolicyScreen";
import { ExchangeListingsScreen } from "../screens/customer/Exchange/ExchangeListingsScreen";
import { CreateListingScreen } from "../screens/customer/Exchange/CreateListingScreen";
import { ListingDetailsScreen } from "../screens/customer/Exchange/ListingDetailsScreen";

import { PreOrderScreen } from "../screens/customer/PreOrder/PreOrderScreen";

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ headerShown: true, title: "Order Details" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ headerShown: true, title: "Notifications" }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerShown: true, title: "Ratings & Reviews" }}
      />
      <Stack.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={{ headerShown: true, title: "Write a Review" }}
      />
      <Stack.Screen
        name="HelpCentre"
        component={HelpCentreScreen}
        options={{ headerShown: true, title: "Help Centre" }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={{ headerShown: true, title: "Contact Support" }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ headerShown: true, title: "Terms of Service" }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: true, title: "Privacy Policy" }}
      />
      <Stack.Screen
        name="RefundPolicy"
        component={RefundPolicyScreen}
        options={{ headerShown: true, title: "Refund Policy" }}
      />
      <Stack.Screen
        name="ExchangeListings"
        component={ExchangeListingsScreen}
        options={{ headerShown: true, title: "Textbook Exchange" }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ headerShown: true, title: "List a Book" }}
      />
      <Stack.Screen
        name="ListingDetails"
        component={ListingDetailsScreen}
        options={{ headerShown: true, title: "Listing" }}
      />

      <Stack.Screen
        name="PreOrder"
        component={PreOrderScreen}
        options={{ headerShown: true, title: "Pre-Order" }}
      />
    </Stack.Navigator>
  );
}
