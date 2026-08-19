import { ReactNode, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { SearchBar } from './SearchBar';
import { IconButton } from './IconButton';
import { ConfirmSheet } from './ConfirmSheet';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

interface ResourceItem {
  id: string;
  name: string;
}

interface AdminResourceListProps<T extends ResourceItem> {
  title: string;
  description?: string;
  items: T[] | undefined;
  isLoading: boolean;
  onAdd: (name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  isAdding?: boolean;
  /** Extra input rendered above the name field — e.g. a school picker for Departments. */
  addFormExtra?: ReactNode;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Shared list + inline add form for near-identical admin CRUD screens
 * (Schools/Departments/Levels) — same DRY reasoning as the backend's
 * CrudService<T> (backend-architecture.md §2).
 */
export function AdminResourceList<T extends ResourceItem>({
  title,
  description,
  items,
  isLoading,
  onAdd,
  onDelete,
  isAdding,
  addFormExtra,
  isRefreshing,
  onRefresh,
}: AdminResourceListProps<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const toast = useToast();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const singular = title.toLowerCase().replace(/s$/, '');

  const filtered = useMemo(
    () => (search.trim() ? (items ?? []).filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase())) : items ?? []),
    [items, search],
  );

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingItem.id);
      toast(`${deletingItem.name} removed`);
    } catch {
      toast(`Could not remove ${deletingItem.name}`, 'error');
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={200} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Header Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }}
      >
        <IconButton
          name="arrow-back"
          size={22}
          color={theme.colors.textPrimary}
          onPress={() => navigation.goBack()}
          style={{ marginRight: theme.spacing.sm }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="title" style={{ fontSize: 20 }}>{title}</AppText>
          {description ? (
            <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {description}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>

      {(items?.length ?? 0) > 5 ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${title.toLowerCase()}`} debounceMs={0} />
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.md, paddingBottom: 80 }}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.adminAccent} /> : undefined
        }
        ListEmptyComponent={
          search ? (
            <EmptyState icon="search-outline" message="No matches found" subtext="Try a different search." />
          ) : (
            <EmptyState icon="layers-outline" message={`No ${title.toLowerCase()} yet.`} subtext={`Add your first ${singular} below.`} />
          )
        }
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="body">{item.name}</AppText>
            <IconButton name="trash-outline" color={theme.colors.error} onPress={() => setDeletingItem(item)} />
          </Card>
        )}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsAddSheetOpen(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 99,
        }}
      >
        <Ionicons name="add" size={28} color={theme.colors.textInverse} />
      </TouchableOpacity>
      </View>

      {/* Confirm Deletion Bottom Sheet */}
      <ConfirmSheet
        visible={!!deletingItem}
        title={`Remove ${deletingItem?.name ?? 'this item'}?`}
        message={`This will permanently remove this ${singular}.`}
        confirmLabel="Remove"
        destructive
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingItem(null)}
      />

      {/* Add Resource Bottom Sheet Form */}
      <Modal visible={isAddSheetOpen} transparent animationType="slide" onRequestClose={() => setIsAddSheetOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setIsAddSheetOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              maxHeight: '80%',
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.sheet,
              borderTopRightRadius: theme.radii.sheet,
              paddingTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: 40,
              gap: theme.spacing.md,
            }}
          >
            {/* Drag Handle */}
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.sm,
              }}
            />

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText variant="sectionHeader">Add New {singular}</AppText>
              <Pressable onPress={() => setIsAddSheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            {/* Form Fields */}
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={{ gap: theme.spacing.md, paddingVertical: theme.spacing.xs, paddingBottom: theme.spacing.lg }}>
                {addFormExtra}
                
                <Input
                  label={`${title.replace(/s$/, '')} Name`}
                  placeholder={`Enter ${singular} name`}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </ScrollView>

            {/* Submit Button */}
            <Button
              tone="admin"
              label="Add"
              isLoading={isAdding}
              loadingLabel="Adding…"
              disabled={!name.trim()}
              onPress={async () => {
                const submitted = name.trim();
                try {
                  await onAdd(submitted);
                  setName('');
                  setIsAddSheetOpen(false);
                  toast(`${submitted} added`);
                } catch (error) {
                  toast(error instanceof Error ? error.message : `Could not add ${submitted}`, 'error');
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
