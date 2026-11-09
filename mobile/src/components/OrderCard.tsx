import { Pressable, View } from "react-native";
import { Order } from "../types/order";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { StatusPill } from "./StatusPill";

const NEXT_STEP_BY_STATUS: Record<Order["status"], string> = {
  PROCESSING: "We’re preparing your order",
  COMPLETED: "Order complete",
  CANCELLED: "This order was cancelled",
};

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  /** Seller variant surfaces the customer's email — students never see it. */
  showCustomer?: boolean;
}

/** Shared order summary card (CLAUDE_DESIGN_SYSTEM.md §10.4) — reference,
 * date, item count, total, status, next-step, tap to view. Cover
 * thumbnails and fulfilment/payment-status fields aren't included since
 * `Order` doesn't carry that data today (no per-item cover snapshot, no
 * deliveryMethod/paymentStatus on the type) — add them here if that data
 * becomes available rather than special-casing screens. */
export function OrderCard({ order, onPress, showCustomer }: OrderCardProps) {
  const theme = useTheme();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <Card style={{ gap: theme.spacing.sm }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ gap: 2 }}>
            <AppText variant="bodyMedium">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </AppText>
            <AppText variant="caption">{date}</AppText>
          </View>
          <StatusPill status={order.status} />
        </View>

        {showCustomer && order.user ? (
          <AppText
            variant="label"
            style={{ color: theme.colors.textSecondary }}
          >
            {order.user.email}
          </AppText>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText
            variant="label"
            style={{ color: theme.colors.textSecondary }}
          >
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </AppText>
          <AppText variant="price">
            ₦{order.totalAmount.toLocaleString()}
          </AppText>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText variant="caption">
            {NEXT_STEP_BY_STATUS[order.status]}
          </AppText>
          <AppText
            variant="label"
            weight="semiBold"
            style={{ color: theme.colors.primary }}
          >
            View order
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}
