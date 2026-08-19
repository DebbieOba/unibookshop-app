// Single design-tokens file — see design-system.md. Light mode is the
// default; dark mode is a full second palette selected via themeStore
// (see hooks/useTheme.ts).
//
// Token set follows CurriculaMobileDesignSystem.md's §6 palette. Existing key
// names are kept (never renamed — every screen already references them);
// values are updated to the new doc's hex codes, and a couple of genuinely
// new concepts (`surfaceRaised`) are added additively rather than reusing an
// existing key for two different meanings. `adminAccent`/`adminTint` are kept
// (this doc no longer calls out a separate admin colorway) but now mirror
// `gold`/`goldTint` rather than diverging from them, since nothing in this
// doc asks for two different accent families anymore.
//
// Per this session's decision: dark mode's primary accent moves from the
// previous ice-blue family to an indigo/purple tint matching light mode's
// hue, per the new doc's palette (`darkTheme.primary: '#AAA8FF'`).

export type ThemeMode = 'light' | 'dark';

export interface ColorTokens {
  background: string;
  backgroundGradientEnd: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  divider: string;
  primary: string;
  primaryHover: string;
  primaryDark: string;
  primaryTint: string;
  secondary: string;
  secondaryTint: string;
  gold: string;
  goldDeep: string;
  goldTint: string;
  adminAccent: string;
  adminTint: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  error: string;
  errorSubtle: string;
  info: string;
  infoSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textDisabled: string;
  overlay: string;
}

const darkColors: ColorTokens = {
  background: '#09111F',
  backgroundGradientEnd: '#101C38',
  surface: '#111C2E',
  surfaceAlt: '#162338', // doc's `surfaceSubtle` — inputs, nested cards, list-item backgrounds
  surfaceRaised: '#192840', // doc's `surfaceRaised` — elevated cards distinct from base surface
  border: '#293A53',
  borderStrong: '#3A4D68',
  divider: '#223249',
  primary: '#AAA8FF',
  primaryHover: '#8F8CED', // mobile has no real hover state — reuses the pressed value rather than inventing one
  primaryDark: '#8F8CED', // doc's `primaryPressed`
  primaryTint: '#2B2953', // doc's `primarySoft`
  secondary: '#6BBCED',
  secondaryTint: '#18394D', // doc's `secondarySoft`
  gold: '#D9B36C', // doc's `accent`
  goldDeep: '#8A6A2F', // pressed/shadow state — not specified by the doc, kept from the prior palette
  goldTint: '#3A3020', // doc's `accentSoft`
  adminAccent: '#D9B36C', // mirrors `gold` — this doc doesn't call out a separate admin colorway
  adminTint: '#3A3020',
  success: '#61CA9A',
  successSubtle: '#153A2B',
  warning: '#EFB956',
  warningSubtle: '#3D3017',
  error: '#EF838B', // doc's `danger`
  errorSubtle: '#421F25', // doc's `dangerSoft`
  info: '#7EB1FF',
  infoSubtle: '#183258',
  textPrimary: '#F4F7FB',
  textSecondary: '#B6C1D1',
  textTertiary: '#8998AC',
  textInverse: '#111827',
  textDisabled: '#647288',
  overlay: 'rgba(0, 0, 0, 0.68)',
};

const lightColors: ColorTokens = {
  background: '#F6F8FC',
  backgroundGradientEnd: '#EAEFF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F3F8', // doc's `surfaceSubtle`
  surfaceRaised: '#FFFFFF', // doc's `surfaceRaised`
  border: '#DCE2EA',
  borderStrong: '#C8D0DB',
  divider: '#E9EDF2',
  primary: '#5856D6',
  primaryHover: '#4542BC', // reuses the pressed value — see dark-mode note above
  primaryDark: '#4542BC', // doc's `primaryPressed`
  primaryTint: '#ECEBFF', // doc's `primarySoft`
  secondary: '#268BC5',
  secondaryTint: '#E7F5FC', // doc's `secondarySoft`
  gold: '#D99A14', // doc's `accent`
  goldDeep: '#B37E10', // pressed/shadow state — a darkened shade of `accent`, not specified by the doc
  goldTint: '#FFF6DD', // doc's `accentSoft`
  adminAccent: '#D99A14', // mirrors `gold` — see dark-mode note above
  adminTint: '#FFF6DD',
  success: '#18865B',
  successSubtle: '#E7F7F0',
  warning: '#B56F00',
  warningSubtle: '#FFF3D8',
  error: '#C33D48', // doc's `danger`
  errorSubtle: '#FDEBED', // doc's `dangerSoft`
  info: '#276DCE',
  infoSubtle: '#EAF2FD',
  textPrimary: '#151A24',
  textSecondary: '#596579',
  textTertiary: '#7E8899',
  textInverse: '#FFFFFF',
  textDisabled: '#A8B0BD',
  overlay: 'rgba(15, 23, 42, 0.52)',
};

// DM Sans (loaded in App.tsx via @expo-google-fonts/dm-sans). Custom fonts
// are selected by exact family name per weight, not synthesized from a
// `fontWeight` number the way system fonts are — so every place that needs
// bold/medium emphasis must go through one of these four family names
// (via AppText's `weight` prop), never a bare inline `fontWeight` override.
export const fontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

// 12-variant scale per CurriculaMobileDesignSystem.md §6.2 (display/heading1-3/
// sectionTitle/bodyLarge/body/bodyMedium/label/caption/priceLarge/price).
// Color stays baked into each variant (unlike the doc's color-less table) —
// AppText already resolves the right color per variant today, and splitting
// it out would be a pure refactor with no visual effect.
function createTypography(colors: ColorTokens) {
  return {
    display: { fontSize: 32, lineHeight: 39, fontFamily: fontFamily.bold, color: colors.textPrimary },
    title: { fontSize: 28, lineHeight: 34, fontFamily: fontFamily.bold, color: colors.textPrimary }, // doc's `heading1`
    heading2: { fontSize: 24, lineHeight: 30, fontFamily: fontFamily.bold, color: colors.textPrimary },
    heading3: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
    sectionHeader: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.semiBold, color: colors.textPrimary }, // doc's `sectionTitle`
    bodyLarge: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular, color: colors.textPrimary },
    body: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textPrimary },
    bodyMedium: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.medium, color: colors.textPrimary },
    label: { fontSize: 12, lineHeight: 17, fontFamily: fontFamily.medium, color: colors.textSecondary },
    caption: { fontSize: 11, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.textTertiary },
    priceLarge: { fontSize: 22, lineHeight: 28, fontFamily: fontFamily.bold, color: colors.primary },
    price: { fontSize: 17, lineHeight: 22, fontFamily: fontFamily.bold, color: colors.primary },
  };
}

// `base`/`section` are additive — the doc's scale is finer than the existing
// one (xs/sm/md/lg/xl/xxl); no existing key is renamed or removed.
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 48,
} as const;

const radii = {
  input: 10,
  button: 10,
  card: 14,
  sheet: 24, // bottom-sheet top corners
  extraLarge: 24, // doc's `extraLarge` — same value as `sheet`, kept as a distinct name for non-sheet uses
  pill: 999,
} as const;

export interface Theme {
  colors: ColorTokens;
  typography: ReturnType<typeof createTypography>;
  spacing: typeof spacing;
  radii: typeof radii;
}

export function buildTheme(mode: ThemeMode): Theme {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return { colors, typography: createTypography(colors), spacing, radii };
}
