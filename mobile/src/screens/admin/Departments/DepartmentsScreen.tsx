import { useState } from 'react';
import { View } from 'react-native';
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useSchools,
} from '../../../hooks/useOrgStructure';
import { useTheme } from '../../../hooks/useTheme';
import { AdminResourceList } from '../../../components/AdminResourceList';
import { AppText } from '../../../components/AppText';
import { Chip } from '../../../components/Chip';

export function DepartmentsScreen() {
  const theme = useTheme();
  const departments = useDepartments();
  const schools = useSchools();
  const createDepartment = useCreateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);

  return (
    <AdminResourceList
      title="Departments"
      description="Manage course departments and faculties"
      items={departments.data}
      isLoading={departments.isLoading}
      isAdding={createDepartment.isPending}
      onAdd={(name) => {
        if (!schoolId) {
          return Promise.reject(new Error('Select a school first'));
        }
        return createDepartment.mutateAsync({ name, schoolId });
      }}
      onDelete={(id) => deleteDepartment.mutateAsync(id)}
      isRefreshing={departments.isFetching && !departments.isLoading}
      onRefresh={() => departments.refetch()}
      addFormExtra={
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label">School</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {(schools.data ?? []).map((school) => (
              <Chip
                key={school.id}
                variant="admin"
                label={school.name}
                selected={schoolId === school.id}
                onPress={() => setSchoolId(school.id)}
              />
            ))}
          </View>
        </View>
      }
    />
  );
}
