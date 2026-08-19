import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StudentTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { HomeScreen } from '../screens/student/Home/HomeScreen';
import { StoreScreen } from '../screens/student/Store/StoreScreen';
import { OrdersScreen } from '../screens/student/Orders/OrdersScreen';
import { FavouriteScreen } from '../screens/student/Favourite/FavouriteScreen';
import { AccountScreen } from '../screens/student/Account/AccountScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const ICON_BY_ROUTE: Record<keyof StudentTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Store: 'storefront-outline',
  Orders: 'receipt-outline',
  Favourites: 'heart-outline',
  Account: 'person-outline',
};

export function StudentTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICON_BY_ROUTE[route.name as keyof StudentTabParamList]} color={color} size={size} />
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
