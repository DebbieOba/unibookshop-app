import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

interface Item {
  id: string;
  name: string;
}

interface SearchableBottomSheetProps<T extends Item> {
  visible: boolean;
  title: string;
  items: T[];
  selectedId?: string;
  onSelect: (item: T) => void;
  onClose: () => void;
  /** Hides the search field for short lists (e.g. 5 academic levels). */
  searchable?: boolean;
}

/** Generic bottom-sheet picker — Modal's built-in slide animation gives the
 * sheet-from-bottom feel without pulling in a gesture-handler/reanimated
 * bottom-sheet library for what's otherwise a simple filtered list. */
export function SearchableBottomSheet<T extends Item>({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
  searchable = true,
}: SearchableBottomSheetProps<T>) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, query, searchable]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            maxHeight: '75%',
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.card,
            borderTopRightRadius: theme.radii.card,
            paddingTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
          }}
        >
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

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="sectionHeader">{title}</AppText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {searchable ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 44,
                borderRadius: theme.radii.input,
                backgroundColor: theme.colors.surfaceAlt,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                gap: theme.spacing.sm,
                marginTop: theme.spacing.md,
              }}
            >
              <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} />
              <TextInput
                placeholder="Search…"
                placeholderTextColor={theme.colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, color: theme.colors.textPrimary, height: '100%' }}
              />
            </View>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={{ marginTop: theme.spacing.sm }}
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            ListEmptyComponent={
              <AppText
                variant="body"
                style={{ color: theme.colors.textTertiary, textAlign: 'center', paddingVertical: theme.spacing.xl }}
              >
                No matches found.
              </AppText>
            }
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    handleClose();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <AppText
                    variant="body"
                    style={{ color: selected ? theme.colors.primary : theme.colors.textPrimary, flex: 1 }}
                  >
                    {item.name}
                  </AppText>
                  {selected ? <Ionicons name="checkmark" size={20} color={theme.colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
