import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onRetry?: () => void;
}

export function ErrorState({
  message = "We couldn't load this right now.",
  icon = "cloud-offline-outline",
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.errorSubtle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={28} color={theme.colors.error} />
      </View>
      <AppText
        variant="body"
        style={{ color: theme.colors.textSecondary, textAlign: "center" }}
      >
        {message}
      </AppText>
      {onRetry ? (
        <Button label="Try again" variant="outline" onPress={onRetry} />
      ) : null}
    </View>
  );
}
