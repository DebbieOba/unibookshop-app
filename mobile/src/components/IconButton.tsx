import { Pressable, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface IconButtonProps extends PressableProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export function IconButton({ name, size = 24, color, style, ...rest }: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [
        {
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: rest.disabled ? 0.35 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      <Ionicons name={name} size={size} color={color ?? theme.colors.textPrimary} />
    </Pressable>
  );
}
