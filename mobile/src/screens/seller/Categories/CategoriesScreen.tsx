import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "../../../hooks/useBooks";
import { SellerResourceList } from "../../../components/SellerResourceList";
import { useAuthStore } from "../../../store/authStore";

export function CategoriesScreen() {
  const { user } = useAuthStore();
  const bookshopId = user?.bookshopId || undefined;

  const categories = useCategories(bookshopId);
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  return (
    <SellerResourceList
      title="Categories"
      description="Manage textbook subject categories"
      items={categories.data || []}
      isLoading={categories.isLoading}
      isAdding={createCategory.isPending}
      onAdd={(name) => createCategory.mutateAsync({ name })}
      onDelete={(id) => deleteCategory.mutateAsync(id)}
      isRefreshing={categories.isFetching && !categories.isLoading}
      onRefresh={() => categories.refetch()}
    />
  );
}
