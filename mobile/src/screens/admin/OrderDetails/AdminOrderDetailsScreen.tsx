import { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useAdminOrder, useUpdateOrderStatus } from '../../../hooks/useAdminOrders';
import { useToast } from '../../../hooks/useToast';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { ConfirmSheet } from '../../../components/ConfirmSheet';
import { ReasonSheet } from '../../../components/ReasonSheet';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';
import { IconButton } from '../../../components/IconButton';

type Props = NativeStackScreenProps<AdminStackParamList, 'OrderDetails'>;

export function AdminOrderDetailsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const order = useAdminOrder(route.params.orderId);
  const updateStatus = useUpdateOrderStatus();
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (order.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.sm, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={120} />
        <Skeleton height={200} />
      </View>
    );
  }
  if (order.isError || !order.data) return <ErrorState onRetry={() => order.refetch()} />;

  const data = order.data;
  const date = new Date(data.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  const confirmCancel = (reason: string) => {
    updateStatus.mutate(
      { id: data.id, status: 'CANCELLED', reason },
      { onSuccess: () => toast('Order cancelled'), onError: () => toast('Could not cancel order') },
    );
    setCancelling(false);
  };

  const confirmComplete = () => {
    updateStatus.mutate(
      { id: data.id, status: 'COMPLETED' },
      { onSuccess: () => toast('Order marked completed'), onError: () => toast('Could not complete order') },
    );
    setCompleting(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Header Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }}
      >
        <IconButton
          name="arrow-back"
          size={22}
          color={theme.colors.textPrimary}
          onPress={() => navigation.goBack()}
          style={{ marginRight: theme.spacing.sm }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="title" style={{ fontSize: 20 }}>Order Details</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            View order status, items, customer, and manage fulfillment
          </AppText>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 60 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <AppText variant="bodyMedium" weight="bold">Order #{data.id.slice(0, 8).toUpperCase()}</AppText>
            <AppText variant="caption">{date}</AppText>
          </View>
          <StatusPill status={data.status} />
        </View>

        {data.user?.email ? (
          <Card style={{ gap: theme.spacing.xs }}>
            <AppText variant="label" style={{ color: theme.colors.textSecondary }}>
              Customer
            </AppText>
            <AppText variant="bodyMedium">{data.user.email}</AppText>
          </Card>
        ) : null}

        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Items</AppText>
          {data.items.map((item) => (
            <View key={item.bookId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="body" style={{ flex: 1 }}>
                {item.titleSnapshot} × {item.quantity}
              </AppText>
              <AppText variant="bodyMedium">₦{(item.unitPrice * item.quantity).toLocaleString()}</AppText>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: theme.spacing.sm }}>
            <AppText variant="sectionHeader">Total</AppText>
            <AppText variant="priceLarge">₦{data.totalAmount.toLocaleString()}</AppText>
          </View>
        </Card>

        {data.status === 'PROCESSING' ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Mark completed"
                tone="admin"
                disabled={updateStatus.isPending}
                onPress={() => setCompleting(true)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel order"
                variant="destructive"
                disabled={updateStatus.isPending}
                onPress={() => setCancelling(true)}
              />
            </View>
          </View>
        ) : null}

        <ReasonSheet
          visible={cancelling}
          title="Cancel this order?"
          message="Reserved stock will be released and the customer notified."
          reasonLabel="Reason for cancellation"
          confirmLabel="Cancel order"
          destructive
          isConfirming={updateStatus.isPending}
          onConfirm={confirmCancel}
          onCancel={() => setCancelling(false)}
        />

        <ConfirmSheet
          visible={completing}
          title="Mark this order completed?"
          message="Use this for orders fulfilled outside the normal payment flow (e.g. cash on pickup)."
          confirmLabel="Mark completed"
          isConfirming={updateStatus.isPending}
          onConfirm={confirmComplete}
          onCancel={() => setCompleting(false)}
        />
      </ScrollView>
    </View>
  );
}
