import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { AppText } from "./AppText";

/** Persistent app-wide banner shown while offline (BookdeckMobileDesignSystem.md
 * §22) — mounted once near the navigation root, not per-screen. Cached content
 * stays visible underneath; this only announces the state so mutations that
 * would silently fail (payment) can be disabled elsewhere. */
export function OfflineBanner() {
  const theme = useTheme();
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.warningSubtle,
      }}
    >
      <Ionicons
        name="cloud-offline-outline"
        size={14}
        color={theme.colors.warning}
      />
      <AppText
        variant="label"
        weight="semiBold"
        style={{ color: theme.colors.warning }}
      >
        You're offline — showing saved content
      </AppText>
    </View>
  );
}
