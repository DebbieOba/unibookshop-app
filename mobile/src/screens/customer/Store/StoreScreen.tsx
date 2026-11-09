import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CustomerTabParamList,
  CustomerStackParamList,
} from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { Theme } from "../../../theme";
import { useBooks, useCategories, useSubcategories } from "../../../hooks/useBooks";
import { useProfile } from "../../../hooks/useProfile";
import { useRecentlyViewedBooks } from "../../../hooks/useRecentlyViewed";
import {
  useFavourites,
  useToggleFavourite,
} from "../../../hooks/useFavourites";
import { Book } from "../../../types/catalogue";
import { AppText } from "../../../components/AppText";
import { SearchBar } from "../../../components/SearchBar";
import { IconButton } from "../../../components/IconButton";
import { BookCard } from "../../../components/BookCard";
import { CustomerHeaderActions } from "../../../components/CustomerHeaderActions";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, "Store">,
  NativeStackScreenProps<CustomerStackParamList>
>;

interface SortOption<T> {
  value: T;
  label: string;
}

const BookCardListItem = memo(
  ({
    item,
    width,
    isFav,
    onFavouritePress,
    onPress,
  }: {
    item: Book;
    width: any;
    isFav: boolean;
    onFavouritePress: (id: string, isFav: boolean) => void;
    onPress: (id: string) => void;
  }) => {
    return (
      <BookCard
        book={item}
        width={width}
        isFavourited={isFav}
        onFavouritePress={() => onFavouritePress(item.id, isFav)}
        onPress={() => onPress(item.id)}
      />
    );
  },
);

function FilterPill({
  label,
  onClear,
  theme,
}: {
  label: string;
  onClear: () => void;
  theme: Theme;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: theme.colors.primary + "15",
        borderRadius: 999,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 5,
      }}
    >
      <AppText
        variant="caption"
        weight="bold"
        style={{ color: theme.colors.primary }}
      >
        {label}
      </AppText>
      <Pressable onPress={onClear} hitSlop={6} style={{ padding: 2 }}>
        <Ionicons name="close" size={14} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

type SortValue = "recommended" | "newest" | "priceAsc" | "priceDesc";
const SORT_OPTIONS: SortOption<SortValue>[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest arrivals" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
];

