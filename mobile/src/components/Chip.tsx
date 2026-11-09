import { Pressable, PressableProps } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";

interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
  variant?: "customer" | "seller";
}

export function Chip({
  label,
  selected = false,
  variant = "customer",
  style,
  ...rest
}: ChipProps) {
  const theme = useTheme();
  const accent =
    variant === "seller" ? theme.colors.adminAccent : theme.colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          backgroundColor: selected ? accent : theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: selected ? accent : theme.colors.border,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        typeof style === "function" ? undefined : style,
      ]}
      {...rest}
    >
      <AppText
        variant="label"
        style={{
          color: selected
            ? theme.colors.background
            : theme.colors.textSecondary,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
