import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useOrders } from "../../../hooks/useOrders";
import { AppText } from "../../../components/AppText";
import { SearchBar } from "../../../components/SearchBar";
import { IconButton } from "../../../components/IconButton";
import { OrderCard } from "../../../components/OrderCard";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";
import { Ionicons } from "@expo/vector-icons";

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, "Orders">,
  NativeStackScreenProps<CustomerStackParamList>
>;

const STATUS_OPTIONS = [
  { label: "All Orders", value: "ALL" },
  { label: "Active (Processing)", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "dateDesc" },
  { label: "Oldest First", value: "dateAsc" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

export function OrdersScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const orders = useOrders();

  const [search, setSearch] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Active filter state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("dateDesc");

  // Draft state for bottom sheet
  const [draftStatus, setDraftStatus] = useState("ALL");
  const [draftSortBy, setDraftSortBy] = useState("dateDesc");

  const filteredAndSortedData = useMemo(() => {
    let list = [...(orders.data ?? [])];

    // 1. Filter by status
    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }

    // 2. Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((item) => item.titleSnapshot.toLowerCase().includes(q)),
      );
    }

    // 3. Sort
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === "dateDesc") return dateB - dateA;
      if (sortBy === "dateAsc") return dateA - dateB;
      if (sortBy === "priceAsc") return a.totalAmount - b.totalAmount;
      if (sortBy === "priceDesc") return b.totalAmount - a.totalAmount;
      return 0;
    });

    return list;
  }, [orders.data, statusFilter, search, sortBy]);

  const openFilterSheet = () => {
    setDraftStatus(statusFilter);
    setDraftSortBy(sortBy);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(draftStatus);
    setSortBy(draftSortBy);
    setFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftStatus("ALL");
    setDraftSortBy("dateDesc");
    setStatusFilter("ALL");
    setSortBy("dateDesc");
    setFilterSheetOpen(false);
  };

  const isFiltering = statusFilter !== "ALL" || sortBy !== "dateDesc";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      {/* Header title */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <AppText variant="title">My Orders</AppText>
        <AppText
          variant="caption"
          style={{ color: theme.colors.textSecondary }}
        >
          Track active campus collections & purchase history
        </AppText>
      </View>

      {/* Search and Filters Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order ID or book title..."
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

      {orders.isLoading ? (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          {/* Order card skeleton rows */}
          {[1, 2, 3].map((n) => (
            <View
              key={n}
              style={{
                borderRadius: 16,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                gap: theme.spacing.sm,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Skeleton height={14} width={120} style={{ borderRadius: 6 }} />
                <Skeleton height={14} width={70} style={{ borderRadius: 6 }} />
              </View>
              <Skeleton height={12} width={180} style={{ borderRadius: 6 }} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Skeleton
                  height={20}
                  width={80}
                  style={{ borderRadius: 999 }}
                />
                <Skeleton height={12} width={60} style={{ borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : orders.isError ? (
        <ErrorState onRetry={() => orders.refetch()} />
      ) : (
        <FlatList
          data={filteredAndSortedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing.xl,
          }}
          refreshControl={
            <RefreshControl
              refreshing={orders.isFetching && !orders.isLoading}
              onRefresh={() => orders.refetch()}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              type={search || isFiltering ? "warning" : "info"}
              icon="receipt-outline"
              message={
                search || isFiltering
                  ? "No matching orders found"
                  : "No orders yet"
              }
              subtext={
                search || isFiltering
                  ? "Try adjusting your search criteria."
                  : "Purchase history and receipt lists will appear here."
              }
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate("OrderDetails", { orderId: item.id })
              }
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
            {/* Drag Handle Indicator */}
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
              <AppText variant="sectionHeader">Order Filters</AppText>
              <Pressable onPress={() => setFilterSheetOpen(false)} hitSlop={8}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
              {/* Status Chips */}
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
                  Filter by Status
                </AppText>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = draftStatus === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setDraftStatus(opt.value)}
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 12,
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

              {/* Sort selector */}
              <View
                style={{
                  gap: theme.spacing.xs,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                  paddingTop: theme.spacing.sm,
                }}
              >
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
                    const isSelected = draftSortBy === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setDraftSortBy(opt.value)}
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceAlt,
                          paddingHorizontal: 12,
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
