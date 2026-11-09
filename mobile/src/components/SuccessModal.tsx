import { Modal, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Button } from "./Button";

interface SuccessModalProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  heading: string;
  subtext: string;
  buttonLabel: string;
  onButtonPress: () => void;
  isLoading?: boolean;
}

/** Generic modern success/confirmation modal — icon badge, heading, subtext,
 * one primary action. Used after SignUp; reusable anywhere else a
 * confirmation moment (not a transient Toast) is warranted. */
export function SuccessModal({
  visible,
  icon = "checkmark-circle",
  heading,
  subtext,
  buttonLabel,
  onButtonPress,
  isLoading,
}: SuccessModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.xl,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.card,
            padding: theme.spacing.xl,
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.primaryTint,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons name={icon} size={36} color={theme.colors.primary} />
          </View>

          <AppText variant="title" style={{ textAlign: "center" }}>
            {heading}
          </AppText>
          <AppText
            variant="body"
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            {subtext}
          </AppText>

          <Button
            label={buttonLabel}
            isLoading={isLoading}
            onPress={onButtonPress}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </Modal>
  );
}
