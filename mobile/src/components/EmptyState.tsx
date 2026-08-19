import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';

interface EmptyStateProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  /** Optional supporting line below `message` — e.g. a suggestion, not just
   * a restatement (CLAUDE_DESIGN_SYSTEM.md §18: "No books found" / "Try
   * another title, author or course code"). */
  subtext?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ type = 'info', message, subtext, icon, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  const typeStyles = useMemo(() => {
    switch (type) {
      case 'success':
        return {
          defaultIcon: 'checkmark-circle-outline' as const,
          color: '#34C759',
          bgColor: 'rgba(52, 199, 89, 0.1)',
        };
      case 'error':
        return {
          defaultIcon: 'alert-circle-outline' as const,
          color: theme.colors.error,
          bgColor: theme.colors.error + '15',
        };
      case 'warning':
        return {
          defaultIcon: 'warning-outline' as const,
          color: theme.colors.warning,
          bgColor: theme.colors.warning + '15',
        };
      case 'info':
      default:
        return {
          defaultIcon: 'information-circle-outline' as const,
          color: theme.colors.primary,
          bgColor: theme.colors.primary + '15',
        };
    }
  }, [type, theme]);

  const resolvedIcon = icon ?? typeStyles.defaultIcon;

  return (
    <View style={{ alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: typeStyles.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={resolvedIcon} size={32} color={typeStyles.color} />
      </View>
      <View style={{ gap: theme.spacing.xs, alignItems: 'center' }}>
        <AppText variant="body" weight="bold" style={{ color: theme.colors.textPrimary, textAlign: 'center' }}>
          {message}
        </AppText>
        {subtext ? (
          <AppText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 280 }}>
            {subtext}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          style={{
            borderRadius: 999,
            marginTop: theme.spacing.xs,
          }}
        />
      ) : null}
    </View>
  );
}
