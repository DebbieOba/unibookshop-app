import { useEffect } from "react";
import { Appearance, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { RootNavigator } from "./navigation/RootNavigator";
import { Toast } from "./components/Toast";
import { OfflineBanner } from "./components/OfflineBanner";
import { subscribeToNotificationTaps } from "./lib/push";
import { useThemeStore } from "./store/themeStore";

const queryClient = new QueryClient();

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => subscribeToNotificationTaps(), []);

  // Keeps native chrome (keyboard appearance, etc.) in sync with our own
  // light/dark choice — requires app.json's userInterfaceStyle: "automatic".
  useEffect(() => {
    Appearance.setColorScheme(mode);
  }, [mode]);

  // Every AppText render reads theme.typography, which now hardcodes DM Sans
  // font family names — nothing can render correctly until these resolve.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <View style={{ flex: 1 }}>
          <OfflineBanner />
          <View style={{ flex: 1 }}>
            <RootNavigator />
          </View>
        </View>
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
