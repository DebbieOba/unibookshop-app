import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface AvatarPickerProps {
  uri?: string | null;
  onPress: () => void;
  size?: number;
}

/** Single tappable circular avatar with a WhatsApp/Instagram-style edit
 * badge overlaid at the bottom-right — replaces a separate "Add a photo"
 * text button below a plain circle. Empty state shows a person glyph
 * rather than a blank circle. */
export function AvatarPicker({ uri, onPress, size = 112 }: AvatarPickerProps) {
  const theme = useTheme();
  const badgeSize = Math.round(size * 0.32);

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 2,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Ionicons name="person" size={size * 0.45} color={theme.colors.textTertiary} />
        )}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: theme.colors.primary,
          borderWidth: 3,
          borderColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="camera" size={badgeSize * 0.55} color={theme.colors.background} />
      </View>
    </Pressable>
  );
}
