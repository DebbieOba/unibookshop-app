import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SellerTabParamList } from "./types";
import { useTheme } from "../hooks/useTheme";
import { DashboardScreen } from "../screens/seller/Dashboard/DashboardScreen";
import { SellerOrdersScreen } from "../screens/seller/Orders/SellerOrdersScreen";
import { SellerBooksScreen } from "../screens/seller/Books/SellerBooksScreen";
import { InventoryScreen } from "../screens/seller/Inventory/InventoryScreen";
import { MoreScreen } from "../screens/seller/More/MoreScreen";

const Tab = createBottomTabNavigator<SellerTabParamList>();

const ICON_BY_ROUTE: Record<
  keyof SellerTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Dashboard: "grid-outline",
  Orders: "receipt-outline",
  Books: "book-outline",
  Inventory: "cube-outline",
  More: "menu-outline",
};

export function SellerTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.adminAccent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={ICON_BY_ROUTE[route.name as keyof SellerTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={SellerOrdersScreen} />
      <Tab.Screen name="Books" component={SellerBooksScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
