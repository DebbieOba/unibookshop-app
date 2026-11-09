import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";

export function Badge({ count }: { count: number }) {
  const theme = useTheme();
  if (count <= 0) return null;

  return (
    <View
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.error,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      <AppText
        variant="label"
        style={{ color: theme.colors.textInverse, fontSize: 10 }}
      >
        {count > 99 ? "99+" : count}
      </AppText>
    </View>
  );
}
