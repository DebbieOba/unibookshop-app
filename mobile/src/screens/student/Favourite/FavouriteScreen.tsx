import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentTabParamList, StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useFavourites, useToggleFavourite } from '../../../hooks/useFavourites';
import { AppText } from '../../../components/AppText';
import { BookCard } from '../../../components/BookCard';
import { SearchBar } from '../../../components/SearchBar';
import { IconButton } from '../../../components/IconButton';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabParamList, 'Favourites'>,
  NativeStackScreenProps<StudentStackParamList>
>;

const SORT_OPTIONS = [
  { label: 'Title (A-Z)', value: 'titleAsc' },
  { label: 'Title (Z-A)', value: 'titleDesc' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
];

export function FavouriteScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const favourites = useFavourites();
  const toggleFavourite = useToggleFavourite();

  const [search, setSearch] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Active filter state
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('titleAsc');

  // Draft state for bottom sheet
  const [draftInStockOnly, setDraftInStockOnly] = useState(false);
  const [draftSortBy, setDraftSortBy] = useState('titleAsc');

  const filteredAndSortedData = useMemo(() => {
    let list = [...(favourites.data ?? [])];

    // 1. Apply Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.book.title.toLowerCase().includes(q) ||
          item.book.author.toLowerCase().includes(q) ||
          (item.book.category?.name ?? '').toLowerCase().includes(q)
      );
    }

    // 2. Apply Stock filter
    if (inStockOnly) {
      list = list.filter((item) => item.book.stockQuantity > 0);
    }

    // 3. Apply Sorting
    list.sort((a, b) => {
      if (sortBy === 'titleAsc') return a.book.title.localeCompare(b.book.title);
      if (sortBy === 'titleDesc') return b.book.title.localeCompare(a.book.title);
      if (sortBy === 'priceAsc') return a.book.price - b.book.price;
      if (sortBy === 'priceDesc') return b.book.price - a.book.price;
      return 0;
    });

    return list;
  }, [favourites.data, search, inStockOnly, sortBy]);

  const openFilterSheet = () => {
    setDraftInStockOnly(inStockOnly);
    setDraftSortBy(sortBy);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setInStockOnly(draftInStockOnly);
    setSortBy(draftSortBy);
    setFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftInStockOnly(false);
    setDraftSortBy('titleAsc');
    setInStockOnly(false);
    setSortBy('titleAsc');
    setFilterSheetOpen(false);
  };

  const isFiltering = inStockOnly || sortBy !== 'titleAsc';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}>
      
      {/* Header Info */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <AppText variant="title">Favourites</AppText>
        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
          Manage your saved textbooks & exam booklets
        </AppText>
      </View>

      {/* Search and Filters Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search saved textbooks..."
          />
        </View>
        <IconButton
          name="options-outline"
          size={22}
          color="#FFFFFF"
          style={{
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
            minHeight: 48,
            minWidth: 48,
          }}
          onPress={openFilterSheet}
        />
      </View>

      {favourites.isLoading ? (
        <View style={{ gap: 8, marginTop: theme.spacing.md }}>
          {/* Row 1 */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={{ flex: 1, gap: 6 }}>
                <Skeleton height={130} style={{ borderRadius: 10 }} />
                <Skeleton height={11} style={{ borderRadius: 5, width: '80%' }} />
                <Skeleton height={10} width={50} style={{ borderRadius: 5 }} />
              </View>
            ))}
          </View>
          {/* Row 2 */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={{ flex: 1, gap: 6 }}>
                <Skeleton height={130} style={{ borderRadius: 10 }} />
                <Skeleton height={11} style={{ borderRadius: 5, width: '70%' }} />
                <Skeleton height={10} width={50} style={{ borderRadius: 5 }} />
              </View>
            ))}
          </View>
        </View>
      ) : favourites.isError ? (
        <ErrorState onRetry={() => favourites.refetch()} />
      ) : (
        <FlatList
          data={filteredAndSortedData}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={favourites.isFetching && !favourites.isLoading}
              onRefresh={() => favourites.refetch()}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              type={search || isFiltering ? 'warning' : 'info'}
              icon="heart-outline"
              message={search || isFiltering ? 'No matching books' : 'No favourites yet'}
              subtext={search || isFiltering ? 'Try adjusting your search filters.' : 'Tap the heart icon on any syllabus book to save it here.'}
            />
          }
          renderItem={({ item }) => (
            <BookCard
              book={item.book}
              width={104}
              isFavourited={true}
              onFavouritePress={() => toggleFavourite.mutate({ bookId: item.book.id, isFavourited: true })}
              onPress={() => navigation.navigate('BookDetails', { bookId: item.book.id })}
            />
          )}
        />
      )}

      {/* Advanced Custom Filter Sheet */}
      <Modal
        visible={filterSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterSheetOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
          onPress={() => setFilterSheetOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              maxHeight: '85%',
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            }}
          >
            {/* Drag Handle Indicator */}
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.md,
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <AppText variant="sectionHeader">Favorites Filters</AppText>
              <Pressable onPress={() => setFilterSheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
              {/* Sort selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Sort By
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = draftSortBy === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setDraftSortBy(opt.value)}
                        style={{
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceAlt,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <AppText variant="caption" weight="bold" style={{ color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }}>
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* In Stock toggle */}
              <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: theme.spacing.sm }}>
                <Pressable
                  onPress={() => setDraftInStockOnly(!draftInStockOnly)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <AppText variant="bodyMedium" weight="bold">Available Only</AppText>
                    <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Hide books that are sold out.</AppText>
                  </View>
                  <Ionicons
                    name={draftInStockOnly ? "checkbox" : "square-outline"}
                    size={24}
                    color={draftInStockOnly ? theme.colors.primary : theme.colors.textTertiary}
                  />
                </Pressable>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                <Pressable
                  onPress={clearFilters}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 48,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.surfaceAlt,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <AppText variant="body" weight="bold">Reset</AppText>
                </Pressable>
                <Pressable
                  onPress={applyFilters}
                  style={({ pressed }) => ({
                    flex: 2,
                    height: 48,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <AppText variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
                    Apply Filters
                  </AppText>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
