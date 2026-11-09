import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SuperAdminStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { useChangePassword } from "../../hooks/useAuth";
import { AppText } from "../../components/AppText";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Avatar } from "../../components/Avatar";

type Props = NativeStackScreenProps<
  SuperAdminStackParamList,
  "SuperAdminSettings"
>;

export function SuperAdminSettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const clearSession = useAuthStore((s) => s.clearSession);

  const profile = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Profile Edit fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isProfileInitialized, setIsProfileInitialized] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize fields once profile loads
  if (profile.data && !isProfileInitialized) {
    setFullName(profile.data.fullName || "");
    setPhone(profile.data.phone || "");
    setIsProfileInitialized(true);
  }

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile",
      );
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to change password",
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          clearSession();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header with extra safe area top breathing room */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.xl, // Extended top padding
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.md,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="sectionHeader">Settings</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Configure your seller account and credentials
          </AppText>
        </View>
      </View>

      {profile.isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xl,
            gap: theme.spacing.lg,
          }}
        >
          {/* Avatar and Welcome Card */}
          <Card
            style={{
              padding: theme.spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <Avatar fullName={fullName || "Super Seller"} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyMedium" weight="bold">
                {fullName || "Super Seller"}
              </AppText>
              <AppText
                variant="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {profile.data?.user?.email}
              </AppText>
              <AppText
                variant="caption"
                weight="bold"
                style={{
                  color: theme.colors.primary,
                  textTransform: "uppercase",
                  fontSize: 10,
                  marginTop: 2,
                }}
              >
                Global Super Seller
              </AppText>
            </View>
          </Card>

          {/* Edit Profile Section */}
          <View style={{ gap: theme.spacing.sm }}>
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Profile Details
            </AppText>
            <Card
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              {/* Full Name */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Full Name
                </AppText>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={fullName}
                  onChangeText={setFullName}
                  style={{
                    height: 44,
                    borderRadius: theme.radii.input,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.md,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfaceAlt,
                  }}
                />
              </View>

              {/* Phone */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Phone Number
                </AppText>
                <TextInput
                  placeholder="e.g. +2348030000000"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={{
                    height: 44,
                    borderRadius: theme.radii.input,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.md,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfaceAlt,
                  }}
                />
              </View>

              <Button
                label="Save Profile"
                size="small"
                onPress={handleUpdateProfile}
                isLoading={updateProfileMutation.isPending}
              />
            </Card>
          </View>

          {/* Change Password Section */}
          <View style={{ gap: theme.spacing.sm }}>
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Security & Credentials
            </AppText>
            <Card
              style={{
                padding: theme.spacing.lg,
                gap: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              {/* Current Password */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Current Password
                </AppText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    placeholder="Enter current password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: theme.radii.input,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: theme.spacing.md,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: "absolute", right: theme.spacing.md }}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showCurrentPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* New Password */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  New Password
                </AppText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: theme.radii.input,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: theme.spacing.md,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: "absolute", right: theme.spacing.md }}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Confirm New Password
                </AppText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    placeholder="Re-enter new password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: theme.radii.input,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: theme.spacing.md,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: theme.spacing.md }}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <Button
                label="Update Password"
                size="small"
                onPress={handleChangePassword}
                isLoading={changePasswordMutation.isPending}
              />
            </Card>
          </View>

          {/* Logout Button */}
          <Button
            label="Sign Out of Account"
            variant="destructive"
            icon="log-out-outline"
            onPress={handleLogout}
            style={{ marginTop: theme.spacing.md }}
          />
        </ScrollView>
      )}
    </View>
  );
}
