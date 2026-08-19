import { memo } from 'react';
import { DimensionValue, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { cloudinaryUrl } from '../lib/cloudinary';
import { Book } from '../types/catalogue';
import { AppText } from './AppText';
import { StatusPill } from './StatusPill';
import { IconButton } from './IconButton';
import { RoleGate } from './RoleGate';

const COVER_IMAGES: Record<string, any> = {
  engineering: require('../../assets/covers/engineering.jpg'),
  computer_science: require('../../assets/covers/computer_science.jpg'),
  business: require('../../assets/covers/business.jpg'),
  science: require('../../assets/covers/science.jpg'),
  law: require('../../assets/covers/law.jpg'),
  arts: require('../../assets/covers/arts.jpg'),
};

export function getBookPlaceholderCover(title: string, categoryName?: string) {
  const t = title.toLowerCase();
  const c = categoryName?.toLowerCase() ?? '';
  if (t.includes('computer') || t.includes('software') || c.includes('computer')) return COVER_IMAGES.computer_science;
  if (t.includes('engineer') || c.includes('engineer')) return COVER_IMAGES.engineering;
  if (t.includes('business') || t.includes('manage') || c.includes('business') || c.includes('manage')) return COVER_IMAGES.business;
  if (t.includes('law') || c.includes('law')) return COVER_IMAGES.law;
  if (t.includes('art') || c.includes('art')) return COVER_IMAGES.arts;
  return COVER_IMAGES.science; // Default/Fallback
}

interface BookCardProps {
  book: Book;
  onPress: () => void;
  /** Both only rendered for admins (RoleGate) — see frontend-architecture.md §9. */
  onEditPress?: () => void;
  onDeletePress?: () => void;
  width?: DimensionValue;
  isFavourited?: boolean;
  onFavouritePress?: () => void;
}

export const BookCard = memo(function BookCard({ book, onPress, onEditPress, onDeletePress, width, isFavourited, onFavouritePress }: BookCardProps) {
  const theme = useTheme();

  const isPlaceholder = !book.coverUrl || book.coverUrl.includes('placehold.co');
  const source = isPlaceholder
    ? getBookPlaceholderCover(book.title ?? '', book.category?.name)
    : { uri: cloudinaryUrl(book.coverUrl ?? '', { width: 300 }) };

  const isSmall = typeof width === 'number' && width < 120;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: width ?? 156,
        backgroundColor: theme.colors.surface,
        borderRadius: isSmall ? 12 : 16,
        padding: isSmall ? 6 : theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 2 / 3,
          borderRadius: isSmall ? 8 : 12,
          backgroundColor: theme.colors.surfaceAlt,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image
          source={source}
          style={{
            width: '100%',
            height: '100%',
            opacity: book.stockQuantity > 0 ? 1 : 0.45,
          }}
          contentFit="cover"
        />

        {onFavouritePress ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onFavouritePress();
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              top: theme.spacing.xs,
              left: theme.spacing.xs,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              width: isSmall ? 22 : 30,
              height: isSmall ? 22 : 30,
              borderRadius: isSmall ? 11 : 15,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            })}
          >
            <Ionicons
              name={isFavourited ? 'heart' : 'heart-outline'}
              size={isSmall ? 12 : 16}
              color={isFavourited ? theme.colors.error : theme.colors.textSecondary}
            />
          </Pressable>
        ) : null}

        {book.stockQuantity === 0 ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing.xs,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.error,
                paddingHorizontal: isSmall ? 4 : theme.spacing.sm,
                paddingVertical: isSmall ? 2 : 4,
                borderRadius: theme.radii.pill,
              }}
            >
              <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: isSmall ? 7 : 9 }}>
                SOLD OUT
              </AppText>
            </View>
          </View>
        ) : null}

        {onEditPress || onDeletePress ? (
          <RoleGate allow={['admin']}>
            <View
              style={{
                position: 'absolute',
                top: theme.spacing.xs,
                right: theme.spacing.xs,
                flexDirection: 'row',
                gap: theme.spacing.xs,
              }}
            >
              {onEditPress ? (
                <IconButton
                  name="pencil"
                  size={isSmall ? 10 : 14}
                  color="#FFFFFF"
                  onPress={onEditPress}
                  style={{ backgroundColor: theme.colors.adminAccent, borderRadius: theme.radii.pill, minHeight: isSmall ? 20 : 28, minWidth: isSmall ? 20 : 28 }}
                />
              ) : null}
              {onDeletePress ? (
                <IconButton
                  name="trash"
                  size={isSmall ? 10 : 14}
                  color="#FFFFFF"
                  onPress={onDeletePress}
                  style={{ backgroundColor: theme.colors.error, borderRadius: theme.radii.pill, minHeight: isSmall ? 20 : 28, minWidth: isSmall ? 20 : 28 }}
                />
              ) : null}
            </View>
          </RoleGate>
        ) : null}
      </View>

      <View style={{ marginTop: isSmall ? 4 : theme.spacing.sm, gap: 1 }}>
        <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: isSmall ? 8 : 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {book.category?.name ?? 'Syllabus'}
        </AppText>
        <AppText variant="bodyMedium" weight="bold" numberOfLines={1} style={{ color: theme.colors.textPrimary, fontSize: isSmall ? 11 : 14 }}>
          {book.title}
        </AppText>
        <AppText variant="caption" numberOfLines={1} style={{ color: theme.colors.textSecondary, fontSize: isSmall ? 9 : 12 }}>
          {book.author}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: isSmall ? 2 : theme.spacing.xs }}>
          <AppText variant="body" weight="bold" style={{ color: theme.colors.primary, fontSize: isSmall ? 10 : 14 }}>
            ₦{book.price.toLocaleString()}
          </AppText>
          {isSmall ? (
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: book.stockQuantity === 0 ? theme.colors.error : book.stockQuantity < 5 ? theme.colors.warning : theme.colors.primary }} />
          ) : book.stockQuantity === 0 ? (
            <View style={{ backgroundColor: theme.colors.error + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
              <AppText variant="caption" weight="bold" style={{ color: theme.colors.error, fontSize: 8 }}>
                Out
              </AppText>
            </View>
          ) : book.stockQuantity < 5 ? (
            <View style={{ backgroundColor: theme.colors.warning + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
              <AppText variant="caption" weight="bold" style={{ color: theme.colors.warning, fontSize: 8 }}>
                Low
              </AppText>
            </View>
          ) : (
            <View style={{ backgroundColor: theme.colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
              <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: 8 }}>
                In Stock
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});
