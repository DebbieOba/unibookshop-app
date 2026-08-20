import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import {
  useSuperAdminStaff,
  useSuperAdminRoles,
  useCreateStaff,
} from '../../hooks/useSuperAdmin';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'StaffManagement'>;

export function StaffManagementScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const staff = useSuperAdminStaff();
  const roles = useSuperAdminRoles();
  const createStaffMutation = useCreateStaff();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleAddStaff = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !selectedRoleId) {
      Alert.alert('Error', 'Please fill all fields and select a role');
      return;
    }

    try {
      await createStaffMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        roleId: selectedRoleId,
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setSelectedRoleId(null);
      setIsAddModalOpen(false);
      Alert.alert('Success', 'Staff member added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add staff member');
    }
  };

  const loading = staff.isLoading || roles.isLoading;

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
          <AppText variant="sectionHeader">Platform Staff</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
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

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={staff.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.xs }}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
              <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
                No staff members registered yet.
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" weight="bold">
                  {item.profile?.fullName ?? 'Anonymous Worker'}
                </AppText>
                <View
                  style={{
                    backgroundColor: theme.colors.primary + '12',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                  }}
                >
                  <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: 10 }}>
                    {item.roleRecord?.name ?? 'System Staff'}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                {item.email}
              </AppText>
            </Card>
          )}
        />
      )}

      {/* Add Staff Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setIsAddModalOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radii.card, borderTopRightRadius: theme.radii.card, padding: theme.spacing.xl, gap: theme.spacing.md, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="bodyMedium" weight="bold">Add Global Staff</AppText>
              <Pressable onPress={() => setIsAddModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.md }}>
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Full Name</AppText>
                <TextInput
                  placeholder="e.g. John Doe"
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

              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Email Address</AppText>
                <TextInput
                  placeholder="e.g. worker@curricula.test"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Default Password</AppText>
                <TextInput
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.colors.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
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
                <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary }}>Assign System Role</AppText>
                <View style={{ gap: theme.spacing.xs }}>
                  {roles.data?.map((role) => {
                    const isSelected = selectedRoleId === role.id;
                    return (
                      <Pressable key={role.id} onPress={() => setSelectedRoleId(role.id)}>
                        <Card
                          style={{
                            padding: theme.spacing.sm,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            borderWidth: isSelected ? 1.5 : 1,
                            backgroundColor: isSelected ? theme.colors.primary + '08' : theme.colors.surface,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <AppText variant="bodyMedium" weight="bold" style={{ fontSize: 13 }}>{role.name}</AppText>
                            {role.description ? (
                              <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 1 }}>
                                {role.description}
                              </AppText>
                            ) : null}
                          </View>
                          <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
                          />
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Button
                label="Register Staff Account"
                onPress={handleAddStaff}
                isLoading={createStaffMutation.isPending}
                style={{ marginTop: theme.spacing.sm }}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
