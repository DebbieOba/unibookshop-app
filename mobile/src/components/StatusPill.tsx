import { View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

export type OrderStatus = 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

const COLOR_BY_STATUS = {
  PROCESSING: 'warning',
  COMPLETED: 'primary',
  CANCELLED: 'error',
} as const;

// Never render a raw backend enum (CLAUDE_DESIGN_SYSTEM.md §10.5) — this is
// the one place that maps OrderStatus to user-facing copy, so every screen
// that shows an order status gets the friendly label for free.
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PROCESSING: 'Preparing order',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

interface StatusPillProps {
  status: OrderStatus;
  /** Override the displayed text while keeping the status's color mapping
   * (e.g. the Book Details stock badge reuses COMPLETED/CANCELLED colors
   * for "In Stock"/"Out of Stock" — see design-system.md §7). Defaults to
   * the friendly order-status label when omitted. */
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const theme = useTheme();
  const color = theme.colors[COLOR_BY_STATUS[status]];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        backgroundColor: color + '22',
      }}
    >
      <AppText variant="label" weight="semiBold" style={{ color }}>
        {label ?? ORDER_STATUS_LABELS[status]}
      </AppText>
    </View>
  );
}
