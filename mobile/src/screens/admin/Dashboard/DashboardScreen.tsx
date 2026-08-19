import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminStackParamList, AdminTabParamList } from '../../../navigation/types';
import { useDashboard, useInventory } from '../../../hooks/useDashboard';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { useTheme } from '../../../hooks/useTheme';
import { useProfile } from '../../../hooks/useProfile';
import { OrderStatus } from '../../../types/order';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { Avatar } from '../../../components/Avatar';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'Dashboard'>,
  NativeStackScreenProps<AdminStackParamList>
>;

const STATUS_BAR_COLOR: Record<OrderStatus, 'primary' | 'warning' | 'error'> = {
  PROCESSING: 'warning',
  COMPLETED: 'primary',
  CANCELLED: 'error',
};

const QUICK_ACTIONS: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  go: (nav: Props['navigation']) => void;
}> = [
  { label: 'Add book', icon: 'add-circle-outline', go: (nav) => nav.navigate('AdminTabs', { screen: 'Books' }) },
  { label: 'Send broadcast', icon: 'megaphone-outline', go: (nav) => nav.navigate('AdminNotifications') },
  { label: 'Manage departments', icon: 'git-branch-outline', go: (nav) => nav.navigate('Departments') },
  { label: 'Review inventory', icon: 'cube-outline', go: (nav) => nav.navigate('AdminTabs', { screen: 'Inventory' }) },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const dashboard = useDashboard();
  const inventory = useInventory();
  const orders = useAdminOrders();

  const firstName = useMemo(() => profile.data?.fullName?.trim().split(/\s+/)[0], [profile.data?.fullName]);

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = { PROCESSING: 0, COMPLETED: 0, CANCELLED: 0 };
    (orders.data ?? []).forEach((o) => {
      counts[o.status] += 1;
    });
    return counts;
  }, [orders.data]);
  const totalOrdersForBar = statusCounts.PROCESSING + statusCounts.COMPLETED + statusCounts.CANCELLED;

  const refetchAll = () => {
    void dashboard.refetch();
    void inventory.refetch();
    void orders.refetch();
    void profile.refetch();
  };

  if (dashboard.isLoading || profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.sm, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={80} />
        <Skeleton height={160} />
      </View>
    );
  }
  if (dashboard.isError || profile.isError || !dashboard.data) return <ErrorState onRetry={refetchAll} />;

  const lowStock = inventory.data?.lowStock ?? 0;
  const alerts = [
    dashboard.data.pendingApprovals > 0
      ? { message: `${dashboard.data.pendingApprovals} ${dashboard.data.pendingApprovals === 1 ? 'account needs' : 'accounts need'} review`, screen: 'Approvals' as const }
      : null,
    lowStock > 0
      ? { message: `${lowStock} ${lowStock === 1 ? 'book is' : 'books are'} low in stock`, screen: null }
      : null,
  ].filter((a): a is { message: string; screen: 'Approvals' | null } => !!a);

  const tiles = [
    { label: 'Total Users', value: dashboard.data.totalUsers, icon: 'people-outline' as const, color: theme.colors.primary, tint: theme.colors.primaryTint },
    { label: 'Pending Approvals', value: dashboard.data.pendingApprovals, icon: 'shield-checkmark-outline' as const, color: theme.colors.warning, tint: theme.colors.warningSubtle },
    { label: 'Total Books', value: dashboard.data.totalBooks, icon: 'book-outline' as const, color: theme.colors.success, tint: theme.colors.successSubtle },
    { label: 'Total Orders', value: dashboard.data.totalOrders, icon: 'receipt-outline' as const, color: theme.colors.info, tint: theme.colors.infoSubtle },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header Greeting Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
          <Avatar url={profile.data?.avatarUrl} fullName={profile.data?.fullName ?? ''} size={38} />
          <View style={{ gap: 1, flex: 1 }}>
            <AppText variant="body" weight="bold" style={{ color: theme.colors.textPrimary }}>
              Admin Dashboard
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 10 }} numberOfLines={1}>
              {greeting()}, {firstName ?? 'Admin'}
            </AppText>
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate('AdminNotifications')} style={{ padding: theme.spacing.sm }}>
          <Ionicons name="megaphone-outline" size={22} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isFetching || profile.isFetching}
            onRefresh={refetchAll}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Alerts Section */}
        {alerts.map((alert) => (
          <Card
            key={alert.message}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.warningSubtle, borderColor: theme.colors.warning, borderWidth: 1 }}
          >
            <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
            <AppText variant="bodyMedium" style={{ flex: 1, color: theme.colors.warning }}>
              {alert.message}
            </AppText>
            {alert.screen ? (
              <Button label="Review" tone="admin" variant="outline" size="small" onPress={() => navigation.navigate(alert.screen!)} />
            ) : null}
          </Card>
        ))}

        {/* KPI Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          {tiles.map((tile) => (
            <Card key={tile.label} style={{ width: '47%', gap: theme.spacing.sm, padding: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: tile.tint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={tile.icon} size={16} color={tile.color} />
                </View>
              </View>
              <View style={{ gap: 2 }}>
                <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {tile.label}
                </AppText>
                <AppText variant="heading2" style={{ color: theme.colors.textPrimary }}>
                  {tile.value}
                </AppText>
              </View>
            </Card>
          ))}
        </View>

        {/* Order Status Bar */}
        {totalOrdersForBar > 0 ? (
          <Card style={{ gap: theme.spacing.sm }}>
            <AppText variant="sectionHeader">Order status overview</AppText>
            <View style={{ flexDirection: 'row', height: 10, borderRadius: theme.radii.pill, overflow: 'hidden' }}>
              {(Object.keys(statusCounts) as OrderStatus[]).map((status) =>
                statusCounts[status] > 0 ? (
                  <View
                    key={status}
                    style={{ width: `${(statusCounts[status] / totalOrdersForBar) * 100}%`, backgroundColor: theme.colors[STATUS_BAR_COLOR[status]] }}
                  />
                ) : null,
              )}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
              {(Object.keys(statusCounts) as OrderStatus[]).map((status) => (
                <View key={status} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors[STATUS_BAR_COLOR[status]] }} />
                  <AppText variant="caption">
                    {status[0] + status.slice(1).toLowerCase()} ({statusCounts[status]})
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Quick Actions */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Quick actions</AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => action.go(navigation)}
                style={({ pressed }) => ({
                  width: 80,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Card style={{ width: '100%', height: 105, alignItems: 'center', justifyContent: 'flex-start', gap: theme.spacing.xs, paddingVertical: theme.spacing.sm, paddingHorizontal: 4 }}>
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
                    <Ionicons name={action.icon} size={18} color={theme.colors.primary} />
                  </View>
                  <AppText variant="caption" style={{ textAlign: 'center', color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 10 }} numberOfLines={2}>
                    {action.label}
                  </AppText>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="sectionHeader">Recent Orders</AppText>
            <Button label="View all orders" tone="admin" variant="text" onPress={() => navigation.navigate('AdminTabs', { screen: 'Orders' })} />
          </View>
          {dashboard.data.recentOrders.length === 0 ? (
            <EmptyState icon="receipt-outline" message="No orders yet." />
          ) : (
            dashboard.data.recentOrders.slice(0, 5).map((order) => (
              <Pressable key={order.id} onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="bodyMedium">Order #{order.id.slice(0, 8).toUpperCase()}</AppText>
                    <AppText variant="caption">{new Date(order.createdAt).toLocaleDateString()}</AppText>
                  </View>
                  <AppText variant="bodyMedium" style={{ marginRight: theme.spacing.xs }}>₦{order.totalAmount.toLocaleString()}</AppText>
                  <StatusPill status={order.status as OrderStatus} />
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
