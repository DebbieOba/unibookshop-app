import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useMarkAllRead, useNotifications } from '../../../hooks/useNotifications';
import { NotificationRecipient } from '../../../types/notification';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Chip } from '../../../components/Chip';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';

type NotificationType = NotificationRecipient['notification']['type'];

const ICON_BY_TYPE: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  ORDER_UPDATE: 'receipt-outline',
  APPROVAL: 'checkmark-circle-outline',
  BROADCAST: 'megaphone-outline',
  NEW_ARRIVAL: 'sparkles-outline',
};

type FilterValue = 'all' | 'orders' | 'books' | 'account';
const FILTERS: Array<{ label: string; value: FilterValue; types?: NotificationType[] }> = [
  { label: 'All', value: 'all' },
  { label: 'Orders', value: 'orders', types: ['ORDER_UPDATE'] },
  { label: 'Books', value: 'books', types: ['NEW_ARRIVAL'] },
  { label: 'Account', value: 'account', types: ['APPROVAL', 'BROADCAST'] },
];

type Group = 'Today' | 'This week' | 'Earlier';

function groupFor(createdAt: string): Group {
  const date = new Date(createdAt);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  if (date >= weekAgo) return 'This week';
  return 'Earlier';
}

export function NotificationsScreen() {
  const theme = useTheme();
  const notifications = useNotifications();
  const markAllRead = useMarkAllRead();
  const [filter, setFilter] = useState<FilterValue>('all');

  const sections = useMemo(() => {
    const activeFilter = FILTERS.find((f) => f.value === filter);
    const filtered = (notifications.data ?? []).filter(
      (item) => !activeFilter?.types || activeFilter.types.includes(item.notification.type),
    );
    const groups: Record<Group, NotificationRecipient[]> = { Today: [], 'This week': [], Earlier: [] };
    filtered.forEach((item) => groups[groupFor(item.createdAt)].push(item));
    return (['Today', 'This week', 'Earlier'] as Group[])
      .filter((g) => groups[g].length > 0)
      .map((g) => ({ title: g, data: groups[g] }));
  }, [notifications.data, filter]);

  if (notifications.isLoading) return <Skeleton height={200} />;
  if (notifications.isError) return <ErrorState onRetry={() => notifications.refetch()} />;

  const flatData = sections.flatMap((s) => [{ type: 'header' as const, title: s.title }, ...s.data.map((item) => ({ type: 'item' as const, item }))]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="title">Notifications</AppText>
        <Button label="Mark all read" variant="text" onPress={() => markAllRead.mutate()} />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginVertical: theme.spacing.md }}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </View>

      <FlatList
        data={flatData}
        keyExtractor={(entry, index) => (entry.type === 'header' ? `header-${entry.title}` : entry.item.id) + index}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.md }}
        refreshControl={
          <RefreshControl refreshing={notifications.isFetching && !notifications.isLoading} onRefresh={() => notifications.refetch()} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            message={filter === 'all' ? 'No notifications yet.' : 'No notifications in this category.'}
            subtext="Order updates and announcements will show up here."
          />
        }
        renderItem={({ item: entry }) =>
          entry.type === 'header' ? (
            <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>
              {entry.title.toUpperCase()}
            </AppText>
          ) : (
            <Card style={{ flexDirection: 'row', gap: theme.spacing.sm, opacity: entry.item.readAt ? 0.6 : 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.primaryTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={ICON_BY_TYPE[entry.item.notification.type]} size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <AppText variant="bodyMedium" style={{ flex: 1 }}>
                    {entry.item.notification.title}
                  </AppText>
                  {!entry.item.readAt ? (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
                  ) : null}
                </View>
                <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
                  {entry.item.notification.body}
                </AppText>
              </View>
            </Card>
          )
        }
      />
    </View>
  );
}
