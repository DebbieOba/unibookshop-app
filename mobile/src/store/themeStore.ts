import { create } from "zustand";
import { ThemeMode } from "../theme";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Light is the default per project.md — RootNavigator overwrites this with
// the persisted choice (secureStorage) once hydration completes, gated
// behind the same floor as the splash animation so returning dark-mode
// users never see a light flash first.
export const useThemeStore = create<ThemeState>((set) => ({
  mode: "light",
  setMode: (mode) => set({ mode }),
}));
