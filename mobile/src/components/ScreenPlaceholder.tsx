import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";

interface ScreenPlaceholderProps {
  title: string;
  subtitle?: string;
}

/** Scaffolding-only stand-in — screens replace this with real content. */
export function ScreenPlaceholder({ title, subtitle }: ScreenPlaceholderProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        padding: theme.spacing.xl,
      }}
    >
      <AppText variant="title">{title}</AppText>
      {subtitle ? (
        <AppText
          variant="body"
          style={{ color: theme.colors.textSecondary, textAlign: "center" }}
        >
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
