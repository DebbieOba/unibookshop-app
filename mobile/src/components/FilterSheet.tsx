import { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Button } from "./Button";

interface FilterSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onClearAll?: () => void;
  /** Sticky footer CTA — e.g. "Show 248 books" (BookdeckMobileDesignSystem.md §12.3). */
  resultLabel: string;
  onApply: () => void;
  children: ReactNode;
}

/** Generic filter/sort bottom-sheet shell — drag handle, title, optional
 * "Clear all", scrollable content, sticky result-preview footer. Built on the
 * same Modal-slide structure as `SearchableBottomSheet`, but holds arbitrary
 * filter sections instead of a single searchable list. */
export function FilterSheet({
  visible,
  title = "Filter books",
  onClose,
  onClearAll,
  resultLabel,
  onApply,
  children,
}: FilterSheetProps) {
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
            maxHeight: "85%",
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.sheet,
            borderTopRightRadius: theme.radii.sheet,
            paddingTop: theme.spacing.md,
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
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            <AppText variant="sectionHeader">{title}</AppText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
              }}
            >
              {onClearAll ? (
                <Pressable onPress={onClearAll} hitSlop={8}>
                  <AppText
                    variant="label"
                    weight="semiBold"
                    style={{ color: theme.colors.primary }}
                  >
                    Clear all
                  </AppText>
                </Pressable>
              ) : null}
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={{ marginTop: theme.spacing.md }}
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.xl,
              gap: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
            }}
          >
            {children}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              padding: theme.spacing.xl,
              paddingBottom: insets.bottom + theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.divider,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 2 }}>
              <Button label={resultLabel} onPress={onApply} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
