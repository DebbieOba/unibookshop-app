import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../../../api/auth.api";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";

const POLL_INTERVAL_MS = 5000;

/**
 * Rendered standalone by RootNavigator for any authenticated,
 * not-yet-approved session — covers both PENDING (polls for a decision) and
 * REJECTED (static message, no point polling). See project.md's Approval
 * Flow and frontend-architecture.md §5.
 */
export function PendingApprovalScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const isPending = user?.accountState === "PENDING";

  const status = useQuery({
    queryKey: ["auth", "pending-status"],
    queryFn: () => authApi.me().then((res) => res.data),
    enabled: isPending,
    refetchInterval: isPending ? POLL_INTERVAL_MS : false,
  });

  useEffect(() => {
    if (!status.data || !accessToken) return;
    if (status.data.accountState !== user?.accountState) {
      setSession(accessToken, status.data);
    }
  }, [status.data, user?.accountState, accessToken, setSession]);

  if (!user) return null;

  if (user.accountState === "REJECTED") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <Ionicons
          name="close-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <AppText variant="title" style={{ textAlign: "center" }}>
          Application Rejected
        </AppText>
        <AppText
          variant="body"
          style={{ color: theme.colors.textSecondary, textAlign: "center" }}
        >
          Your account application was not approved. Contact seller for details.
        </AppText>
        <Button label="Back to Login" onPress={() => clearSession()} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
      }}
    >
      <Ionicons name="time-outline" size={48} color={theme.colors.warning} />
      <AppText variant="title" style={{ textAlign: "center" }}>
        Pending Approval
      </AppText>
      <AppText
        variant="body"
        style={{ color: theme.colors.textSecondary, textAlign: "center" }}
      >
        Your account is awaiting seller approval. This screen will update
        automatically.
      </AppText>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}
