import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Local state for permissions checklist when a role is selected
  const [checkedPermissionIds, setCheckedPermissionIds] = useState<Record<string, boolean>>({});

  const activeRole = useMemo(() => {
    return roles.data?.find((r) => r.id === selectedRoleId) || null;
  }, [roles.data, selectedRoleId]);

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const roleObj = roles.data?.find((r) => r.id === roleId);
    const checkedMap: Record<string, boolean> = {};
    if (roleObj) {
      roleObj.permissions.forEach((rp) => {
        checkedMap[rp.permissionId] = true;
      });
    }
    setCheckedPermissionIds(checkedMap);
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
      Alert.alert('Success', 'Role permissions updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save permissions');
    }
  };

  const loading = roles.isLoading || permissionsList.isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.md,
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
            Configure custom system access settings
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
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Left panel: list of roles */}
          <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: theme.colors.border, padding: theme.spacing.md }}>
            <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase' }}>
              Roles List
            </AppText>
            <FlatList
              data={roles.data}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.sm }}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedRoleId;
                return (
                  <Pressable onPress={() => handleSelectRole(item.id)}>
                    <Card
                      style={{
                        padding: theme.spacing.md,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                        backgroundColor: isSelected ? theme.colors.primary + '08' : theme.colors.surface,
                      }}
                    >
                      <AppText variant="bodyMedium" weight="bold" style={{ color: isSelected ? theme.colors.primary : theme.colors.textPrimary }}>
                        {item.name}
                      </AppText>
                      {item.description ? (
                        <AppText variant="caption" numberOfLines={1} style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                          {item.description}
                        </AppText>
                      ) : null}
                    </Card>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Right panel: Role details / permissions setup */}
          <View style={{ flex: 1.2, padding: theme.spacing.md }}>
            {activeRole ? (
              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: theme.spacing.md }}>
                  <AppText variant="bodyMedium" weight="bold">
                    {activeRole.name} Settings
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                    Tweak system privileges for this role
                  </AppText>
                </View>

                {/* Permissions checklist */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: theme.spacing.md }}>
                  <View style={{ gap: theme.spacing.sm }}>
                    {permissionsList.data?.map((perm) => {
                      const isChecked = !!checkedPermissionIds[perm.id];
                      return (
                        <Pressable key={perm.id} onPress={() => handleTogglePermission(perm.id)}>
                          <Card
                            style={{
                              padding: theme.spacing.sm,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: theme.spacing.sm,
                              backgroundColor: theme.colors.surfaceAlt,
                            }}
                          >
                            <Ionicons
                              name={isChecked ? 'checkbox' : 'square-outline'}
                              size={20}
                              color={isChecked ? theme.colors.primary : theme.colors.textTertiary}
                            />
                            <View style={{ flex: 1, gap: 1 }}>
                              <AppText variant="bodyMedium" weight="bold" style={{ fontSize: 13 }}>
                                {perm.action}
                              </AppText>
                              {perm.description ? (
                                <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                                  {perm.description}
                                </AppText>
                              ) : null}
                            </View>
                          </Card>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Save action */}
                <Button
                  label="Save Permissions"
                  onPress={handleSavePermissions}
                  isLoading={setRolePermissionsMutation.isPending}
                />
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="key" size={32} color={theme.colors.textTertiary} />
                <AppText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                  Select a role on the left to configure system permissions.
                </AppText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Create Role Modal */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade" onRequestClose={() => setIsCreateModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl }} onPress={() => setIsCreateModalOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.card, padding: theme.spacing.xl, gap: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="bodyMedium" weight="bold">Create Custom Role</AppText>
              <Pressable onPress={() => setIsCreateModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Role Name</AppText>
              <TextInput
                placeholder="e.g. Support Specialist"
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
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Description (Optional)</AppText>
              <TextInput
                placeholder="What privileges does this role grant..."
                placeholderTextColor={theme.colors.textTertiary}
                value={newRoleDesc}
                onChangeText={setNewRoleDesc}
                multiline
                numberOfLines={3}
                style={{
                  minHeight: 80,
                  textAlignVertical: 'top',
                  borderRadius: theme.radii.input,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: theme.spacing.md,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
              />
            </View>

            <Button
              label="Create Role"
              onPress={handleCreateRole}
              isLoading={createRoleMutation.isPending}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
