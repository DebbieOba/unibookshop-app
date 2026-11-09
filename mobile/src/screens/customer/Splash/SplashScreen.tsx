import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../hooks/useTheme";
import { warmupServer } from "../../../api/client";

const LOGO_SOURCE = require("../../../../assets/BOOKDECK.png");

/**
 * Doubles as both the boot screen (shown while RootNavigator hydrates the
 * session — see RootNavigator.tsx's `isHydrating` gate) and the branded
 * intro animation: logo scales/fades in on a soft glow (so the transparent
 * mark reads as part of the scene, not a sticker on a flat color), then the
 * "BOOKDECK" wordmark fades in below it with a gold accent underline —
 * the one deliberate blue+gold touch on this screen (design-system.md §2).
 */
export function SplashScreen() {
  const theme = useTheme();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ping the server as early as possible so Render's free-tier instance
    // wakes up before the user reaches the login/register screen.
    warmupServer();

    // No artificial hold here — RootNavigator unmounts this as soon as
    // bootstrapping (session hydration, theme load) actually finishes, which
    // in practice is long enough for this reveal to play through.
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, glowOpacity]);

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.backgroundGradientEnd]}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 110,
            opacity: glowOpacity,
          }}
        >
          <LinearGradient
            colors={[theme.colors.primaryTint, "transparent"]}
            style={{ flex: 1, borderRadius: 110 }}
          />
        </Animated.View>
        <Animated.View
          style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
        >
          <Image
            source={LOGO_SOURCE}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
