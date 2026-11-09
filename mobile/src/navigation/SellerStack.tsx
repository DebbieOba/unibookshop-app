import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SellerStackParamList } from "./types";
import { SellerTabNavigator } from "./SellerTabNavigator";
import { CategoriesScreen } from "../screens/seller/Categories/CategoriesScreen";
import { ProfitLossScreen } from "../screens/seller/ProfitLoss/ProfitLossScreen";
import { ApprovalsScreen } from "../screens/seller/Approvals/ApprovalsScreen";
import { SellerNotificationsScreen } from "../screens/seller/Notifications/SellerNotificationsScreen";
import { SellerOrderDetailsScreen } from "../screens/seller/OrderDetails/SellerOrderDetailsScreen";
import { BookstoreSettingsScreen } from "../screens/seller/Settings/BookstoreSettingsScreen";

import { FinancialDashboardScreen } from "../screens/seller/Financials/FinancialDashboardScreen";
import { ExpensesScreen } from "../screens/seller/Financials/ExpensesScreen";
import { TransactionHistoryScreen } from "../screens/seller/Financials/TransactionHistoryScreen";

const Stack = createNativeStackNavigator<SellerStackParamList>();

export function SellerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerTabs" component={SellerTabNavigator} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="FinancialDashboard" component={FinancialDashboardScreen} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="ProfitLoss" component={ProfitLossScreen} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} />
      <Stack.Screen
        name="SellerNotifications"
        component={SellerNotificationsScreen}
      />
      <Stack.Screen name="OrderDetails" component={SellerOrderDetailsScreen} />
      <Stack.Screen
        name="BookstoreSettings"
        component={BookstoreSettingsScreen}
      />
    </Stack.Navigator>
  );
}
