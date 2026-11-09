import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Input } from "./Input";

interface ReasonSheetProps {
  visible: boolean;
  title: string;
  message: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/** Same shell as ConfirmSheet, plus a required reason field — for actions
 * whose consequence needs a stated "why" (restrict a user, cancel an order),
 * not just a yes/no. Confirm stays disabled until a reason is entered. */
export function ReasonSheet({
  visible,
  title,
  message,
  reasonLabel = "Reason",
  reasonPlaceholder = "Explain why this action is being taken",
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  isConfirming,
  onConfirm,
  onCancel,
}: ReasonSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (visible) setReason("");
  }, [visible]);

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
              name={destructive ? "alert-circle-outline" : "create-outline"}
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

          <Input
            label={reasonLabel}
            placeholder={reasonPlaceholder}
            value={reason}
            onChangeText={setReason}
            multiline
          />

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
                disabled={!reason.trim()}
                onPress={() => onConfirm(reason.trim())}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
