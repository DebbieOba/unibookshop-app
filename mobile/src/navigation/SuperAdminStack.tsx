import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SuperAdminStackParamList } from "./types";
import { SuperAdminDashboardScreen } from "../screens/super-admin/SuperAdminDashboardScreen";
import { RoleManagementScreen } from "../screens/super-admin/RoleManagementScreen";
import { StaffManagementScreen } from "../screens/super-admin/StaffManagementScreen";

import { SuperAdminSettingsScreen } from "../screens/super-admin/SuperAdminSettingsScreen";

const Stack = createNativeStackNavigator<SuperAdminStackParamList>();

export function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SuperAdminDashboard"
        component={SuperAdminDashboardScreen}
      />
      <Stack.Screen name="RoleManagement" component={RoleManagementScreen} />
      <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />

      <Stack.Screen
        name="SuperAdminSettings"
        component={SuperAdminSettingsScreen}
      />
    </Stack.Navigator>
  );
}
