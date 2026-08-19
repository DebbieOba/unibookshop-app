import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { DashboardScreen } from '../screens/admin/Dashboard/DashboardScreen';
import { AdminOrdersScreen } from '../screens/admin/Orders/AdminOrdersScreen';
import { AdminBooksScreen } from '../screens/admin/Books/AdminBooksScreen';
import { InventoryScreen } from '../screens/admin/Inventory/InventoryScreen';
import { MoreScreen } from '../screens/admin/More/MoreScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const ICON_BY_ROUTE: Record<keyof AdminTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Orders: 'receipt-outline',
  Books: 'book-outline',
  Inventory: 'cube-outline',
  More: 'menu-outline',
};

export function AdminTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.adminAccent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICON_BY_ROUTE[route.name as keyof AdminTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={AdminOrdersScreen} />
      <Tab.Screen name="Books" component={AdminBooksScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
