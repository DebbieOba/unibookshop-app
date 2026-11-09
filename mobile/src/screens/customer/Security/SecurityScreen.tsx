import { useState, useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useChangePassword, useLogout } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Input, InputTrailingIcon } from "../../../components/Input";
import { Card } from "../../../components/Card";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { Ionicons } from "@expo/vector-icons";
import { usersApi } from "../../../api/users.api";
import { useAuthStore } from "../../../store/authStore";

type Props = NativeStackScreenProps<CustomerStackParamList, "Security">;

export function SecurityScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const changePassword = useChangePassword();
  const logout = useLogout();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Privacy & Compliance DSAR / Deletion State
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Live password strength checklist calculations
  const requirements = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      letter: /[a-zA-Z]/.test(newPassword),
    };
  }, [newPassword]);

  const canSubmit =
    currentPassword.length > 0 &&
    requirements.length &&
    requirements.number &&
    requirements.letter;

  const onSubmit = async () => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast("Password updated successfully", "success");
      navigation.goBack();
    } catch {
      toast(
        "Could not update password. Please check your credentials.",
        "error",
      );
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await usersApi.exportUserData();
      toast("Personal data record exported successfully", "success");
    } catch {
      toast("Failed to export data. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword) {
      toast("Please enter your password to confirm deletion", "error");
      return;
    }
    setIsDeleting(true);
    try {
      await usersApi.deleteAccount(deletePassword);
      setDeleteSheetVisible(false);
      toast("Your account has been permanently deleted.", "success");
      logout.mutate();
    } catch (err: any) {
      toast(
        err.response?.data?.message || "Failed to delete account. Check password.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.md,
          gap: theme.spacing.md,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lock Illustration Banner */}
        <View
          style={{
            alignItems: "center",
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary + "12",
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <AppText variant="title" style={{ fontSize: 20 }}>
            Account Security
          </AppText>
          <AppText
            variant="caption"
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginTop: 2,
            }}
          >
            Protect your bookdeck orders with a strong password
          </AppText>
        </View>

        {/* Input Fields Wrapper Card */}
        <Card style={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
          <Input
            label="Current Password"
            placeholder="Verify current password"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            trailingAction={
              <InputTrailingIcon
                name={showCurrent ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowCurrent((v) => !v)}
              />
            }
          />

          <Input
            label="New Password"
            placeholder="At least 8 characters with numbers"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            trailingAction={
              <InputTrailingIcon
                name={showNew ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowNew((v) => !v)}
              />
            }
          />
        </Card>

        {/* Password Strength validation guidelines checklist */}
        <Card
          style={{
            gap: theme.spacing.xs,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={{
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Password Strength Requirements
          </AppText>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
            }}
          >
            <Ionicons
              name={
                requirements.length ? "checkmark-circle" : "ellipse-outline"
              }
              size={16}
              color={
                requirements.length ? "#34C759" : theme.colors.textTertiary
              }
            />
            <AppText
              variant="caption"
              style={{
                color: requirements.length
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              }}
            >
              At least 8 characters long
            </AppText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name={
                requirements.number ? "checkmark-circle" : "ellipse-outline"
              }
              size={16}
              color={
                requirements.number ? "#34C759" : theme.colors.textTertiary
              }
            />
            <AppText
              variant="caption"
              style={{
                color: requirements.number
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              }}
            >
              Contains at least one number
            </AppText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name={
                requirements.letter ? "checkmark-circle" : "ellipse-outline"
              }
              size={16}
              color={
                requirements.letter ? "#34C759" : theme.colors.textTertiary
              }
            />
            <AppText
              variant="caption"
              style={{
                color: requirements.letter
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              }}
            >
              Contains letters
            </AppText>
          </View>
        </Card>

        {/* Action Row - Split navigation controls */}
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm,
          }}
        >
          <Button
            style={{ flex: 1 }}
            label="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
          <Button
            style={{ flex: 2 }}
            label="Update Password"
            isLoading={changePassword.isPending}
            loadingLabel="Updating…"
            disabled={!canSubmit}
            onPress={onSubmit}
          />
        </View>

        {/* Data Protection & Privacy Rights Section (NDPA 2023 & App Store Guidelines) */}
        <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Privacy & Data Rights (NDPA)
          </AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary, marginBottom: 4 }}
          >
            Pursuant to the Nigeria Data Protection Act 2023, you have the right to export your records or permanently delete your account.
          </AppText>

          {/* Export Data Button */}
          <Button
            label="Download Personal Data (DSAR)"
            variant="outline"
            isLoading={isExporting}
            loadingLabel="Exporting Data…"
            onPress={handleExportData}
          />

          {/* Delete Account Card */}
          <Card
            style={{
              padding: theme.spacing.md,
              borderColor: theme.colors.error + "40",
              borderWidth: 1,
              backgroundColor: theme.colors.errorSubtle + "30",
              gap: theme.spacing.xs,
              marginTop: theme.spacing.sm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <AppText
                variant="body"
                weight="bold"
                style={{ color: theme.colors.error }}
              >
                Delete Account
              </AppText>
            </View>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textSecondary }}
            >
              Permanently erase your user profile, addresses, credentials, and active shopping sessions. This action cannot be reversed.
            </AppText>
            <Button
              label="Delete My Account"
              variant="outline"
              style={{
                marginTop: theme.spacing.xs,
                borderColor: theme.colors.error,
              }}
              onPress={() => setDeleteSheetVisible(true)}
            />
          </Card>
        </View>

        {/* Account Deletion Confirmation Sheet */}
        <ConfirmSheet
          visible={deleteSheetVisible}
          title="Delete Account Permanently?"
          message="This will immediately revoke all access, delete your personal profile, addresses, and wishlist. Please confirm with your current password."
          confirmLabel="Permanently Delete"
          destructive
          isConfirming={isDeleting}
          onConfirm={handleConfirmDeleteAccount}
          onCancel={() => {
            setDeleteSheetVisible(false);
            setDeletePassword("");
          }}
        >
          <View style={{ marginVertical: theme.spacing.md }}>
            <Input
              label="Enter Password to Confirm"
              placeholder="Your current password"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
          </View>
        </ConfirmSheet>
      </ScrollView>
    </View>
  );
}
