import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import {
  useSuperAdminRoles,
  useSuperAdminPermissions,
  useCreateRole,
  useSetRolePermissions,
} from '../../hooks/useSuperAdmin';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'RoleManagement'>;

export function RoleManagementScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const roles = useSuperAdminRoles();
  const permissionsList = useSuperAdminPermissions();
  const createRoleMutation = useCreateRole();
  const setRolePermissionsMutation = useSetRolePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isPermissionSheetOpen, setIsPermissionSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [checkedPermissionIds, setCheckedPermissionIds] = useState<Record<string, boolean>>({});

  const activeRole = useMemo(() => {
    return roles.data?.find((r) => r.id === selectedRoleId) || null;
  }, [roles.data, selectedRoleId]);

  const handleOpenPermissions = (roleId: string) => {
    setSelectedRoleId(roleId);
    const roleObj = roles.data?.find((r) => r.id === roleId);
    const checkedMap: Record<string, boolean> = {};
    if (roleObj) {
      roleObj.permissions.forEach((rp) => {
        checkedMap[rp.permissionId] = true;
      });
    }
    setCheckedPermissionIds(checkedMap);
    setIsPermissionSheetOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setCheckedPermissionIds((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      Alert.alert('Error', 'Please enter a role name');
      return;
    }
    try {
      await createRoleMutation.mutateAsync({
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || undefined,
      });
      setNewRoleName('');
      setNewRoleDesc('');
      setIsCreateModalOpen(false);
      Alert.alert('Success', 'Role created successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create role');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    const selectedIds = Object.keys(checkedPermissionIds).filter((id) => checkedPermissionIds[id]);
    try {
      await setRolePermissionsMutation.mutateAsync({
        id: selectedRoleId,
        permissionIds: selectedIds,
      });
      setIsPermissionSheetOpen(false);
      Alert.alert('Success', 'Role permissions updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save permissions');
    }
  };

  const groupedPermissions = useMemo(() => {
    const map: Record<string, typeof permissionsList.data> = {};
    permissionsList.data?.forEach((perm) => {
      const parts = perm.action.split(':');
      const category = parts[0]?.toUpperCase() || 'SYSTEM';
      if (!map[category]) map[category] = [];
      map[category].push(perm);
    });
    return map;
  }, [permissionsList.data]);

  const loading = roles.isLoading || permissionsList.isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.xl,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.md,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="sectionHeader">Dynamic Roles</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Assign policy permissions to system staff roles
          </AppText>
        </View>
        <Button
          label="New Role"
          size="small"
          icon="add"
          onPress={() => setIsCreateModalOpen(true)}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={roles.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.sm }}>
              <Ionicons name="shield-outline" size={36} color={theme.colors.textTertiary} />
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>No dynamic roles created yet.</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const permissionCount = item.permissions.length;
            return (
              <Card style={{ padding: theme.spacing.lg, gap: theme.spacing.md, borderColor: theme.colors.border, borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ gap: theme.spacing.xs, flex: 1, marginRight: theme.spacing.md }}>
                    <AppText variant="bodyMedium" weight="bold" style={{ color: theme.colors.textPrimary }}>
                      {item.name}
                    </AppText>
                    {item.description ? (
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                        {item.description}
                      </AppText>
                    ) : null}
                  </View>
                  <View
                    style={{
                      backgroundColor: theme.colors.primary + '15',
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: 4,
                      borderRadius: theme.radii.pill,
                    }}
                  >
                    <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: 11 }}>
                      {permissionCount} {permissionCount === 1 ? 'perm' : 'perms'}
                    </AppText>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }}>
                  <Button
                    label="Edit Permissions"
                    size="small"
                    variant="ghost"
                    icon="options-outline"
                    onPress={() => handleOpenPermissions(item.id)}
                  />
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Permissions Config Modal - Slide-up sheet */}
      <Modal visible={isPermissionSheetOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsPermissionSheetOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1, marginRight: theme.spacing.md }}>
              <AppText variant="sectionHeader" weight="bold">{activeRole?.name}</AppText>
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                Toggle dynamic permissions for this role
              </AppText>
            </View>
            <Pressable onPress={() => setIsPermissionSheetOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {/* Scrollable list of permissions grouped by categories */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: insets.bottom + theme.spacing.xl }}
          >
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <View key={category} style={{ marginBottom: theme.spacing.lg }}>
                {/* Category Header */}
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{
                    color: theme.colors.primary,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {category}
                </AppText>

                {/* Permissions items grouped in a modern card container */}
                <Card style={{ padding: 0, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                  {perms?.map((perm, index) => {
                    const isChecked = !!checkedPermissionIds[perm.id];
                    const isLast = index === (perms.length - 1);
                    return (
                      <Pressable
                        key={perm.id}
                        onPress={() => handleTogglePermission(perm.id)}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: theme.spacing.md,
                          paddingHorizontal: theme.spacing.lg,
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: theme.colors.border,
                        }}
                      >
                        <View style={{ flex: 1, marginRight: theme.spacing.md }}>
                          <AppText variant="bodyMedium" weight="bold">{perm.action}</AppText>
                          {perm.description ? (
                            <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                              {perm.description}
                            </AppText>
                          ) : null}
                        </View>
                        <Switch
                          value={isChecked}
                          onValueChange={() => handleTogglePermission(perm.id)}
                          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                          thumbColor="#FFFFFF"
                        />
                      </Pressable>
                    );
                  })}
                </Card>
              </View>
            ))}
          </ScrollView>

          {/* Fixed Footer with action button */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: insets.bottom + theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Button
              label="Save Permissions"
              onPress={handleSavePermissions}
              isLoading={setRolePermissionsMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      {/* Create Role Modal */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade" onRequestClose={() => setIsCreateModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl }} onPress={() => setIsCreateModalOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%' }}>
            <Card style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" weight="bold">Create Custom Role</AppText>
                <Pressable onPress={() => setIsCreateModalOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <TextInput
                placeholder="Role Name (e.g. Coordinator)"
                placeholderTextColor={theme.colors.textTertiary}
                value={newRoleName}
                onChangeText={setNewRoleName}
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
              <TextInput
                placeholder="Description of this role's purpose"
                placeholderTextColor={theme.colors.textTertiary}
                value={newRoleDesc}
                onChangeText={setNewRoleDesc}
                multiline
                numberOfLines={3}
                style={{
                  height: 80,
                  borderRadius: theme.radii.input,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  paddingTop: theme.spacing.sm,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surfaceAlt,
                  textAlignVertical: 'top',
                }}
              />
              <Button
                label="Create Role"
                onPress={handleCreateRole}
                isLoading={createRoleMutation.isPending}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
