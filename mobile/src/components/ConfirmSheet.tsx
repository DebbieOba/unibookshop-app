import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Button } from "./Button";

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Renders the confirm button as destructive (red) — used for delete/log-out/remove actions. */
  destructive?: boolean;
  isConfirming?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Shared confirmation sheet for actions that shouldn't fire on a single tap
 * (delete book, remove address, remove cart line, log out) — BookdeckMobileDesignSystem.md
 * §8.13: modals are reserved for exactly this ("short confirmations, destructive
 * warnings, critical decisions"), never for full forms or flows. */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  isConfirming,
  children,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "flex-end",
        }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.sheet,
            borderTopRightRadius: theme.radii.sheet,
            padding: theme.spacing.xl,
            paddingBottom: insets.bottom + theme.spacing.xl,
            gap: theme.spacing.md,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.border,
            }}
          />

          <View
            style={{
              alignSelf: "center",
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: destructive
                ? theme.colors.errorSubtle
                : theme.colors.warningSubtle,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={destructive ? "trash-outline" : "alert-circle-outline"}
              size={22}
              color={destructive ? theme.colors.error : theme.colors.warning}
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="sectionHeader" style={{ textAlign: "center" }}>
              {title}
            </AppText>
            <AppText
              variant="body"
              style={{ color: theme.colors.textSecondary, textAlign: "center" }}
            >
              {message}
            </AppText>
          </View>

          {children}

          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xs,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button
                label={cancelLabel}
                variant="outline"
                onPress={onCancel}
                disabled={isConfirming}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={confirmLabel}
                variant={destructive ? "destructive" : "primary"}
                isLoading={isConfirming}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
