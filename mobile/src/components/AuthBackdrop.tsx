import { ReactNode } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

const BG_SOURCE = require('../../assets/bg.png');
const LOGO_SOURCE = require('../../assets/logo.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// A modest, clearly-visible curve confined to the top-left corner only —
// the sheet is flush with the photo/sheet split everywhere else. Capped
// deliberately below the sheet's own top-left content padding (spacing.xl,
// 24px) so the curve never clips the first line of form content — the
// corner's cutoff radius from (0,0) grows with CORNER_RADIUS, and needs to
// stay clear of wherever text actually starts.
const CORNER_RADIUS = 60;

interface AuthBackdropProps {
  children: ReactNode;
  /** Fraction of the screen the photo occupies — the rest is the sheet. */
  heightFraction?: number;
}

/**
 * Shared photo-header + rounded-sheet shell for the auth screens (Login,
 * SignUp): a full-bleed, untinted photo (no gradient wash — the photo needs
 * to actually be visible), capped by a single top-left corner curve — flush
 * with the sheet everywhere else, per the reference.
 */
export function AuthBackdrop({ children, heightFraction = 0.45 }: AuthBackdropProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const photoHeight = SCREEN_HEIGHT * heightFraction;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />

      <View style={{ height: photoHeight }}>
        <Image source={BG_SOURCE} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: insets.top + theme.spacing.md,
            left: theme.spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            backgroundColor: 'rgba(255,255,255,0.94)',
            borderRadius: theme.radii.pill,
            paddingVertical: 6,
            paddingHorizontal: theme.spacing.sm,
          }}
        >
          <Image source={LOGO_SOURCE} style={{ width: 22, height: 22 }} resizeMode="contain" />
          <AppText variant="sectionHeader" weight="bold" style={{ color: '#000000', letterSpacing: 2 }}>
            CURRICULA
          </AppText>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: CORNER_RADIUS,
          borderTopRightRadius: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
