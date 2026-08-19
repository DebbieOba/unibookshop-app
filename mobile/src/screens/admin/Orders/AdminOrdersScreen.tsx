import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList, AdminTabParamList } from '../../../navigation/types';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { useTheme } from '../../../hooks/useTheme';
import { OrderStatus } from '../../../types/order';
import { AppText } from '../../../components/AppText';
import { Chip } from '../../../components/Chip';
import { SearchBar } from '../../../components/SearchBar';
import { IconButton } from '../../../components/IconButton';
import { OrderCard } from '../../../components/OrderCard';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';
import { FilterSheet } from '../../../components/FilterSheet';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'Orders'>,
  NativeStackScreenProps<AdminStackParamList>
>;

const STATUS_TABS: Array<{ label: string; status?: OrderStatus }> = [
  { label: 'All', status: undefined },
  { label: 'Processing', status: 'PROCESSING' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Cancelled', status: 'CANCELLED' },
];

type DateFilter = 'all' | 'today' | 'week';
const DATE_TABS: Array<{ label: string; value: DateFilter }> = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
];

function isWithinDateFilter(createdAt: string, filter: DateFilter): boolean {
  if (filter === 'all') return true;
  const created = new Date(createdAt);
  const now = new Date();
  if (filter === 'today') {
    return created.toDateString() === now.toDateString();
  }
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return created >= weekAgo;
}

export function AdminOrdersScreen({ navigation }: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [search, setSearch] = useState('');
  
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<OrderStatus | undefined>(undefined);
  const [draftDateFilter, setDraftDateFilter] = useState<DateFilter>('all');

  const orders = useAdminOrders(status);

  const filtered = useMemo(() => {
    const byDate = (orders.data ?? []).filter((order) => isWithinDateFilter(order.createdAt, dateFilter));
    if (!search.trim()) return byDate;
    const q = search.trim().toLowerCase();
    return byDate.filter((order) => order.id.toLowerCase().includes(q) || order.user?.email.toLowerCase().includes(q));
  }, [orders.data, dateFilter, search]);

  const handleOpenFilters = () => {
    setDraftStatus(status);
    setDraftDateFilter(dateFilter);
    setFilterSheetOpen(true);
  };

  const handleApplyFilters = () => {
    setStatus(draftStatus);
    setDateFilter(draftDateFilter);
    setFilterSheetOpen(false);
  };

  const handleClearFilters = () => {
    setDraftStatus(undefined);
    setDraftDateFilter('all');
  };

  const isFiltering = status !== undefined || dateFilter !== 'all';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg }}>
      {/* Header title */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <AppText variant="title">Orders</AppText>
        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
          Manage textbook distribution, fulfilment, and payments
        </AppText>
      </View>

      {/* Search and Filters Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by order ID or email..." />
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
          onPress={handleOpenFilters}
        />
      </View>

      {orders.isLoading ? (
        <Skeleton height={200} />
      ) : orders.isError ? (
        <ErrorState onRetry={() => orders.refetch()} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          refreshControl={<RefreshControl refreshing={orders.isFetching && !orders.isLoading} onRefresh={() => orders.refetch()} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <EmptyState icon="receipt-outline" message={search || isFiltering ? 'No matching orders' : 'No orders in this category.'} />
          }
          renderItem={({ item }) => (
            <OrderCard order={item} showCustomer onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })} />
          )}
        />
      )}

      {/* Custom Filter Sheet */}
      <FilterSheet
        visible={filterSheetOpen}
        title="Order Filters"
        onClose={() => setFilterSheetOpen(false)}
        onClearAll={handleClearFilters}
        onApply={handleApplyFilters}
        resultLabel="Apply Filters"
      >
        {/* Status Section */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
            Filter by Status
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {STATUS_TABS.map((tab) => (
              <Chip
                key={tab.label}
                variant="admin"
                label={tab.label}
                selected={draftStatus === tab.status}
                onPress={() => setDraftStatus(tab.status)}
              />
            ))}
          </View>
        </View>

        {/* Date Section */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
            Filter by Date
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {DATE_TABS.map((tab) => (
              <Chip
                key={tab.value}
                variant="admin"
                label={tab.label}
                selected={draftDateFilter === tab.value}
                onPress={() => setDraftDateFilter(tab.value)}
              />
            ))}
          </View>
        </View>
      </FilterSheet>
    </View>
  );
}
