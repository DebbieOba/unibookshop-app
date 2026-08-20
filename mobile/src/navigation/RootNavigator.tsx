import { useEffect, useState } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../hooks/useTheme';
import { secureStorage } from '../lib/secureStorage';
import { authApi } from '../api/auth.api';
import { SplashScreen } from '../screens/student/Splash/SplashScreen';
import { OnboardingScreen } from '../screens/student/Onboarding/OnboardingScreen';
import { PendingApprovalScreen } from '../screens/student/PendingApproval/PendingApprovalScreen';
import { CompleteProfileScreen } from '../screens/student/CompleteProfile/CompleteProfileScreen';
import { AuthStack } from './AuthStack';
import { StudentStack } from './StudentStack';
import { AdminStack } from './AdminStack';
import { SuperAdminStack } from './SuperAdminStack';

/**
 * Deep-link path -> screen mapping. AuthStack/StudentStack are never
 * mounted at the same time (RootNavigator picks exactly one), so a flat
 * `screens` map is safe here — a path that doesn't exist in whichever tree
 * is currently active just doesn't resolve, rather than crashing. Covers:
 * the password-reset email link (PasswordResetEmail.tsx, AuthStack) and
 * notification taps (frontend-architecture.md §10, StudentStack).
 */
const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['curricula://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Notifications: 'notifications',
      OrderConfirmation: 'order/:orderId',
    },
  },
};

/**
 * The single place that decides which stack is on screen — driven by the
 * three flows in project.md §3. See frontend-architecture.md §5.
 */
export function RootNavigator() {
  const { user, isHydrating, needsOnboarding, setAccessToken, setSession, setHydrating } = useAuthStore();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const theme = useTheme();
  const [onboardingSeen, setOnboardingSeenState] = useState<boolean | null>(null);
  const [themeModeLoaded, setThemeModeLoaded] = useState(false);

  useEffect(() => {
    secureStorage.getThemeMode().then((stored) => {
      if (stored) setThemeMode(stored);
      setThemeModeLoaded(true);
    });
  }, [setThemeMode]);

  useEffect(() => {
    (async () => {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) {
        setHydrating(false);
        return;
      }

      try {
        const { data: tokens } = await authApi.refresh(refreshToken);
        await secureStorage.setRefreshToken(tokens.refreshToken);
        setAccessToken(tokens.accessToken);

        const { data: me } = await authApi.me();
        setSession(tokens.accessToken, me);
      } catch {
        await secureStorage.clearRefreshToken();
      } finally {
        setHydrating(false);
      }
    })();
  }, [setAccessToken, setSession, setHydrating]);

  useEffect(() => {
    secureStorage.getOnboardingSeen().then(setOnboardingSeenState);
  }, []);

  if (isHydrating || onboardingSeen === null || !themeModeLoaded) {
    return <SplashScreen />;
  }

  const navigationTheme: NavigationTheme = {
    ...(themeMode === 'dark' ? DarkTheme : DefaultTheme),
    dark: themeMode === 'dark',
    colors: {
      ...(themeMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  return (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      {!user && !onboardingSeen ? (
        <OnboardingScreen
          onDone={() => {
            void secureStorage.setOnboardingSeen();
            setOnboardingSeenState(true);
          }}
        />
      ) : !user ? (
        <AuthStack />
      ) : user.accountState !== 'APPROVED' ? (
        <PendingApprovalScreen />
      ) : user.role === 'student' && needsOnboarding ? (
        <CompleteProfileScreen />
      ) : user.role === 'superadmin' ? (
        <SuperAdminStack />
      ) : user.role === 'admin' ? (
        <AdminStack />
      ) : (
        <StudentStack />
      )}
    </NavigationContainer>
  );
}
