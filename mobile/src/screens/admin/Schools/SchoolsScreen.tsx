import { useCreateSchool, useDeleteSchool, useSchools } from '../../../hooks/useOrgStructure';
import { AdminResourceList } from '../../../components/AdminResourceList';

export function SchoolsScreen() {
  const schools = useSchools();
  const createSchool = useCreateSchool();
  const deleteSchool = useDeleteSchool();

  return (
    <AdminResourceList
      title="Schools"
      description="Manage active campus school environments"
      items={schools.data}
      isLoading={schools.isLoading}
      isAdding={createSchool.isPending}
      onAdd={(name) => createSchool.mutateAsync({ name })}
      onDelete={(id) => deleteSchool.mutateAsync(id)}
      isRefreshing={schools.isFetching && !schools.isLoading}
      onRefresh={() => schools.refetch()}
    />
  );
}
