import { View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";

interface AvatarProps {
  url?: string | null;
  fullName: string;
  size?: number;
}

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({ url, fullName, size = 48 }: AvatarProps) {
  const theme = useTheme();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryTint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText variant="sectionHeader" style={{ color: theme.colors.primary }}>
        {initialsOf(fullName)}
      </AppText>
    </View>
  );
}
