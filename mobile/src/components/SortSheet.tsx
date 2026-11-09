import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortSheetProps<T extends string> {
  visible: boolean;
  title?: string;
  options: SortOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** Radio-selection sort sheet — closes automatically on selection
 * (BookdeckMobileDesignSystem.md §12.4). */
export function SortSheet<T extends string>({
  visible,
  title = "Sort by",
  options,
  selected,
  onSelect,
  onClose,
}: SortSheetProps<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.sheet,
            borderTopRightRadius: theme.radii.sheet,
            paddingTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            paddingBottom: insets.bottom + theme.spacing.lg,
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
          <AppText
            variant="sectionHeader"
            style={{ marginBottom: theme.spacing.sm }}
          >
            {title}
          </AppText>
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <AppText
                  variant="body"
                  style={{
                    color: active
                      ? theme.colors.primary
                      : theme.colors.textPrimary,
                  }}
                >
                  {option.label}
                </AppText>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={
                    active ? theme.colors.primary : theme.colors.textTertiary
                  }
                />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
