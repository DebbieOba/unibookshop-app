import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { useCart } from "../hooks/useCart";
import { useNotifications } from "../hooks/useNotifications";
import { IconButton } from "./IconButton";
import { Badge } from "./Badge";

/** Cart + notifications bell, each with a count badge — the header-icon
 * entry points CLAUDE_DESIGN_SYSTEM.md's customer IA calls for instead of
 * making Cart/Notifications their own tabs. Shared by Home/Store so the two
 * screens that need it don't each hand-roll the badge math. */
export function CustomerHeaderActions({
  onCartPress,
  onNotificationsPress,
}: {
  onCartPress: () => void;
  onNotificationsPress: () => void;
}) {
  const theme = useTheme();
  const cart = useCart();
  const notifications = useNotifications();

  const cartCount =
    cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const unreadCount = notifications.data?.filter((n) => !n.readAt).length ?? 0;

  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
      <View>
        <IconButton name="cart-outline" onPress={onCartPress} />
        <View style={{ position: "absolute", top: 2, right: 2 }}>
          <Badge count={cartCount} />
        </View>
      </View>
      <View>
        <IconButton
          name="notifications-outline"
          onPress={onNotificationsPress}
        />
        <View style={{ position: "absolute", top: 2, right: 2 }}>
          <Badge count={unreadCount} />
        </View>
      </View>
    </View>
  );
}
