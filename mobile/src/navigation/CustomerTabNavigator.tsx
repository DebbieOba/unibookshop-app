import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { CustomerTabParamList } from "./types";
import { useTheme } from "../hooks/useTheme";
import { HomeScreen } from "../screens/customer/Home/HomeScreen";
import { StoreScreen } from "../screens/customer/Store/StoreScreen";
import { OrdersScreen } from "../screens/customer/Orders/OrdersScreen";
import { FavouriteScreen } from "../screens/customer/Favourite/FavouriteScreen";
import { AccountScreen } from "../screens/customer/Account/AccountScreen";

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const ICON_BY_ROUTE: Record<
  keyof CustomerTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Home: "home-outline",
  Store: "storefront-outline",
  Orders: "receipt-outline",
  Favourites: "heart-outline",
  Account: "person-outline",
};

export function CustomerTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={ICON_BY_ROUTE[route.name as keyof CustomerTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Favourites" component={FavouriteScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
