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
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);

  // Modal controls
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [selectedSchoolIdForDept, setSelectedSchoolIdForDept] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');

  const [isAddLevelOpen, setIsAddLevelOpen] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');

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
    Alert.alert('Confirm Delete', `Are you sure you want to delete ${name}? All associated departments will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSchoolMutation.mutateAsync(id);
            if (expandedSchoolId === id) setExpandedSchoolId(null);
            Alert.alert('Success', 'School deleted successfully');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete school');
          }
        },
      },
    ]);
  };

  const handleAddDept = async () => {
    if (!newDeptName.trim() || !selectedSchoolIdForDept) return;
    try {
      await createDeptMutation.mutateAsync({ schoolId: selectedSchoolIdForDept, name: newDeptName.trim() });
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

  const toggleExpandSchool = (schoolId: string) => {
    setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId);
  };

  const openAddDept = (schoolId: string) => {
    setSelectedSchoolIdForDept(schoolId);
    setIsAddDeptOpen(true);
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
            Academic Levels
          </AppText>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeTab === 'SCHOOLS' ? (
        /* Schools Stacked Accordion List */
        <FlatList
          data={schools.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.sm }}>
              <Ionicons name="school-outline" size={36} color={theme.colors.textTertiary} />
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>No schools added yet.</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedSchoolId === item.id;
            return (
              <Card
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: isExpanded ? theme.colors.primary : theme.colors.border,
                }}
              >
                {/* School Row Trigger */}
                <Pressable
                  onPress={() => toggleExpandSchool(item.id)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: theme.spacing.lg,
                    backgroundColor: isExpanded ? theme.colors.primary + '03' : theme.colors.surface,
                  }}
                >
                  <View style={{ flex: 1, gap: 2, marginRight: theme.spacing.md }}>
                    <AppText variant="bodyMedium" weight="bold">
                      {item.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                      {item.departments.length} {item.departments.length === 1 ? 'Department' : 'Departments'}
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Pressable onPress={() => handleDeleteSchool(item.id, item.name)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </Pressable>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                </Pressable>

                {/* Inline Departments List */}
                {isExpanded ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, padding: theme.spacing.lg, backgroundColor: theme.colors.surfaceAlt }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                      <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase' }}>
                        Departments
                      </AppText>
                      <Button
                        label="Add Dept"
                        size="small"
                        icon="add"
                        onPress={() => openAddDept(item.id)}
                      />
                    </View>

                    {item.departments.length > 0 ? (
                      <View style={{ gap: theme.spacing.sm }}>
                        {item.departments.map((dept) => (
                          <View
                            key={dept.id}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: theme.spacing.md,
                              borderRadius: theme.radii.input,
                              backgroundColor: theme.colors.surface,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                            }}
                          >
                            <AppText variant="bodyMedium" style={{ flex: 1, color: theme.colors.textPrimary }}>
                              {dept.name}
                            </AppText>
                            <Pressable onPress={() => handleDeleteDept(dept.id, dept.name)} hitSlop={8}>
                              <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center', paddingVertical: theme.spacing.md, gap: 4 }}>
                        <Ionicons name="git-branch-outline" size={20} color={theme.colors.textTertiary} />
                        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>No departments created yet.</AppText>
                      </View>
                    )}
                  </View>
                ) : null}
              </Card>
            );
          }}
        />
      ) : (
        /* Levels List Grid */
        <FlatList
          data={levels.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.sm }}>
              <Ionicons name="layers-outline" size={36} color={theme.colors.textTertiary} />
              <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>No academic levels added yet.</AppText>
            </View>
          }
          renderItem={({ item }) => (
            <Card
              style={{
                padding: theme.spacing.lg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <AppText variant="bodyMedium" weight="bold">
                {item.name}
              </AppText>
              <Pressable onPress={() => handleDeleteLevel(item.id, item.name)} hitSlop={8}>
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
