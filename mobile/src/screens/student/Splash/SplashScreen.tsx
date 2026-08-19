import { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { AppText } from '../../../components/AppText';

const LOGO_SOURCE = require('../../../../assets/logo.png');

/**
 * Doubles as both the boot screen (shown while RootNavigator hydrates the
 * session — see RootNavigator.tsx's `isHydrating` gate) and the branded
 * intro animation: logo scales/fades in on a soft glow (so the transparent
 * mark reads as part of the scene, not a sticker on a flat color), then the
 * "CURRICULA" wordmark fades in below it with a gold accent underline —
 * the one deliberate blue+gold touch on this screen (design-system.md §2).
 */
export function SplashScreen() {
  const theme = useTheme();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const accentWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // No artificial hold here — RootNavigator unmounts this as soon as
    // bootstrapping (session hydration, theme load) actually finishes, which
    // in practice is long enough for this reveal to play through.
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(accentWidth, { toValue: 1, duration: 600, useNativeDriver: false }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, glowOpacity, wordmarkOpacity, accentWidth]);

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.backgroundGradientEnd]}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: 110,
            opacity: glowOpacity,
          }}
        >
          <LinearGradient
            colors={[theme.colors.primaryTint, 'transparent']}
            style={{ flex: 1, borderRadius: 110 }}
          />
        </Animated.View>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image source={LOGO_SOURCE} style={{ width: 150, height: 150 }} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: wordmarkOpacity, alignItems: 'center' }}>
        <AppText variant="title" style={{ letterSpacing: 4, color: theme.colors.textPrimary }}>
          CURRICULA
        </AppText>
        <Animated.View
          style={{
            marginTop: theme.spacing.xs,
            height: 3,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.gold,
            width: accentWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 56] }),
          }}
        />
      </Animated.View>
    </LinearGradient>
  );
}
