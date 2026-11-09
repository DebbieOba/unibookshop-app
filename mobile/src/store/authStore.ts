import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  role: "customer" | "seller" | "staff" | "superadmin";
  accountState: "PENDING" | "APPROVED" | "REJECTED" | "RESTRICTED";
  bookshopId?: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  /** True for the one session-lifetime transition right after a fresh
   * signup — gates showing CompleteProfileScreen once. Set explicitly by
   * SignUpScreen (not inside useLogin()) so ordinary returning-user logins
   * are never affected. Never persisted — session-lifetime only, matching
   * the same tradeoff this project already accepted for the equivalent
   * `needsPreferences` flag it replaces. */
  needsOnboarding: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  setHydrating: (value: boolean) => void;
  setNeedsOnboarding: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrating: true,
  needsOnboarding: false,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () =>
    set({ accessToken: null, user: null, needsOnboarding: false }),
  setHydrating: (value) => set({ isHydrating: value }),
  setNeedsOnboarding: (value) => set({ needsOnboarding: value }),
}));
