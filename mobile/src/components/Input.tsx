import { ReactNode, useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  /** Rendered at the trailing edge — e.g. a show/hide-password toggle. */
  trailingAction?: ReactNode;
}

/** One consistent boxed input used across the app — label above, optional
 * leading icon, helper/error text below. Per CLAUDE_DESIGN_SYSTEM.md §10.2:
 * "do not use bottom-border-only inputs on some screens and boxed inputs on
 * others" — this is the one shape, everywhere. */
export function Input({
  label,
  helperText,
  error,
  disabled,
  leadingIcon,
  trailingAction,
  style,
  multiline,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
          {label}
        </AppText>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          height: multiline ? undefined : 48,
          minHeight: multiline ? 96 : undefined,
          borderRadius: multiline ? 16 : 999,
          backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: error
            ? theme.colors.error
            : focused
            ? theme.colors.primary
            : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: multiline ? theme.spacing.sm : 0,
          gap: theme.spacing.sm,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leadingIcon ? (
          <Ionicons name={leadingIcon} size={18} color={theme.colors.textTertiary} />
        ) : null}
        <TextInput
          editable={!disabled}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : undefined}
          placeholderTextColor={theme.colors.textTertiary}
          style={[{ flex: 1, color: theme.colors.textPrimary, height: multiline ? undefined : '100%' }, style]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {trailingAction ? <View>{trailingAction}</View> : null}
      </View>

      {error ? (
        <AppText variant="label" style={{ color: theme.colors.error }}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="label" style={{ color: theme.colors.textTertiary }}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

/** For a trailing icon button (e.g. password show/hide) inside `Input`'s
 * `trailingAction` slot. */
export function InputTrailingIcon({
  name,
  onPress,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Ionicons name={name} size={18} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
