import { Linking } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import { usersApi } from '../api/users.api';

// Remote push (expo-notifications) was removed from Expo Go in SDK 53 — it
// only works in an EAS dev client or a real build (frontend-architecture.md
// §10 already calls this out as a requirement, not a nice-to-have).
//
// Critically, expo-notifications throws as an IMPORT-time side effect on
// Android in Expo Go (a bundled .fx.js file calls addPushTokenListener()
// unconditionally, which throws if it detects Expo Go) — not just when you
// call one of its functions. So a static `import * as Notifications from
// 'expo-notifications'` at the top of this file crashes the app on load
// regardless of any isExpoGo guard around the code that *uses* it. The
// import itself has to be conditional, via `await import(...)` inside the
// same guard, so the module is never required at all in Expo Go.
//
// `appOwnership` (deprecated for general use, but exact for this check) is
// only 'expo' inside Expo Go itself — `executionEnvironment === StoreClient`
// is NOT precise enough, since it also matches a real dev client.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * Registers this device's FCM token with the backend — called on login.
 * See frontend-architecture.md §10: direct FCM registration (EAS dev client
 * required), not Expo's push relay, to match the backend's firebase-admin
 * integration.
 */
export async function registerPushToken(): Promise<void> {
  if (isExpoGo) return;

  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const { data: token } = await Notifications.getDevicePushTokenAsync();
    await usersApi.setPushToken(token);
  } catch {
    // Push isn't available in this environment (e.g. simulator without APNs,
    // or a build predating the dev client) — not fatal, just skip it.
  }
}

/**
 * Converts a notification tap into a deep-link URL and hands it to
 * `Linking.openURL`, which RootNavigator's `linking` config then routes —
 * same mechanism as tapping a link in an email. Falls back to the
 * notification feed when the payload doesn't carry a more specific target
 * (e.g. broadcasts/approvals). Call once from App.tsx.
 */
export function subscribeToNotificationTaps(): () => void {
  if (isExpoGo) return () => {};

  let unsubscribe = () => {};

  import('expo-notifications')
    .then((Notifications) => {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as { orderId?: string } | undefined;
        const url = data?.orderId ? `curricula://order/${data.orderId}` : 'curricula://notifications';
        Linking.openURL(url).catch(() => {
          // Not on a screen that can handle it right now (e.g. still on the
          // auth stack) — dropping the tap is preferable to crashing.
        });
      });
      unsubscribe = () => subscription.remove();
    })
    .catch(() => {
      // Not available in this environment — nothing to subscribe to.
    });

  return () => unsubscribe();
}
