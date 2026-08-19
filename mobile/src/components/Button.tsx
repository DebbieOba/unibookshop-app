import { ActivityIndicator, Pressable, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

const HEIGHT_BY_SIZE: Record<ButtonSize, number> = { small: 36, medium: 48, large: 52 };
const FONT_VARIANT_BY_SIZE: Record<ButtonSize, 'label' | 'body' | 'sectionHeader'> = {
  small: 'label',
  medium: 'body',
  large: 'sectionHeader',
};

interface ButtonProps extends PressableProps {
  /** Omit for an icon-only button (requires `icon`). */
  label?: string;
  variant?: ButtonVariant;
  /** Which accent family `primary`/`outline`/`ghost`/`text` draw from — kept
   * separate from `variant` (CLAUDE_DESIGN_SYSTEM.md §10.1's variant list)
   * rather than conflated with it, per design-system.md §8. */
  tone?: 'student' | 'admin';
  size?: ButtonSize;
  disabled?: boolean;
  /** Leading icon; also renders alone (centered) when `label` is omitted. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shows a spinner in place of the label and forces disabled — every
   * button backed by an async mutation should pass its `.isPending`. */
  isLoading?: boolean;
  /** Label shown while `isLoading` is true, e.g. "Signing in…". Falls back
   * to `label` if omitted (spinner still shows either way). */
  loadingLabel?: string;
}

export function Button({
  label,
  variant = 'primary',
  tone = 'student',
  size = 'medium',
  disabled,
  icon,
  isLoading,
  loadingLabel,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || isLoading;
  const accent = tone === 'admin' ? theme.colors.adminAccent : theme.colors.primary;
  const isIconOnly = !label && !!icon;
  const height = HEIGHT_BY_SIZE[size];

  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let borderWidth = 0;
  let contentColor = theme.colors.textInverse;

  if (isDisabled) {
    backgroundColor = variant === 'outline' || variant === 'ghost' || variant === 'text' ? 'transparent' : theme.colors.surfaceAlt;
    borderColor = variant === 'outline' ? theme.colors.border : 'transparent';
    borderWidth = variant === 'outline' ? 1.5 : 0;
    contentColor = theme.colors.textDisabled;
  } else {
    switch (variant) {
      case 'primary':
        backgroundColor = accent;
        contentColor = theme.colors.textInverse;
        break;
      case 'secondary':
        backgroundColor = theme.colors.secondary;
        contentColor = theme.colors.textInverse;
        break;
      case 'destructive':
        backgroundColor = theme.colors.error;
        contentColor = theme.colors.textInverse;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderColor = accent;
        borderWidth = 1.5;
        contentColor = accent;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        contentColor = accent;
        break;
      case 'text':
        backgroundColor = 'transparent';
        contentColor = accent;
        break;
    }
  }

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          height: isIconOnly ? height : height,
          width: isIconOnly ? height : undefined,
          borderRadius: variant === 'text' ? theme.radii.input : theme.radii.button,
          backgroundColor,
          borderColor,
          borderWidth,
          paddingHorizontal: isIconOnly ? 0 : variant === 'text' ? theme.spacing.xs : theme.spacing.lg,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={contentColor} />
          {label ? (
            <AppText variant={FONT_VARIANT_BY_SIZE[size]} weight="semiBold" style={{ color: contentColor }}>
              {loadingLabel ?? label}
            </AppText>
          ) : null}
        </>
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'small' ? 16 : 20} color={contentColor} /> : null}
          {label ? (
            <AppText variant={FONT_VARIANT_BY_SIZE[size]} weight="semiBold" style={{ color: contentColor }}>
              {label}
            </AppText>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
