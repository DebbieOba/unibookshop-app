import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../hooks/useDashboard';
import { useBooks } from '../../../hooks/useBooks';
import { useTheme } from '../../../hooks/useTheme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';
import { SearchBar } from '../../../components/SearchBar';
import { StatusPill } from '../../../components/StatusPill';
import { Button } from '../../../components/Button';
import { AdjustStockSheet } from '../Books/AdjustStockSheet';
import { Book } from '../../../types/catalogue';

export function InventoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const inventory = useInventory();
  const books = useBooks({ limit: 100 });
  const [search, setSearch] = useState('');
  const [adjustingBook, setAdjustingBook] = useState<Book | null>(null);

  const lowStockThreshold = inventory.data?.lowStockThreshold ?? 5;

  const filteredBooks = useMemo(() => {
    let list = books.data?.data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return list;
  }, [books.data, search]);

  const refetchAll = () => {
    void inventory.refetch();
    void books.refetch();
  };

  if (inventory.isLoading || books.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.sm, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={80} />
        <Skeleton height={120} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (inventory.isError || books.isError || !inventory.data) {
    return <ErrorState onRetry={refetchAll} />;
  }

  const tiles = [
    { label: 'Total Books', value: inventory.data.totalBooks, color: theme.colors.primary, subtle: theme.colors.primaryTint, icon: 'library-outline' as const },
    { label: 'Low Stock', value: inventory.data.lowStock, color: theme.colors.warning, subtle: theme.colors.warningSubtle, icon: 'alert-circle-outline' as const },
    { label: 'Out of Stock', value: inventory.data.outOfStock, color: theme.colors.error, subtle: theme.colors.errorSubtle, icon: 'close-circle-outline' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md }}>
      {/* Header title */}
      <View style={{ marginBottom: theme.spacing.sm }}>
        <AppText variant="title">Inventory</AppText>
        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
          Monitor stock levels, set alerts, and adjust quantities
        </AppText>
      </View>
      
      {/* KPI Cards Grid */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginVertical: theme.spacing.sm }}>
        {tiles.map((tile) => (
          <Card key={tile.label} style={{ flex: 1, alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.xs }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: tile.subtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={tile.icon} size={18} color={tile.color} />
            </View>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              {tile.label}
            </AppText>
            <AppText variant="heading3" style={{ color: tile.color }}>
              {tile.value}
            </AppText>
          </Card>
        ))}
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search inventory by title or author"
        debounceMs={0}
      />

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={books.isFetching || inventory.isFetching}
            onRefresh={refetchAll}
            tintColor={theme.colors.adminAccent}
          />
        }
        renderItem={({ item }) => {
          const threshold = item.reorderThreshold ?? lowStockThreshold;
          const isOutOfStock = item.stockQuantity === 0;
          const isLowStock = !isOutOfStock && item.stockQuantity <= threshold;

          let pillStatus: 'COMPLETED' | 'PROCESSING' | 'CANCELLED' = 'COMPLETED';
          let pillLabel = 'In stock';
          if (isOutOfStock) {
            pillStatus = 'CANCELLED';
            pillLabel = 'Out of stock';
          } else if (isLowStock) {
            pillStatus = 'PROCESSING';
            pillLabel = 'Low stock';
          }

          return (
            <Card style={{ gap: theme.spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyMedium" numberOfLines={2}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" numberOfLines={1}>
                    by {item.author}
                  </AppText>
                </View>
                <StatusPill status={pillStatus} label={pillLabel} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xs }}>
                <View style={{ gap: 2 }}>
                  <AppText variant="body">
                    {item.stockQuantity} {item.stockQuantity === 1 ? 'copy' : 'copies'} available
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textTertiary }}>
                    Threshold: {threshold} units
                  </AppText>
                </View>

                <Button
                  tone="admin"
                  label="Adjust"
                  variant="outline"
                  onPress={() => setAdjustingBook(item)}
                  style={{ minHeight: 32, paddingHorizontal: theme.spacing.md }}
                />
              </View>
            </Card>
          );
        }}
      />

      {adjustingBook ? (
        <AdjustStockSheet
          visible={!!adjustingBook}
          bookId={adjustingBook.id}
          bookTitle={adjustingBook.title}
          currentStock={adjustingBook.stockQuantity}
          onClose={() => {
            setAdjustingBook(null);
            refetchAll();
          }}
        />
      ) : null}
    </View>
  );
}
