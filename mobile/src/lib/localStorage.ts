import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_KEY = 'recentlyViewedBookIds';
const MAX_RECENTLY_VIEWED = 12;

/** Non-sensitive local-device caches (view history, later search history) —
 * kept separate from `secureStorage.ts`, which is for SecureStore-backed
 * sensitive values (tokens) with a small size budget. */
export const localStorage = {
  getRecentlyViewedBookIds: async (): Promise<string[]> => {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  recordBookViewed: async (bookId: string): Promise<void> => {
    const current = await localStorage.getRecentlyViewedBookIds();
    const next = [bookId, ...current.filter((id) => id !== bookId)].slice(0, MAX_RECENTLY_VIEWED);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  },

  clearRecentlyViewed: () => AsyncStorage.removeItem(RECENTLY_VIEWED_KEY),
};
