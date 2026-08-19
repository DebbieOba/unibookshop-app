import { useEffect, useMemo, useState, useRef } from 'react';
import { FlatList, Pressable, ScrollView, Share, View, Modal, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useBook, useBooks } from '../../../hooks/useBooks';
import { useSetCartLine } from '../../../hooks/useCart';
import { useFavourites, useToggleFavourite } from '../../../hooks/useFavourites';
import { useBookRatings } from '../../../hooks/useRatings';
import { useRecordBookViewed } from '../../../hooks/useRecentlyViewed';
import { useToast } from '../../../hooks/useToast';
import { cloudinaryUrl } from '../../../lib/cloudinary';
import { BookCard, getBookPlaceholderCover } from '../../../components/BookCard';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { StatusPill } from '../../../components/StatusPill';
import { IconButton } from '../../../components/IconButton';
import { Skeleton } from '../../../components/Skeleton';
import { ErrorState } from '../../../components/ErrorState';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';

type Props = NativeStackScreenProps<StudentStackParamList, 'BookDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BookDetailsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const bookId = route.params.bookId;
  const book = useBook(bookId);
  const allBooks = useBooks({ page: 1, limit: 50 });
  const addToCart = useSetCartLine();
  const favourites = useFavourites();
  const toggleFavourite = useToggleFavourite();
  const ratings = useBookRatings(bookId);
  useRecordBookViewed(book.data ? bookId : undefined);
  
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const slideshowRef = useRef<FlatList>(null);
  const fullscreenSlideshowRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const isFavourited = (favourites.data ?? []).some((f) => f.bookId === bookId);
  const averageScore = ratings.data?.length
    ? ratings.data.reduce((sum, r) => sum + r.score, 0) / ratings.data.length
    : null;
  const inStock = book.data ? book.data.stockQuantity > 0 : false;

  const images = useMemo(() => {
    if (!book.data) return [];
    const cover = !book.data.coverUrl || book.data.coverUrl.includes('placehold.co')
      ? getBookPlaceholderCover(book.data.title ?? '', book.data.category?.name)
      : { uri: cloudinaryUrl(book.data.coverUrl ?? '', { width: 800 }) };

    // Only the real cover — no decorative stand-in images per book.
    return [{ id: 'cover', source: cover, label: 'Main Cover' }];
  }, [book.data]);

  const similarBooks = useMemo(() => {
    if (!book.data || !allBooks.data) return [];
    return allBooks.data.data.filter(
      (b) => b.categoryId === book.data?.categoryId && b.id !== bookId
    );
  }, [book.data, allBooks.data, bookId]);

  if (book.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + theme.spacing.md, paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
        <Skeleton height={320} style={{ borderRadius: 20 }} />
        <Skeleton height={32} width="80%" />
        <Skeleton height={20} width="50%" />
        <Skeleton height={120} />
      </View>
    );
  }

  if (book.isError || !book.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + theme.spacing.lg }}>
        <ErrorState onRetry={() => book.refetch()} />
      </View>
    );
  }

  const handleShare = () => {
    if (!book.data) return;
    void Share.share({
      message: `${book.data.title} by ${book.data.author} — ₦${book.data.price.toLocaleString()} on CURRICULA`,
    });
  };

  const compareAtPrice = book.data.compareAtPrice ?? null;
  const isOnSale = compareAtPrice !== null && compareAtPrice > book.data.price;
  const savingsAmount = isOnSale ? compareAtPrice! - book.data.price : 0;

  const handleOpenFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Top Hero Image Banner / Interactive Slideshow */}
        <View style={{ position: 'relative', width: '100%', aspectRatio: 1.1, backgroundColor: theme.colors.surfaceAlt }}>
          <FlatList
            ref={slideshowRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => handleOpenFullscreen(index)} style={{ width: SCREEN_WIDTH, height: '100%' }}>
                <Image
                  source={item.source}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </Pressable>
            )}
          />

          {/* Dots Indicator Overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {images.map((_, i) => (
              <View
                key={i}
                style={{
                  width: activeImageIndex === i ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: activeImageIndex === i ? theme.colors.primary : 'rgba(255,255,255,0.6)',
                }}
              />
            ))}
          </View>

          {/* Tap to zoom hint overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              right: theme.spacing.lg,
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="expand-outline" size={12} color="#FFFFFF" />
            <AppText variant="caption" style={{ color: '#FFFFFF', fontSize: 10 }}>Tap to zoom</AppText>
          </View>

          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: insets.top + 60,
              backgroundColor: 'rgba(0,0,0,0.15)',
            }}
          />
        </View>

        {/* Content Container */}
        <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
          
          {/* Main Title / Favourites Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title" style={{ fontSize: 22, lineHeight: 28 }}>
                {book.data.title}
              </AppText>
              <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
                {book.data.author}
              </AppText>
            </View>
            <Pressable
              onPress={() => toggleFavourite.mutate({ bookId, isFavourited })}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.surfaceAlt,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons
                name={isFavourited ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavourited ? theme.colors.error : theme.colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Redesigned Premium Price Board */}
          <View
            style={{
              backgroundColor: theme.colors.surfaceAlt,
              padding: theme.spacing.md,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs }}>
                  <AppText variant="priceLarge" style={{ fontSize: 24, color: theme.colors.primary }}>
                    ₦{book.data.price.toLocaleString()}
                  </AppText>
                  {isOnSale ? (
                    <AppText variant="caption" style={{ textDecorationLine: 'line-through', color: theme.colors.textTertiary, fontSize: 13 }}>
                      ₦{compareAtPrice!.toLocaleString()}
                    </AppText>
                  ) : null}
                </View>
                {isOnSale ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={{ backgroundColor: theme.colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: 9 }}>
                        SAVE ₦{savingsAmount.toLocaleString()}
                      </AppText>
                    </View>
                    <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                      Curricula Student Discount
                    </AppText>
                  </View>
                ) : null}
              </View>
              <StatusPill status={inStock ? 'COMPLETED' : 'CANCELLED'} label={inStock ? 'In Stock' : 'Out of Stock'} />
            </View>
          </View>

          {/* Redesigned Specifications Grid */}
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="sectionHeader">Book Details & Specs</AppText>
            <Card style={{ padding: 0, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
              
              {/* Row 1: Department */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }}>
                  <Ionicons name="library-outline" size={18} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Department</AppText>
                  <AppText variant="bodyMedium" weight="bold">{book.data.category?.name ?? 'General academic'}</AppText>
                </View>
              </View>

              {/* Row 2: Academic Level */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.gold + '10', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }}>
                  <Ionicons name="school-outline" size={18} color={theme.colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Required Class Level</AppText>
                  <AppText variant="bodyMedium" weight="bold">{book.data.attributes?.level ?? 'Core Syllabus'}</AppText>
                </View>
              </View>

              {/* Row 3: Stock availability */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#34C75915', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }}>
                  <Ionicons name="cube-outline" size={18} color="#34C759" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Availability</AppText>
                  <AppText variant="bodyMedium" weight="bold">{book.data.stockQuantity > 0 ? `${book.data.stockQuantity} books in stock` : 'Temporarily Sold Out'}</AppText>
                </View>
              </View>

              {/* Row 4: Format */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }}>
                  <Ionicons name="bookmark-outline" size={18} color={theme.colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Print Format</AppText>
                  <AppText variant="bodyMedium" weight="bold">Official Paperback edition</AppText>
                </View>
              </View>

            </Card>
          </View>

          {/* Description Block */}
          {book.data.description ? (
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="sectionHeader">About this book</AppText>
              <AppText
                variant="body"
                numberOfLines={descriptionExpanded ? undefined : 4}
                style={{ color: theme.colors.textSecondary, lineHeight: 20 }}
              >
                {book.data.description}
              </AppText>
              {book.data.description.length > 180 ? (
                <Pressable onPress={() => setDescriptionExpanded((v) => !v)} style={{ paddingVertical: 4 }}>
                  <AppText variant="bodyMedium" weight="bold" style={{ color: theme.colors.primary }}>
                    {descriptionExpanded ? 'Show less' : 'Read more'}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Ratings & Reviews Selector */}
          {book.data && (
            <Pressable
              onPress={() => navigation.navigate('Reviews', { bookId, bookTitle: book.data!.title })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme.colors.surfaceAlt,
                padding: theme.spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <View style={{ backgroundColor: theme.colors.gold + '15', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="star" size={18} color={theme.colors.gold} />
                </View>
                <View>
                  <AppText variant="bodyMedium" weight="bold">
                    {ratings.data?.length ? `${averageScore?.toFixed(1)} out of 5 stars` : 'No reviews yet'}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                    {ratings.data?.length ? `Based on ${ratings.data.length} student reviews` : 'Be the first to review this book'}
                  </AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </Pressable>
          )}

          {/* "More books like this" horizontal carousel */}
          {similarBooks.length > 0 ? (
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
              <AppText variant="sectionHeader">More books like this</AppText>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={similarBooks}
                keyExtractor={(item) => 'sim-' + item.id}
                contentContainerStyle={{ gap: theme.spacing.md }}
                renderItem={({ item }) => {
                  const isFav = (favourites.data ?? []).some((f) => f.book.id === item.id);
                  return (
                    <BookCard
                      book={item}
                      isFavourited={isFav}
                      onFavouritePress={() => toggleFavourite.mutate({ bookId: item.id, isFavourited: isFav })}
                      onPress={() => navigation.push('BookDetails', { bookId: item.id })}
                    />
                  );
                }}
              />
            </View>
          ) : null}

        </View>
      </ScrollView>

      {/* Floating Header Overlay */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + theme.spacing.xs,
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => ({
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="share-social-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      {/* Sticky Premium Bottom Checkout Action Drawer */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: Math.max(theme.spacing.lg, 24),
          flexDirection: 'row',
          gap: theme.spacing.md,
          alignItems: 'center',
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 5,
        }}
      >
        <Button
          style={{ flex: 1, borderRadius: 999 }}
          label="Add to Cart"
          disabled={!inStock}
          isLoading={addToCart.isPending}
          loadingLabel="Adding…"
          icon="cart-outline"
          onPress={() =>
            addToCart.mutate(
              { bookId, quantity: 1 },
              {
                onSuccess: () => toast('Added to cart'),
                onError: () => toast('Could not add to cart', 'error'),
              },
            )
          }
        />
        <Pressable
          onPress={() => navigation.navigate('Cart')}
          style={({ pressed }) => ({
            backgroundColor: theme.colors.surfaceAlt,
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="cart-outline" size={22} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      {/* Interactive Fullscreen Slideshow Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center' }}>
          
          {/* Header row with close button */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + theme.spacing.md,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 12,
            }}
          >
            <AppText variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
              Preview ({fullscreenIndex + 1} / {images.length})
            </AppText>
            <Pressable
              onPress={() => setFullscreenVisible(false)}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Fullscreen FlatList image pager */}
          <FlatList
            ref={fullscreenSlideshowRef}
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={fullscreenIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullscreenIndex(index);
            }}
            keyExtractor={(item) => 'fs-' + item.id}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={item.source}
                  style={{ width: '100%', aspectRatio: 1, maxHeight: 500 }}
                  contentFit="contain"
                />
              </View>
            )}
          />

          {/* Fullscreen dots indicator */}
          <View
            style={{
              position: 'absolute',
              bottom: insets.bottom + theme.spacing.xl,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {images.map((_, i) => (
              <View
                key={i}
                style={{
                  width: fullscreenIndex === i ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: fullscreenIndex === i ? theme.colors.primary : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </View>

        </View>
      </Modal>
    </View>
  );
}
