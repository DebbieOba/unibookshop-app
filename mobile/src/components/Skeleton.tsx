import { View, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SkeletonProps extends ViewProps {
  width?: number | `${number}%`;
  height?: number;
}

/** A single reusable shape, composed per screen (list row / grid tile / detail block). */
export function Skeleton({ width = '100%', height = 16, style, ...rest }: SkeletonProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: theme.radii.input,
          backgroundColor: theme.colors.surfaceAlt,
        },
        style,
      ]}
      {...rest}
    />
  );
}