export function StoreScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const recentlyViewed = useRecentlyViewedBooks();
  const favourites = useFavourites();
  const toggleFavourite = useToggleFavourite();

  const [search, setSearch] = useState(() => route.params?.search ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    () => route.params?.categoryId,
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [onSale, setOnSale] = useState(() => route.params?.onSale ?? false);
  const [isPreOrder, setIsPreOrder] = useState(
    () => route.params?.isPreOrder ?? false,
  );
  const [sort, setSort] = useState<SortValue>(
    () => route.params?.sort ?? "recommended",
  );

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [draftCategoryId, setDraftCategoryId] = useState<string | undefined>(
    categoryId,
  );
  const [draftSubcategoryId, setDraftSubcategoryId] = useState<
    string | undefined
  >(undefined);
  const [draftAudience, setDraftAudience] = useState<string | undefined>(
    undefined,
  );
  const [draftCondition, setDraftCondition] = useState<string | undefined>(
    undefined,
  );
  const [draftLanguage, setDraftLanguage] = useState<string>("");
  const [draftMinPrice, setDraftMinPrice] = useState<string>("");
  const [draftMaxPrice, setDraftMaxPrice] = useState<string>("");
  const [draftInStockOnly, setDraftInStockOnly] = useState(false);
  const [draftSort, setDraftSort] = useState<SortValue>("recommended");

  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(
    undefined,
  );
  const [audience, setAudience] = useState<string | undefined>(undefined);
  const [condition, setCondition] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef<ScrollView>(null);
  const BANNER_ITEM_WIDTH = Dimensions.get("window").width - 32 - 16;
  // "All Catalog Books" grid: 2 columns with a deliberately tight gap between
  // them (down from the old 3-column layout's 8px).
  const CATALOG_GRID_GAP = 4;
  const CATALOG_CARD_WIDTH =
    (Dimensions.get("window").width - theme.spacing.lg * 2 - CATALOG_GRID_GAP) /
    2;

  const handleFavouritePress = useCallback(
    (bookId: string, isFavourited: boolean) => {
      toggleFavourite.mutate({ bookId, isFavourited });
    },
    [toggleFavourite],
  );

  const handleBookPress = useCallback(
    (bookId: string) => {
      navigation.navigate("BookDetails", { bookId });
    },
    [navigation],
  );

  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => {
      const isFav = (favourites.data ?? []).some((f) => f.book.id === item.id);
      return (
        <BookCardListItem
          item={item}
          width={CATALOG_CARD_WIDTH}
          isFav={isFav}
          onFavouritePress={handleFavouritePress}
          onPress={handleBookPress}
        />
      );
    },
    [
      favourites.data,
      handleFavouritePress,
      handleBookPress,
      CATALOG_CARD_WIDTH,
    ],
  );

  const STORE_BANNERS = [
    {
      title: "Used Books Exchange",
      desc: "Buy used textbooks directly from other students.",
      colors: ["#7928CA", "#FF007A"] as const,
      icon: "sync-outline" as const,
      buttonLabel: "Exchange Now",
      onPress: () => navigation.navigate("ExchangeListings"),
    },
    {
      title: "Pre-Order Syllabus",
      desc: "Reserve core textbooks that are coming soon.",
      colors: ["#0070F3", "#00DFD8"] as const,
      icon: "calendar-outline" as const,
      buttonLabel: "Pre-Order",
      onPress: () => navigation.navigate("PreOrder"),
    },

    {
      title: "Sell Your Materials",
      desc: "Finished your exams? Sell your old notes and study packs.",
      colors: ["#00DFD8", "#4AF2A1"] as const,
      icon: "cash-outline" as const,
      buttonLabel: "Start Selling",
      onPress: () => navigation.navigate("CreateListing"),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % STORE_BANNERS.length;
      setActiveBannerIndex(nextIndex);
      bannerRef.current?.scrollTo({
        x: nextIndex * (BANNER_ITEM_WIDTH + 16),
        animated: true,
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBannerIndex]);

  useEffect(() => {
    if (route.params?.search !== undefined) {
      setSearch(route.params.search);
    }
    if (route.params?.categoryId !== undefined) {
      setCategoryId(route.params.categoryId);
      setDraftCategoryId(route.params.categoryId);
    }
    if (route.params?.inStockOnly !== undefined) {
      setInStockOnly(route.params.inStockOnly);
      setDraftInStockOnly(route.params.inStockOnly);
    }
    if (route.params?.minPrice !== undefined) {
      setMinPrice(route.params.minPrice);
      setDraftMinPrice(
        route.params.minPrice ? String(route.params.minPrice) : "",
      );
    }
    if (route.params?.maxPrice !== undefined) {
      setMaxPrice(route.params.maxPrice);
      setDraftMaxPrice(
        route.params.maxPrice ? String(route.params.maxPrice) : "",
      );
    }
    if (route.params?.onSale !== undefined) {
      setOnSale(route.params.onSale);
    }
    if (route.params?.isPreOrder !== undefined) {
      setIsPreOrder(route.params.isPreOrder);
    }
    if (route.params?.sort !== undefined) {
      setSort(route.params.sort);
    }
  }, [route.params]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    categoryId,
    inStockOnly,
    minPrice,
    maxPrice,
    onSale,
    isPreOrder,
    sort,
    subcategoryId,
    audience,
    condition,
    language,
  ]);

  const categories = useCategories();
  const subcategories = useSubcategories(draftCategoryId);
  const books = useBooks({
    page,
    limit: 12,
    search: search || undefined,
    categoryId,
    subcategoryId,
    audience,
    condition,
    language,
    inStockOnly: inStockOnly || undefined,
    minPrice,
    maxPrice,
    onSale: onSale || undefined,
    isPreOrder: isPreOrder || undefined,
    // priceAsc/priceDesc are re-sorted client-side below over the already
    // fetched pages (unchanged existing behavior) — only 'newest' needs the
    // server to sort at the DB level so pagination itself is in the right order.
    sort: sort === "newest" ? "newest" : undefined,
  });

  useEffect(() => {
    if (books.data?.data) {
      if (page === 1) {
        setAllBooks(books.data.data);
      } else {
        setAllBooks((prev) => {
          const ids = new Set(prev.map((b) => b.id));
          const next = books.data!.data.filter((b) => !ids.has(b.id));
          return [...prev, ...next];
        });
      }
      setHasMore(books.data.meta.page < books.data.meta.totalPages);
    }
  }, [books.data, page]);

  const sortedAllBooks = useMemo(() => {
    if (sort === "priceAsc")
      return [...allBooks].sort((a: Book, b: Book) => a.price - b.price);
    if (sort === "priceDesc")
      return [...allBooks].sort((a: Book, b: Book) => b.price - a.price);
    return allBooks;
  }, [allBooks, sort]);

  const syllabusBooks = useMemo(() => {
    return [];
  }, []);

  const recommendedBooks = useMemo(() => {
    return allBooks.slice(0, 6);
  }, [allBooks]);

  const popularBooks = useMemo(() => {
    return allBooks.filter((b) => b.stockQuantity > 5).slice(0, 6);
  }, [allBooks]);

  const studyGuides = useMemo(() => {
    return allBooks.filter((b) => b.price > 3000).slice(0, 6);
  }, [allBooks]);

  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (minPrice != null ? 1 : 0) +
    (maxPrice != null ? 1 : 0);

  const openFilterSheet = () => {
    setDraftCategoryId(categoryId);
    setDraftSubcategoryId(subcategoryId);
    setDraftAudience(audience);
    setDraftCondition(condition);
    setDraftLanguage(language || "");
    setDraftInStockOnly(inStockOnly);
    setDraftMinPrice(minPrice != null ? String(minPrice) : "");
    setDraftMaxPrice(maxPrice != null ? String(maxPrice) : "");
    setDraftSort(sort);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setCategoryId(draftCategoryId);
    setSubcategoryId(draftSubcategoryId);
    setAudience(draftAudience);
    setCondition(draftCondition);
    setLanguage(draftLanguage || undefined);
    setInStockOnly(draftInStockOnly);
    setMinPrice(draftMinPrice ? Number(draftMinPrice) : undefined);
    setMaxPrice(draftMaxPrice ? Number(draftMaxPrice) : undefined);
    setSort(draftSort);
    setFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftCategoryId(undefined);
    setDraftSubcategoryId(undefined);
    setDraftAudience(undefined);
    setDraftCondition(undefined);
    setDraftLanguage("");
    setDraftInStockOnly(false);
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setDraftSort("recommended");
  };

  const handleLoadMore = () => {
    if (hasMore && !books.isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const isFiltering =
    !!search ||
    !!categoryId ||
    inStockOnly ||
    minPrice != null ||
    maxPrice != null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            flex: 1,
          }}
        >
          <Pressable
            onPress={() => {
              clearFilters();
              void books.refetch();
            }}
            style={({ pressed }) => ({
              backgroundColor: "#FFFFFF",
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Image
              source={require("../../../../assets/BOOKDECK.png")}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
          </Pressable>
          <View>
            <AppText variant="title">Store</AppText>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textSecondary, fontSize: 10 }}
            >
              Browse our bookstore catalogue
            </AppText>
          </View>
        </View>
        <CustomerHeaderActions
          onCartPress={() => navigation.navigate("Cart")}
          onNotificationsPress={() => navigation.navigate("Notifications")}
        />
      </View>

      {/* Searchbar and Filters Button Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          marginTop: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search titles or courses"
            isSearching={books.isFetching && !books.isLoading}
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

      {/* Confirms a banner-driven filter is actually applied, rather than the
          grid silently changing with no explanation. */}
      {isPreOrder || onSale || sort === "newest" ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.xs,
            marginTop: theme.spacing.sm,
          }}
        >
          {isPreOrder ? (
            <FilterPill
              label="Showing pre-order books"
              onClear={() => setIsPreOrder(false)}
              theme={theme}
            />
          ) : null}
          {onSale ? (
            <FilterPill
              label="Showing books on sale"
              onClear={() => setOnSale(false)}
              theme={theme}
            />
          ) : null}
          {sort === "newest" ? (
            <FilterPill
              label="Sorted by newest arrivals"
              onClear={() => setSort("recommended")}
              theme={theme}
            />
          ) : null}
        </View>
      ) : null}

      {books.isLoading && page === 1 ? (
        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.md }}>
          {/* Banner card skeleton */}
          <Skeleton height={130} style={{ borderRadius: 16 }} />
          {/* Section label + horizontal card strip */}
          <View style={{ gap: theme.spacing.xs }}>
            <Skeleton height={16} width={140} style={{ borderRadius: 8 }} />
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
              <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
              <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
            </View>
          </View>
          {/* 3-column grid skeleton */}
          <View style={{ gap: theme.spacing.xs }}>
            <Skeleton height={16} width={110} style={{ borderRadius: 8 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
              <Skeleton height={160} style={{ flex: 1, borderRadius: 12 }} />
            </View>
          </View>
        </View>
      ) : books.isError ? (
        <ErrorState onRetry={() => books.refetch()} />
      ) : (
        <FlatList
          key="catalog-grid"
          data={sortedAllBooks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: CATALOG_GRID_GAP }}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={books.isFetching && !books.isLoading}
              onRefresh={() => {
                setPage(1);
                void books.refetch();
              }}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              message="No books found"
              subtext="Try adjusting your filters or search query."
            />
          }
          ListFooterComponent={
            books.isFetching && page > 1 ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginVertical: theme.spacing.md }}
              />
            ) : null
          }
          ListHeaderComponent={
            <View
              style={{ gap: theme.spacing.xl, marginBottom: theme.spacing.lg }}
            >
              {/* Only show carousels and banners if not actively searching/filtering */}
              {!isFiltering ? (
                <>
                  {/* Banner Pager Carousel */}
                  <View style={{ height: 140 }}>
                    <ScrollView
                      ref={bannerRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: theme.spacing.md }}
                      onMomentumScrollEnd={(e) => {
                        const index = Math.round(
                          e.nativeEvent.contentOffset.x /
                            (BANNER_ITEM_WIDTH + 16),
                        );
                        setActiveBannerIndex(index);
                      }}
                    >
                      {STORE_BANNERS.map((item) => (
                        <Pressable
                          key={item.title}
                          onPress={item.onPress}
                          style={{ width: BANNER_ITEM_WIDTH }}
                        >
                          <LinearGradient
                            colors={item.colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              width: BANNER_ITEM_WIDTH,
                              padding: theme.spacing.md,
                              borderRadius: 16,
                              height: 130,
                              justifyContent: "space-between",
                              shadowColor: item.colors[0],
                              shadowOffset: { width: 0, height: 6 },
                              shadowOpacity: 0.12,
                              shadowRadius: 10,
                              elevation: 4,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                flex: 1,
                              }}
                            >
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: "space-between",
                                }}
                              >
                                <View>
                                  <AppText
                                    variant="bodyMedium"
                                    weight="bold"
                                    style={{ color: "#FFFFFF", fontSize: 16 }}
                                  >
                                    {item.title}
                                  </AppText>
                                  <AppText
                                    variant="caption"
                                    style={{
                                      color: "rgba(255, 255, 255, 0.9)",
                                      marginTop: 2,
                                    }}
                                    numberOfLines={2}
                                  >
                                    {item.desc}
                                  </AppText>
                                </View>
                                <Pressable
                                  onPress={item.onPress}
                                  hitSlop={8}
                                  style={({ pressed }) => ({
                                    backgroundColor: "#FFFFFF",
                                    paddingHorizontal: theme.spacing.lg,
                                    paddingVertical: theme.spacing.sm,
                                    borderRadius: 999,
                                    alignSelf: "flex-start",
                                    opacity: pressed ? 0.85 : 1,
                                    transform: [{ scale: pressed ? 0.97 : 1 }],
                                  })}
                                >
                                  <AppText
                                    variant="bodyMedium"
                                    weight="bold"
                                    style={{
                                      color: item.colors[0],
                                      fontSize: 13,
                                    }}
                                  >
                                    {item.buttonLabel}
                                  </AppText>
                                </Pressable>
                              </View>
                              <View
                                style={{
                                  justifyContent: "center",
                                  marginLeft: theme.spacing.sm,
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.25)",
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Ionicons
                                    name={item.icon}
                                    size={24}
                                    color="#FFFFFF"
                                  />
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>



                  {/* Section 2: Recommended for You */}
                  {recommendedBooks.length > 0 ? (
                    <View style={{ gap: theme.spacing.sm }}>
                      <AppText variant="sectionHeader">
                        Recommended for You
                      </AppText>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={recommendedBooks}
                        keyExtractor={(item) => "rec-" + item.id}
                        contentContainerStyle={{ gap: theme.spacing.md }}
                        renderItem={({ item }) => {
                          const isFav = (favourites.data ?? []).some(
                            (f) => f.book.id === item.id,
                          );
                          return (
                            <BookCard
                              book={item}
                              isFavourited={isFav}
                              onFavouritePress={() =>
                                toggleFavourite.mutate({
                                  bookId: item.id,
                                  isFavourited: isFav,
                                })
                              }
                              onPress={() =>
                                navigation.navigate("BookDetails", {
                                  bookId: item.id,
                                })
                              }
                            />
                          );
                        }}
                      />
                    </View>
                  ) : null}

                  {/* Section 3: Highly Popular */}
                  {popularBooks.length > 0 ? (
                    <View style={{ gap: theme.spacing.sm }}>
                      <AppText variant="sectionHeader">Highly Popular</AppText>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={popularBooks}
                        keyExtractor={(item) => "pop-" + item.id}
                        contentContainerStyle={{ gap: theme.spacing.md }}
                        renderItem={({ item }) => {
                          const isFav = (favourites.data ?? []).some(
                            (f) => f.book.id === item.id,
                          );
                          return (
                            <BookCard
                              book={item}
                              isFavourited={isFav}
                              onFavouritePress={() =>
                                toggleFavourite.mutate({
                                  bookId: item.id,
                                  isFavourited: isFav,
                                })
                              }
                              onPress={() =>
                                navigation.navigate("BookDetails", {
                                  bookId: item.id,
                                })
                              }
                            />
                          );
                        }}
                      />
                    </View>
                  ) : null}

                  {/* Section 4 (Useful Section): Top Rated Study Guides */}
                  {studyGuides.length > 0 ? (
                    <View style={{ gap: theme.spacing.sm }}>
                      <AppText variant="sectionHeader">
                        Top Rated Study Guides
                      </AppText>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={studyGuides}
                        keyExtractor={(item) => "guide-" + item.id}
                        contentContainerStyle={{ gap: theme.spacing.md }}
                        renderItem={({ item }) => {
                          const isFav = (favourites.data ?? []).some(
                            (f) => f.book.id === item.id,
                          );
                          return (
                            <BookCard
                              book={item}
                              isFavourited={isFav}
                              onFavouritePress={() =>
                                toggleFavourite.mutate({
                                  bookId: item.id,
                                  isFavourited: isFav,
                                })
                              }
                              onPress={() =>
                                navigation.navigate("BookDetails", {
                                  bookId: item.id,
                                })
                              }
                            />
                          );
                        }}
                      />
                    </View>
                  ) : null}

                  {/* Section 5 (Useful Section): Recently Viewed */}
                  {recentlyViewed.data.length > 0 ? (
                    <View style={{ gap: theme.spacing.sm }}>
                      <AppText variant="sectionHeader">Recently Viewed</AppText>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={recentlyViewed.data}
                        keyExtractor={(item) => "recent-" + item.id}
                        contentContainerStyle={{ gap: theme.spacing.md }}
                        renderItem={({ item }) => {
                          const isFav = (favourites.data ?? []).some(
                            (f) => f.book.id === item.id,
                          );
                          return (
                            <BookCard
                              book={item}
                              isFavourited={isFav}
                              onFavouritePress={() =>
                                toggleFavourite.mutate({
                                  bookId: item.id,
                                  isFavourited: isFav,
                                })
                              }
                              onPress={() =>
                                navigation.navigate("BookDetails", {
                                  bookId: item.id,
                                })
                              }
                            />
                          );
                        }}
                      />
                    </View>
                  ) : null}
                </>
              ) : null}

              {/* Section 6 Header (All Catalog Books) */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <AppText variant="sectionHeader">
                  {isFiltering ? "Search Results" : "All Catalog Books"}
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {books.data?.meta.total ?? sortedAllBooks.length}{" "}
                  {(books.data?.meta.total ?? sortedAllBooks.length) === 1
                    ? "book"
                    : "books"}
                </AppText>
              </View>
            </View>
          }
          renderItem={renderBookItem}
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
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setFilterSheetOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              maxHeight: "85%",
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.md,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: theme.spacing.md,
              }}
            >
              <AppText variant="sectionHeader">Store Filters</AppText>
              <Pressable onPress={() => setFilterSheetOpen(false)} hitSlop={8}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.md }}
            >
              {/* Category selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Select Category
                </AppText>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories.data ?? []}
                  keyExtractor={(cat) => cat.id}
                  contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                  renderItem={({ item }) => {
                    const isSelected = draftCategoryId === item.id;
                    return (
                      <Pressable
                        onPress={() => {
                          const nextCat = isSelected ? undefined : item.id;
                          setDraftCategoryId(nextCat);
                          setDraftSubcategoryId(undefined);
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={{
                            color: isSelected
                              ? "#FFFFFF"
                              : theme.colors.textPrimary,
                          }}
                        >
                          {item.name}
                        </AppText>
                      </Pressable>
                    );
                  }}
                />
              </View>

              {/* Subcategory selector (when category is selected) */}
              {draftCategoryId && (subcategories.data?.length ?? 0) > 0 ? (
                <View style={{ gap: theme.spacing.xs }}>
                  <AppText
                    variant="label"
                    weight="bold"
                    style={{
                      color: theme.colors.textSecondary,
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: 0.5,
                    }}
                  >
                    Select Subcategory / Section
                  </AppText>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={subcategories.data ?? []}
                    keyExtractor={(sub) => sub.id}
                    contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                    renderItem={({ item }) => {
                      const isSelected = draftSubcategoryId === item.id;
                      return (
                        <Pressable
                          onPress={() =>
                            setDraftSubcategoryId(
                              isSelected ? undefined : item.id
                            )
                          }
                          style={{
                            backgroundColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.surfaceAlt,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.border,
                          }}
                        >
                          <AppText
                            variant="caption"
                            weight="bold"
                            style={{
                              color: isSelected
                                ? "#FFFFFF"
                                : theme.colors.textPrimary,
                            }}
                          >
                            {item.name}
                          </AppText>
                        </Pressable>
                      );
                    }}
                  />
                </View>
              ) : null}

              {/* Audience selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Target Audience
                </AppText>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {["Children", "Teens", "Adults", "All Ages"].map((aud) => {
                    const isSelected = draftAudience === aud;
                    return (
                      <Pressable
                        key={aud}
                        onPress={() =>
                          setDraftAudience(isSelected ? undefined : aud)
                        }
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={{
                            color: isSelected
                              ? "#FFFFFF"
                              : theme.colors.textPrimary,
                          }}
                        >
                          {aud}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Condition selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Condition
                </AppText>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {["NEW", "USED"].map((cond) => {
                    const isSelected = draftCondition === cond;
                    return (
                      <Pressable
                        key={cond}
                        onPress={() =>
                          setDraftCondition(isSelected ? undefined : cond)
                        }
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={{
                            color: isSelected
                              ? "#FFFFFF"
                              : theme.colors.textPrimary,
                          }}
                        >
                          {cond === "NEW" ? "New" : "Used"}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Language Input */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Language
                </AppText>
                <TextInput
                  placeholder="e.g. English"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={draftLanguage}
                  onChangeText={setDraftLanguage}
                  style={{
                    height: 44,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: 16,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfaceAlt,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Price Range */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Price Range (₦)
                </AppText>
                <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
                  <TextInput
                    placeholder="Min Price"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={draftMinPrice}
                    onChangeText={setDraftMinPrice}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 16,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                      fontSize: 14,
                    }}
                  />
                  <TextInput
                    placeholder="Max Price"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={draftMaxPrice}
                    onChangeText={setDraftMaxPrice}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 16,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>

              {/* Sort selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="bold"
                  style={{
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    fontSize: 11,
                    letterSpacing: 0.5,
                  }}
                >
                  Sort By
                </AppText>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = draftSort === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setDraftSort(opt.value)}
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={{
                            color: isSelected
                              ? "#FFFFFF"
                              : theme.colors.textPrimary,
                          }}
                        >
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* In Stock toggle */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.border,
                  paddingVertical: theme.spacing.sm,
                }}
              >
                <Pressable
                  onPress={() => setDraftInStockOnly(!draftInStockOnly)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <AppText variant="bodyMedium" weight="bold">
                      In Stock Only
                    </AppText>
                    <AppText
                      variant="caption"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Hide books that are sold out.
                    </AppText>
                  </View>
                  <Ionicons
                    name={draftInStockOnly ? "checkbox" : "square-outline"}
                    size={24}
                    color={
                      draftInStockOnly
                        ? theme.colors.primary
                        : theme.colors.textTertiary
                    }
                  />
                </Pressable>
              </View>

              {/* Action buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.sm,
                  marginTop: theme.spacing.sm,
                }}
              >
                <Pressable
                  onPress={clearFilters}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 48,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.surfaceAlt,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <AppText variant="body" weight="bold">
                    Reset
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={applyFilters}
                  style={({ pressed }) => ({
                    flex: 2,
                    height: 48,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={{ color: "#FFFFFF" }}
                  >
                    Apply Filters
                  </AppText>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
