import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useOrder } from '../../../hooks/useOrders';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { Skeleton } from '../../../components/Skeleton';

type Props = NativeStackScreenProps<StudentStackParamList, 'OrderConfirmation'>;

export function OrderConfirmationScreen({ route, navigation }: Props) {
  const theme = useTheme();
  // Polls (bounded to 30s) while the order is still PROCESSING — covers
  // webhook lag between payment and order status update. The checkout
  // WebView also calls verify-payment directly on return (CheckoutScreen.tsx),
  // so this is a bounded fallback, not the primary resolution path.
  const order = useOrder(route.params.orderId, { poll: true });

  // Mirrors useOrder's own poll timeout — after this, the bounded polling
  // above will have stopped, so this switches the copy to something honest
  // rather than silently continuing to say "this only takes a moment."
  const [pollTimedOut, setPollTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPollTimedOut(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (order.isLoading || !order.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Skeleton height={120} />
        <Skeleton height={200} />
      </View>
    );
  }

  const data = order.data;
  const isProcessing = data.status === 'PROCESSING';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg, alignItems: 'center' }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: isProcessing ? theme.colors.warningSubtle : theme.colors.successSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: theme.spacing.lg,
        }}
      >
        <Ionicons
          name={isProcessing ? 'time-outline' : 'checkmark-circle'}
          size={36}
          color={isProcessing ? theme.colors.warning : theme.colors.success}
        />
      </View>

      <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
        <AppText variant="title">{isProcessing ? 'Order placed!' : 'Order confirmed'}</AppText>
        <AppText variant="body" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          {isProcessing
            ? pollTimedOut
              ? "Still confirming — this is taking longer than usual. Check My Orders in a few minutes."
              : "We're confirming your payment — this only takes a moment."
            : 'Thanks for your order.'}
        </AppText>
      </View>

      <Card style={{ width: '100%', gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="bodyMedium">Order #{data.id.slice(0, 8).toUpperCase()}</AppText>
          <StatusPill status={data.status} />
        </View>
        {data.items.map((item) => (
          <View key={item.bookId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="body" style={{ flex: 1 }}>
              {item.titleSnapshot} × {item.quantity}
            </AppText>
            <AppText variant="bodyMedium">₦{(item.unitPrice * item.quantity).toLocaleString()}</AppText>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs }}>
          <AppText variant="sectionHeader">Total</AppText>
          <AppText variant="priceLarge">₦{data.totalAmount.toLocaleString()}</AppText>
        </View>
      </Card>

      <Button
        label="View order"
        style={{ width: '100%' }}
        onPress={() => navigation.replace('OrderDetails', { orderId: data.id })}
      />
      <Button
        label="Continue shopping"
        variant="text"
        style={{ width: '100%' }}
        onPress={() => navigation.navigate('StudentTabs')}
      />
    </ScrollView>
  );
}
