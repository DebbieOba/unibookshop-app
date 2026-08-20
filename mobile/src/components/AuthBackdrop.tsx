import { ReactNode } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

const BG_SOURCE = require('../../assets/bg.png');
const LOGO_SOURCE = require('../../assets/logo.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CORNER_RADIUS = 60;

interface AuthBackdropProps {
  children: ReactNode;
  heightFraction?: number;
}

export function AuthBackdrop({ children, heightFraction = 0.45 }: AuthBackdropProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const photoHeight = SCREEN_HEIGHT * heightFraction;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
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
            marginTop: -CORNER_RADIUS / 2,
            paddingBottom: insets.bottom + theme.spacing.xl,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
