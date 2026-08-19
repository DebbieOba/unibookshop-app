import { Text, TextProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fontFamily } from '../theme';

export type AppTextVariant =
  | 'display'
  | 'title'
  | 'heading2'
  | 'heading3'
  | 'sectionHeader'
  | 'bodyLarge'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'priceLarge'
  | 'price';
export type AppTextWeight = keyof typeof fontFamily;

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  /** Overrides the variant's default DM Sans weight — use this instead of a
   * bare `fontWeight` style, which custom fonts can't synthesize. */
  weight?: AppTextWeight;
}

export function AppText({ variant = 'body', weight, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const weightOverride = weight ? { fontFamily: fontFamily[weight] } : null;
  return <Text style={[theme.typography[variant] as object, weightOverride, style]} {...rest} />;
}
