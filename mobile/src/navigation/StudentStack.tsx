import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentStackParamList } from './types';
import { StudentTabNavigator } from './StudentTabNavigator';
import { BookDetailsScreen } from '../screens/student/BookDetails/BookDetailsScreen';
import { CartScreen } from '../screens/student/Cart/CartScreen';
import { CheckoutScreen } from '../screens/student/Checkout/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/student/OrderConfirmation/OrderConfirmationScreen';
import { OrderDetailsScreen } from '../screens/student/OrderDetails/OrderDetailsScreen';
import { NotificationsScreen } from '../screens/student/Notifications/NotificationsScreen';
import { EditProfileScreen } from '../screens/student/EditProfile/EditProfileScreen';
import { AddressesScreen } from '../screens/student/Addresses/AddressesScreen';
import { NotificationPreferencesScreen } from '../screens/student/NotificationPreferences/NotificationPreferencesScreen';
import { SecurityScreen } from '../screens/student/Security/SecurityScreen';
import { ReviewsScreen } from '../screens/student/Reviews/ReviewsScreen';
import { WriteReviewScreen } from '../screens/student/WriteReview/WriteReviewScreen';
import { HelpCentreScreen } from '../screens/student/HelpCentre/HelpCentreScreen';
import { ContactSupportScreen } from '../screens/student/ContactSupport/ContactSupportScreen';
import { TermsScreen } from '../screens/student/Legal/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/student/Legal/PrivacyPolicyScreen';
import { RefundPolicyScreen } from '../screens/student/Legal/RefundPolicyScreen';
import { ExchangeListingsScreen } from '../screens/student/Exchange/ExchangeListingsScreen';
import { CreateListingScreen } from '../screens/student/Exchange/CreateListingScreen';
import { ListingDetailsScreen } from '../screens/student/Exchange/ListingDetailsScreen';
import { AcademicIdScreen } from '../screens/student/AcademicId/AcademicIdScreen';
import { PreOrderScreen } from '../screens/student/PreOrder/PreOrderScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

export function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      <Stack.Screen name="BookDetails" component={BookDetailsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: true }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: true, title: 'Order Details' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: true }} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: true, title: 'Ratings & Reviews' }} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ headerShown: true, title: 'Write a Review' }} />
      <Stack.Screen name="HelpCentre" component={HelpCentreScreen} options={{ headerShown: true, title: 'Help Centre' }} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} options={{ headerShown: true, title: 'Contact Support' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
      <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} options={{ headerShown: true, title: 'Refund Policy' }} />
      <Stack.Screen name="ExchangeListings" component={ExchangeListingsScreen} options={{ headerShown: true, title: 'Textbook Exchange' }} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ headerShown: true, title: 'List a Book' }} />
      <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} options={{ headerShown: true, title: 'Listing' }} />
      <Stack.Screen name="AcademicId" component={AcademicIdScreen} options={{ headerShown: true, title: 'Academic ID' }} />
      <Stack.Screen name="PreOrder" component={PreOrderScreen} options={{ headerShown: true, title: 'Pre-Order' }} />
    </Stack.Navigator>
  );
}
