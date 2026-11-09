import { useMemo } from "react";
import { buildTheme, Theme } from "../theme";
import { useThemeStore } from "../store/themeStore";

// The one seam every screen consumes colors through — see design-system.md
// §6. Swapping `mode` here is all that's needed for light/dark to propagate
// app-wide, since no component reads raw hex values directly.
export function useTheme(): Theme {
  const mode = useThemeStore((s) => s.mode);
  return useMemo(() => buildTheme(mode), [mode]);
}
