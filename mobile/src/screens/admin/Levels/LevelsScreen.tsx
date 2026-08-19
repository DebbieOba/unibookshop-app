import { useCreateLevel, useDeleteLevel, useLevels } from '../../../hooks/useOrgStructure';
import { AdminResourceList } from '../../../components/AdminResourceList';

export function LevelsScreen() {
  const levels = useLevels();
  const createLevel = useCreateLevel();
  const deleteLevel = useDeleteLevel();

  return (
    <AdminResourceList
      title="Levels"
      description="Manage academic year levels and class stages"
      items={levels.data}
      isLoading={levels.isLoading}
      isAdding={createLevel.isPending}
      onAdd={(name) => createLevel.mutateAsync({ name })}
      onDelete={(id) => deleteLevel.mutateAsync(id)}
      isRefreshing={levels.isFetching && !levels.isLoading}
      onRefresh={() => levels.refetch()}
    />
  );
}
