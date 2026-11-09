import * as SecureStore from "expo-secure-store";
import { ThemeMode } from "../theme";

const REFRESH_TOKEN_KEY = "refreshToken";
const ONBOARDING_SEEN_KEY = "onboardingSeen";
const THEME_MODE_KEY = "themeMode";

export const secureStorage = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  getOnboardingSeen: async () =>
    (await SecureStore.getItemAsync(ONBOARDING_SEEN_KEY)) === "1",
  setOnboardingSeen: () => SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, "1"),
  getThemeMode: async (): Promise<ThemeMode | null> => {
    const stored = await SecureStore.getItemAsync(THEME_MODE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  },
  setThemeMode: (mode: ThemeMode) =>
    SecureStore.setItemAsync(THEME_MODE_KEY, mode),
};
