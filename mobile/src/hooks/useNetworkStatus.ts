import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/** True once we've positively detected the device is offline — starts
 * `false` (assume online) so a slow first NetInfo callback never flashes an
 * offline banner on a perfectly good connection. */
export function useNetworkStatus(): { isOffline: boolean } {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  return { isOffline };
}
