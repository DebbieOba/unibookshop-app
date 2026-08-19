import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/student/Login/LoginScreen';
import { SignUpScreen } from '../screens/student/SignUp/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/student/ForgotPassword/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/student/ResetPassword/ResetPasswordScreen';

/**
 * No more role-selection-before-login: the backend resolves role from the
 * identifier (email or matric number) and returns it in the JWT, and
 * RootNavigator already branches on `user.role` — so one Login screen
 * serves both students and admins.
 */
const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
