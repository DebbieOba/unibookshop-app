import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import {
  useSuperAdminStaff,
  useSuperAdminRoles,
  useCreateStaff,
} from "../../hooks/useSuperAdmin";
import { AppText } from "../../components/AppText";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Avatar } from "../../components/Avatar";

type Props = NativeStackScreenProps<
  SuperAdminStackParamList,
  "StaffManagement"
>;

export function StaffManagementScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const staff = useSuperAdminStaff();
  const roles = useSuperAdminRoles();
  const createStaffMutation = useCreateStaff();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleAddStaff = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !selectedRoleId
    ) {
      Alert.alert("Error", "Please fill all fields and select a role");
      return;
    }

    try {
      await createStaffMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        roleId: selectedRoleId,
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setSelectedRoleId(null);
      setIsAddModalOpen(false);
      Alert.alert("Success", "Staff member added successfully");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to add staff member",
      );
    }
  };

  const filteredStaff = useMemo(() => {
    if (!staff.data) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return staff.data;
    return staff.data.filter(
      (s) =>
        (s.profile?.fullName || "").toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query),
    );
  }, [staff.data, searchQuery]);

  const loading = staff.isLoading || roles.isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.xl,
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
          <AppText variant="sectionHeader">Platform Staff</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Manage platform workers and dynamic role assignments
          </AppText>
        </View>
        <Button
          label="Add Staff"
          size="small"
          icon="person-add"
          onPress={() => setIsAddModalOpen(true)}
        />
      </View>

      {/* Search Bar */}
      <View
        style={{
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 44,
            borderRadius: theme.radii.input,
            backgroundColor: theme.colors.surfaceAlt,
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            placeholder="Search staff by name or email..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: 14,
            }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingVertical: theme.spacing.xl,
                gap: theme.spacing.sm,
              }}
            >
              <Ionicons
                name="people-outline"
                size={36}
                color={theme.colors.textTertiary}
              />
              <AppText
                variant="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {searchQuery
                  ? "No matching staff members found."
                  : "No staff members added yet."}
              </AppText>
            </View>
          }
          renderItem={({ item }) => {
            const roleName = item.roleRecord?.name || "Staff";
            return (
              <Card
                style={{
                  padding: theme.spacing.lg,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Avatar
                  fullName={item.profile?.fullName ?? "Staff Member"}
                  size={44}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {item.profile?.fullName ?? "Unnamed Staff"}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {item.email}
                  </AppText>
                </View>
                <View
                  style={{
                    backgroundColor: theme.colors.primary + "15",
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                    borderRadius: theme.radii.pill,
                  }}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={{
                      color: theme.colors.primary,
                      fontSize: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {roleName}
                  </AppText>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Add Staff Modal - Full Page Presentation */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="sectionHeader" weight="bold">
                Register New Staff
              </AppText>
              <AppText
                variant="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                Create a global staff account and associate a role
              </AppText>
            </View>
            <Pressable onPress={() => setIsAddModalOpen(false)} hitSlop={12}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Form Scroll Area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              gap: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
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
                placeholder="e.g. John Doe"
                placeholderTextColor={theme.colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                }}
              />
            </View>

            {/* Email */}
            <View style={{ gap: theme.spacing.xs }}>
              <AppText
                variant="label"
                weight="semiBold"
                style={{ color: theme.colors.textSecondary }}
              >
                Email Address
              </AppText>
              <TextInput
                placeholder="e.g. john.doe@bookdeck.app"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                }}
              />
            </View>

            {/* Password */}
            <View style={{ gap: theme.spacing.xs }}>
              <AppText
                variant="label"
                weight="semiBold"
                style={{ color: theme.colors.textSecondary }}
              >
                Password
              </AppText>
              <TextInput
                placeholder="Temporary login password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                }}
              />
            </View>

            {/* Role Picker (Modern Selector Grid instead of Picker dropdown) */}
            <View style={{ gap: theme.spacing.sm }}>
              <AppText
                variant="label"
                weight="semiBold"
                style={{ color: theme.colors.textSecondary }}
              >
                Assign Staff Role
              </AppText>
              {roles.data && roles.data.length > 0 ? (
                <View style={{ gap: theme.spacing.xs }}>
                  {roles.data.map((r) => {
                    const isSelected = selectedRoleId === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => setSelectedRoleId(r.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: theme.spacing.md,
                          borderRadius: theme.radii.input,
                          borderWidth: 1.5,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: isSelected
                            ? theme.colors.primary + "08"
                            : theme.colors.surface,
                          gap: theme.spacing.md,
                        }}
                      >
                        <Ionicons
                          name={
                            isSelected ? "radio-button-on" : "radio-button-off"
                          }
                          size={20}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.textTertiary
                          }
                        />
                        <View style={{ flex: 1, gap: 2 }}>
                          <AppText
                            variant="bodyMedium"
                            weight="bold"
                            style={{
                              color: isSelected
                                ? theme.colors.primary
                                : theme.colors.textPrimary,
                            }}
                          >
                            {r.name}
                          </AppText>
                          {r.description ? (
                            <AppText
                              variant="caption"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {r.description}
                            </AppText>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radii.input,
                    alignItems: "center",
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    No dynamic roles available. Please create a role first.
                  </AppText>
                </View>
              )}
            </View>

            {/* Action button */}
            <Button
              label="Register Staff Account"
              onPress={handleAddStaff}
              isLoading={createStaffMutation.isPending}
              style={{ marginTop: theme.spacing.md }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
