import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useBooks, useCategories } from "../../../hooks/useBooks";
import {
  usePreOrders,
  useTogglePreOrderReservation,
} from "../../../hooks/usePreOrders";
import { useToast } from "../../../hooks/useToast";
import { getBookPlaceholderCover } from "../../../components/BookCard";
import { cloudinaryUrl } from "../../../lib/cloudinary";
import { Book } from "../../../types/catalogue";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { SearchBar } from "../../../components/SearchBar";
import { IconButton } from "../../../components/IconButton";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";

type Props = NativeStackScreenProps<CustomerStackParamList, "PreOrder">;

type SortValue = "recommended" | "newest" | "priceAsc" | "priceDesc";
const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
];

const PAGE_SIZE = 6;

function formatReleaseDate(releaseDate?: string | null): string | null {
  if (!releaseDate) return null;
  const date = new Date(releaseDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PreOrderScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const categories = useCategories();
  const reservations = usePreOrders();
  const toggleReservation = useTogglePreOrderReservation();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SortValue>("recommended");

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState<string | undefined>(
    undefined,
  );
  const [draftMinPrice, setDraftMinPrice] = useState("");
  const [draftMaxPrice, setDraftMaxPrice] = useState("");
  const [draftSort, setDraftSort] = useState<SortValue>("recommended");

  const [page, setPage] = useState(1);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, minPrice, maxPrice, sort]);

  const books = useBooks({
    page,
    limit: PAGE_SIZE,
    isPreOrder: true,
    search: search || undefined,
    categoryId,
    minPrice,
    maxPrice,
    sort: sort === "newest" ? "newest" : undefined,
  });

  useEffect(() => {
    if (!books.data?.data) return;
    if (page === 1) {
      setAllBooks(books.data.data);
    } else {
      setAllBooks((prev) => {
        const ids = new Set(prev.map((b) => b.id));
        return [...prev, ...books.data!.data.filter((b) => !ids.has(b.id))];
      });
    }
    setHasMore(books.data.meta.page < books.data.meta.totalPages);
  }, [books.data, page]);

  const sortedBooks =
    sort === "priceAsc"
      ? [...allBooks].sort((a, b) => a.price - b.price)
      : sort === "priceDesc"
        ? [...allBooks].sort((a, b) => b.price - a.price)
        : allBooks;

  const reservedBookIds = new Set(
    (reservations.data ?? []).map((r) => r.bookId),
  );
  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (minPrice != null ? 1 : 0) +
    (maxPrice != null ? 1 : 0) +
    (sort !== "recommended" ? 1 : 0);

  const openFilterSheet = () => {
    setDraftCategoryId(categoryId);
    setDraftMinPrice(minPrice != null ? String(minPrice) : "");
    setDraftMaxPrice(maxPrice != null ? String(maxPrice) : "");
    setDraftSort(sort);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setCategoryId(draftCategoryId);
    setMinPrice(draftMinPrice ? Number(draftMinPrice) : undefined);
    setMaxPrice(draftMaxPrice ? Number(draftMaxPrice) : undefined);
    setSort(draftSort);
    setFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftCategoryId(undefined);
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setDraftSort("recommended");
  };

  const handleLoadMore = () => {
    if (hasMore && !books.isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="title">Pre-Order Syllabus</AppText>
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          Reserve core textbooks that are coming soon — no payment now. We'll
          notify you the moment each one is available to order.
        </AppText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search title, author or course"
              isSearching={books.isFetching && !books.isLoading}
            />
          </View>
          <View>
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
            {activeFilterCount > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: theme.colors.gold,
                  borderRadius: 999,
                  minWidth: 18,
                  height: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 3,
                }}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{ color: "#111827", fontSize: 10 }}
                >
                  {activeFilterCount}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {books.isLoading && page === 1 ? (
        <View
          style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
        >
          <Skeleton height={96} />
          <Skeleton height={96} />
          <Skeleton height={96} />
        </View>
      ) : books.isError ? (
        <ErrorState onRetry={() => books.refetch()} />
      ) : (
        <FlatList
          data={sortedBooks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: 0,
            gap: theme.spacing.sm,
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              message="No pre-order books found"
              subtext="Try a different search or clear your filters."
            />
          }
          ListFooterComponent={
            books.isFetching && page > 1 ? (
              <Skeleton height={96} style={{ marginTop: theme.spacing.sm }} />
            ) : null
          }
          renderItem={({ item }) => {
            const isReserved = reservedBookIds.has(item.id);
            const releaseLabel = formatReleaseDate(item.releaseDate);
            const isPlaceholder =
              !item.coverUrl || item.coverUrl.includes("placehold.co");
            const source = isPlaceholder
              ? getBookPlaceholderCover(item.title, item.category?.name)
              : { uri: cloudinaryUrl(item.coverUrl ?? "", { width: 200 }) };

            return (
              <Card
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.md,
                  padding: theme.spacing.sm,
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() =>
                    navigation.navigate("BookDetails", { bookId: item.id })
                  }
                >
                  <Image
                    source={source}
                    style={{
                      width: 56,
                      height: 74,
                      borderRadius: 8,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                    contentFit="cover"
                  />
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyMedium" weight="bold" numberOfLines={2}>
                    {item.title}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                    numberOfLines={1}
                  >
                    {item.author}
                  </AppText>
                  <AppText
                    variant="price"
                    style={{
                      color: theme.colors.primary,
                      fontSize: 14,
                      marginTop: 2,
                    }}
                  >
                    ₦{item.price.toLocaleString()}
                  </AppText>
                  {releaseLabel ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={11}
                        color={theme.colors.textTertiary}
                      />
                      <AppText
                        variant="caption"
                        style={{
                          color: theme.colors.textTertiary,
                          fontSize: 10,
                        }}
                      >
                        Expected {releaseLabel}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <Button
                  label={isReserved ? "Reserved" : "Reserve"}
                  icon={
                    isReserved ? "checkmark-circle" : "notifications-outline"
                  }
                  variant={isReserved ? "outline" : "primary"}
                  size="small"
                  isLoading={
                    toggleReservation.isPending &&
                    toggleReservation.variables?.bookId === item.id
                  }
                  onPress={() =>
                    toggleReservation.mutate(
                      { bookId: item.id, isReserved },
                      {
                        onSuccess: () =>
                          toast(
                            isReserved
                              ? "Reservation cancelled"
                              : "You'll be notified when this is available",
                          ),
                        onError: () =>
                          toast("Could not update your reservation", "error"),
                      },
                    )
                  }
                />
              </Card>
            );
          }}
        />
      )}

      {/* Filter Bottom Sheet */}
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
              paddingBottom: insets.bottom + theme.spacing.xl,
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
              <AppText variant="sectionHeader">Pre-Order Filters</AppText>
              <Pressable onPress={() => setFilterSheetOpen(false)} hitSlop={8}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
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
                  Category
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
                        onPress={() =>
                          setDraftCategoryId(isSelected ? undefined : item.id)
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
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
