import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useCart } from '../../../hooks/useCart';
import { useAddresses } from '../../../hooks/useAddresses';
import { useCheckout, useVerifyPayment } from '../../../hooks/useOrders';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useProfile } from '../../../hooks/useProfile';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import { DeliveryMethod, PaymentProvider } from '../../../types/order';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';

type Props = NativeStackScreenProps<StudentStackParamList, 'Checkout'>;

const PAYMENT_CALLBACK_PREFIX = 'curricula://payment-callback';

const DELIVERY_OPTIONS: Array<{ value: DeliveryMethod; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'PICKUP', label: 'Pickup on campus', description: 'Collect from the school bookstore desk', icon: 'storefront-outline' },
  { value: 'DELIVERY', label: 'Deliver to an address', description: 'Shipped to your saved student address', icon: 'bicycle-outline' },
];

// Flutterwave is built end-to-end on the backend (see backend-architecture.md
// §11) but isn't offered here since it has no configured API key yet — only
// Paystack is currently live. Re-add once FLUTTERWAVE_SECRET_KEY is set.
const PAYMENT_OPTIONS: Array<{ value: PaymentProvider; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'PAYSTACK', label: 'Paystack checkout', icon: 'card-outline' },
];

function SelectableRow({
  selected,
  onPress,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primary + '05' : theme.colors.surface,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: selected ? theme.colors.primary + '10' : theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color={selected ? theme.colors.primary : theme.colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" weight="bold" style={{ color: selected ? theme.colors.primary : theme.colors.textPrimary }}>{title}</AppText>
          {subtitle ? (
            <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected ? theme.colors.primary : theme.colors.textTertiary}
        />
      </View>
    </Pressable>
  );
}

export function CheckoutScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const cart = useCart();
  const addresses = useAddresses();
  const checkout = useCheckout();
  const verifyPayment = useVerifyPayment();
  const profile = useProfile();
  const email = useAuthStore((s) => s.user?.email);
  const { isOffline } = useNetworkStatus();

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('PICKUP');
  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('PAYSTACK');
  const callbackHandled = useRef(false);

  const closePaymentWebView = () => {
    setRedirectUrl(null);
    setOrderId(null);
    callbackHandled.current = false;
  };

  if (redirectUrl && orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <WebView
          source={{ uri: redirectUrl }}
          onNavigationStateChange={(state) => {
            if (callbackHandled.current || !state.url.startsWith(PAYMENT_CALLBACK_PREFIX)) return;
            callbackHandled.current = true;
            const confirmedOrderId = orderId;
            // Ask the provider directly rather than waiting on its webhook —
            // a LAN-only dev backend can never receive one, and even in
            // production this resolves the order the moment the user
            // returns instead of depending purely on webhook timing.
            verifyPayment.mutate(confirmedOrderId, {
              onSettled: () => {
                setRedirectUrl(null);
                navigation.replace('OrderConfirmation', { orderId: confirmedOrderId });
              },
            });
          }}
        />
        <Pressable
          onPress={closePaymentWebView}
          style={{
            position: 'absolute',
            top: insets.top + theme.spacing.sm,
            left: theme.spacing.md,
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
        {verifyPayment.isPending ? (
          <View
            style={{
              position: 'absolute',
              bottom: insets.bottom + theme.spacing.lg,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: 999,
              paddingVertical: theme.spacing.sm,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <AppText variant="caption" weight="bold">Confirming payment…</AppText>
          </View>
        ) : null}
      </View>
    );
  }

  const requiresAddress = deliveryMethod === 'DELIVERY';
  const canSubmit = (!requiresAddress || !!addressId) && !isOffline;

  const onPay = () => {
    checkout.mutate(
      { deliveryMethod, paymentProvider, addressId: requiresAddress ? addressId : undefined },
      {
        onSuccess: (res) => {
          setOrderId(res.data.orderId);
          setRedirectUrl(res.data.redirectUrl);
        },
        onError: (error: any) => {
          toast(error?.response?.data?.message ?? 'Checkout failed. Please try again.', 'error');
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, gap: theme.spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Info Card */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="sectionHeader">Contact Details</AppText>
            {profile.data?.fullName ? <AppText variant="bodyMedium" weight="bold">{profile.data.fullName}</AppText> : null}
            {email ? (
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                {email}
              </AppText>
            ) : null}
            {profile.data?.phone ? (
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                {profile.data.phone}
              </AppText>
            ) : null}
          </View>
          <Button label="Edit" variant="text" onPress={() => navigation.navigate('EditProfile')} />
        </Card>

        {/* Delivery Method Selection */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Delivery Method</AppText>
          {DELIVERY_OPTIONS.map((option) => (
            <SelectableRow
              key={option.value}
              icon={option.icon}
              title={option.label}
              subtitle={option.description}
              selected={deliveryMethod === option.value}
              onPress={() => setDeliveryMethod(option.value)}
            />
          ))}
        </View>

        {/* Conditional Address Selection */}
        {requiresAddress ? (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="sectionHeader">Delivery Address</AppText>
            {(addresses.data ?? []).map((address) => (
              <SelectableRow
                key={address.id}
                icon="location-outline"
                title={address.label || `${address.street}, ${address.city}`}
                subtitle={`${address.street}, ${address.city}, ${address.state}`}
                selected={addressId === address.id}
                onPress={() => setAddressId(address.id)}
              />
            ))}
            <Button
              label="Add a new address"
              variant="text"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('Addresses')}
              style={{ alignSelf: 'flex-start' }}
            />
          </View>
        ) : null}

        {/* Payment Method Selection */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Payment Gateway</AppText>
          <View style={{ gap: theme.spacing.sm }}>
            {PAYMENT_OPTIONS.map((option) => (
              <SelectableRow
                key={option.value}
                icon={option.icon}
                title={option.label}
                selected={paymentProvider === option.value}
                onPress={() => setPaymentProvider(option.value)}
              />
            ))}
          </View>
        </View>

        {/* Pricing Summary Card */}
        <Card style={{ gap: theme.spacing.xs, backgroundColor: theme.colors.surfaceAlt }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
              Syllabus booklets in bag
            </AppText>
            <AppText variant="bodyMedium" weight="bold">{cart.data?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0}</AppText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="sectionHeader">Total Amount</AppText>
            <AppText variant="priceLarge" style={{ color: theme.colors.primary }}>₦{(cart.data?.total ?? 0).toLocaleString()}</AppText>
          </View>
        </Card>

        {isOffline ? (
          <AppText variant="label" style={{ color: theme.colors.error, textAlign: 'center', fontSize: 11 }}>
            You're offline — payment processing is disabled.
          </AppText>
        ) : null}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button
            style={{ flex: 1, borderRadius: 999 }}
            label="Back"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
          <Button
            style={{ flex: 2, borderRadius: 999 }}
            label={isOffline ? "Can't pay while offline" : 'Complete Payment'}
            isLoading={checkout.isPending}
            loadingLabel="Initiating transaction…"
            disabled={!canSubmit}
            onPress={onPay}
          />
        </View>
      </ScrollView>
    </View>
  );
}
