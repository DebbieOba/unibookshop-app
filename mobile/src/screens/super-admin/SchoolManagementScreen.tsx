import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import {
  useSuperAdminSchools,
  useSuperAdminLevels,
  useCreateSchool,
  useDeleteSchool,
  useCreateDepartment,
  useDeleteDepartment,
  useCreateLevel,
  useDeleteLevel,
} from '../../hooks/useSuperAdmin';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'SchoolManagement'>;

export function SchoolManagementScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const schools = useSuperAdminSchools();
  const levels = useSuperAdminLevels();

  const createSchoolMutation = useCreateSchool();
  const deleteSchoolMutation = useDeleteSchool();
  const createDeptMutation = useCreateDepartment();
  const deleteDeptMutation = useDeleteDepartment();
  const createLevelMutation = useCreateLevel();
  const deleteLevelMutation = useDeleteLevel();

  const [activeTab, setActiveTab] = useState<'SCHOOLS' | 'LEVELS'>('SCHOOLS');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Modal controls
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [isAddLevelOpen, setIsAddLevelOpen] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');

  const activeSchool = useMemo(() => {
    return schools.data?.find((s) => s.id === selectedSchoolId) || null;
  }, [schools.data, selectedSchoolId]);

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) return;
    try {
      await createSchoolMutation.mutateAsync({ name: newSchoolName.trim() });
      setNewSchoolName('');
      setIsAddSchoolOpen(false);
      Alert.alert('Success', 'School added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add school');
    }
  };

  const handleDeleteSchool = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Are you sure you want to delete ${name}? All associated departments will be affected.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSchoolMutation.mutateAsync(id);
            if (selectedSchoolId === id) setSelectedSchoolId(null);
            Alert.alert('Success', 'School deleted successfully');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete school');
          }
        },
      },
    ]);
  };

  const handleAddDept = async () => {
    if (!newDeptName.trim() || !selectedSchoolId) return;
    try {
      await createDeptMutation.mutateAsync({ schoolId: selectedSchoolId, name: newDeptName.trim() });
      setNewDeptName('');
      setIsAddDeptOpen(false);
      Alert.alert('Success', 'Department added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add department');
    }
  };

  const handleDeleteDept = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDeptMutation.mutateAsync(id);
            Alert.alert('Success', 'Department deleted');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete department');
          }
        },
      },
    ]);
  };

  const handleAddLevel = async () => {
    if (!newLevelName.trim()) return;
    try {
      await createLevelMutation.mutateAsync({ name: newLevelName.trim() });
      setNewLevelName('');
      setIsAddLevelOpen(false);
      Alert.alert('Success', 'Level added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add level');
    }
  };

  const handleDeleteLevel = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLevelMutation.mutateAsync(id);
            Alert.alert('Success', 'Level deleted');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete level');
          }
        },
      },
    ]);
  };

  const loading = schools.isLoading || levels.isLoading;

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
          <AppText variant="sectionHeader">School Console</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Configure schools, departments, and level contexts
          </AppText>
        </View>
        <Button
          label={activeTab === 'SCHOOLS' ? 'New School' : 'New Level'}
          size="small"
          icon="add"
          onPress={() => (activeTab === 'SCHOOLS' ? setIsAddSchoolOpen(true) : setIsAddLevelOpen(true))}
        />
      </View>

      {/* Tabs Selector */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <Pressable
          onPress={() => setActiveTab('SCHOOLS')}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            borderBottomWidth: activeTab === 'SCHOOLS' ? 2 : 0,
            borderBottomColor: theme.colors.primary,
          }}
        >
          <AppText variant="bodyMedium" weight="bold" style={{ color: activeTab === 'SCHOOLS' ? theme.colors.primary : theme.colors.textSecondary }}>
            Schools & Depts
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('LEVELS')}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            borderBottomWidth: activeTab === 'LEVELS' ? 2 : 0,
            borderBottomColor: theme.colors.primary,
          }}
        >
          <AppText variant="bodyMedium" weight="bold" style={{ color: activeTab === 'LEVELS' ? theme.colors.primary : theme.colors.textSecondary }}>
            Levels
          </AppText>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeTab === 'SCHOOLS' ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Schools List Panel */}
          <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: theme.colors.border, padding: theme.spacing.md }}>
            <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase' }}>
              Schools
            </AppText>
            <FlatList
              data={schools.data}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.sm }}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedSchoolId;
                return (
                  <Pressable onPress={() => setSelectedSchoolId(item.id)}>
                    <Card
                      style={{
                        padding: theme.spacing.md,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                        backgroundColor: isSelected ? theme.colors.primary + '08' : theme.colors.surface,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AppText variant="bodyMedium" weight="bold" style={{ flex: 1, color: isSelected ? theme.colors.primary : theme.colors.textPrimary }}>
                          {item.name}
                        </AppText>
                        <Pressable onPress={() => handleDeleteSchool(item.id, item.name)} hitSlop={6}>
                          <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                        </Pressable>
                      </View>
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
                        {item.departments.length} {item.departments.length === 1 ? 'Dept' : 'Depts'}
                      </AppText>
                    </Card>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Departments List Panel */}
          <View style={{ flex: 1.2, padding: theme.spacing.md }}>
            {activeSchool ? (
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium" weight="bold">
                      {activeSchool.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                      Manage departments
                    </AppText>
                  </View>
                  <Button
                    label="Add Dept"
                    size="small"
                    icon="add"
                    onPress={() => setIsAddDeptOpen(true)}
                  />
                </View>

                <FlatList
                  data={activeSchool.departments}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ gap: theme.spacing.sm }}
                  ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.xs }}>
                      <Ionicons name="git-branch-outline" size={24} color={theme.colors.textTertiary} />
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                        No departments added yet
                      </AppText>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <Card
                      style={{
                        padding: theme.spacing.md,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.colors.surfaceAlt,
                      }}
                    >
                      <AppText variant="bodyMedium" style={{ flex: 1 }}>
                        {item.name}
                      </AppText>
                      <Pressable onPress={() => handleDeleteDept(item.id, item.name)} hitSlop={6}>
                        <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                      </Pressable>
                    </Card>
                  )}
                />
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="school" size={32} color={theme.colors.textTertiary} />
                <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                  Select a school on the left to configure departments.
                </AppText>
              </View>
            )}
          </View>
        </View>
      ) : (
        /* Levels List */
        <FlatList
          data={levels.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>No levels added yet</AppText>
            </View>
          }
          renderItem={({ item }) => (
            <Card
              style={{
                padding: theme.spacing.md,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <AppText variant="bodyMedium" weight="bold">
                {item.name}
              </AppText>
              <Pressable onPress={() => handleDeleteLevel(item.id, item.name)} hitSlop={6}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </Pressable>
            </Card>
          )}
        />
      )}

      {/* Add School Modal */}
      <Modal visible={isAddSchoolOpen} transparent animationType="fade" onRequestClose={() => setIsAddSchoolOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl }} onPress={() => setIsAddSchoolOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%' }}>
            <Card style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" weight="bold">Add Global School</AppText>
                <Pressable onPress={() => setIsAddSchoolOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <TextInput
                placeholder="e.g. School of Engineering"
                placeholderTextColor={theme.colors.textTertiary}
                value={newSchoolName}
                onChangeText={setNewSchoolName}
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
              <Button
                label="Add School"
                onPress={handleAddSchool}
                isLoading={createSchoolMutation.isPending}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Department Modal */}
      <Modal visible={isAddDeptOpen} transparent animationType="fade" onRequestClose={() => setIsAddDeptOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl }} onPress={() => setIsAddDeptOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%' }}>
            <Card style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" weight="bold">Add Department</AppText>
                <Pressable onPress={() => setIsAddDeptOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <TextInput
                placeholder="e.g. Civil Engineering"
                placeholderTextColor={theme.colors.textTertiary}
                value={newDeptName}
                onChangeText={setNewDeptName}
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
              <Button
                label="Add Department"
                onPress={handleAddDept}
                isLoading={createDeptMutation.isPending}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Level Modal */}
      <Modal visible={isAddLevelOpen} transparent animationType="fade" onRequestClose={() => setIsAddLevelOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl }} onPress={() => setIsAddLevelOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%' }}>
            <Card style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="bodyMedium" weight="bold">Add Global Level</AppText>
                <Pressable onPress={() => setIsAddLevelOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <TextInput
                placeholder="e.g. 600 Level"
                placeholderTextColor={theme.colors.textTertiary}
                value={newLevelName}
                onChangeText={setNewLevelName}
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
              <Button
                label="Add Level"
                onPress={handleAddLevel}
                isLoading={createLevelMutation.isPending}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
