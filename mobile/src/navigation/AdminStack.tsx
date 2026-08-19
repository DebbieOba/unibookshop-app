import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import { AdminTabNavigator } from './AdminTabNavigator';
import { SchoolsScreen } from '../screens/admin/Schools/SchoolsScreen';
import { DepartmentsScreen } from '../screens/admin/Departments/DepartmentsScreen';
import { LevelsScreen } from '../screens/admin/Levels/LevelsScreen';
import { CategoriesScreen } from '../screens/admin/Categories/CategoriesScreen';
import { ProfitLossScreen } from '../screens/admin/ProfitLoss/ProfitLossScreen';
import { ApprovalsScreen } from '../screens/admin/Approvals/ApprovalsScreen';
import { AdminNotificationsScreen } from '../screens/admin/Notifications/AdminNotificationsScreen';
import { AdminOrderDetailsScreen } from '../screens/admin/OrderDetails/AdminOrderDetailsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="Schools" component={SchoolsScreen} />
      <Stack.Screen name="Departments" component={DepartmentsScreen} />
      <Stack.Screen name="Levels" component={LevelsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ProfitLoss" component={ProfitLossScreen} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Stack.Screen name="OrderDetails" component={AdminOrderDetailsScreen} />
    </Stack.Navigator>
  );
}
