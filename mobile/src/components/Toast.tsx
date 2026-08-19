import { useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useToastStore } from '../store/toastStore';
import { AppText } from './AppText';

const AUTO_DISMISS_MS = 2500;

/** Mounted once at the app root — see App.tsx. */
export function Toast() {
  const theme = useTheme();
  const { message, variant, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 32,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          backgroundColor: variant === 'error' ? theme.colors.error : theme.colors.surface,
          borderWidth: 1,
          borderColor: variant === 'error' ? theme.colors.error : theme.colors.border,
        }}
      >
        <AppText variant="body" style={{ color: theme.colors.textPrimary }}>
          {message}
        </AppText>
      </View>
    </View>
  );
}
