import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import {
  useBooks,
  useCategories,
  useSubcategories,
  useCreateBook,
  useDeleteBook,
  useUpdateBook,
  useUploadBookCover,
  useUploadBookSample,
} from "../../../hooks/useBooks";
import { useInventory } from "../../../hooks/useDashboard";
import { useToast } from "../../../hooks/useToast";
import { Book } from "../../../types/catalogue";
import { AppText } from "../../../components/AppText";
import { Chip } from "../../../components/Chip";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { SearchBar } from "../../../components/SearchBar";
import { IconButton } from "../../../components/IconButton";
import { BookCard } from "../../../components/BookCard";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton } from "../../../components/Skeleton";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { FilterSheet } from "../../../components/FilterSheet";
import { AdjustStockSheet } from "./AdjustStockSheet";

type StockFilter = "all" | "inStock" | "lowStock" | "outOfStock";

export function SellerBooksScreen() {
  const theme = useTheme();
  const toast = useToast();
  const books = useBooks({ page: 1, limit: 100 });
  const categories = useCategories();
  const inventory = useInventory();

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const uploadCover = useUploadBookCover();
  const uploadSample = useUploadBookSample();

  // Active filter state
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");

  // Draft filter state for FilterSheet
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftStockFilter, setDraftStockFilter] = useState<StockFilter>("all");
  const [draftCategoryId, setDraftCategoryId] = useState<string | undefined>(
    undefined,
  );

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(undefined);
  const subcategories = useSubcategories(categoryId);
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [edition, setEdition] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [condition, setCondition] = useState<"NEW" | "USED">("NEW");
  const [language, setLanguage] = useState("");
  const [pages, setPages] = useState("");
  const [format, setFormat] = useState<"PAPERBACK" | "HARDCOVER" | "EBOOK">(
    "PAPERBACK",
  );
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Action/Confirm Sheet state
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [adjustingStockFor, setAdjustingStockFor] = useState<Book | null>(null);

  const resetForm = () => {
    setEditingBookId(null);
    setTitle("");
    setAuthor("");
    setPrice("");
    setStockQuantity("");
    setCategoryId(undefined);
    setSubcategoryId(undefined);
    setCompareAtPrice("");
    setCostPrice("");
    setIsPreOrder(false);
    setIsbn("");
    setPublisher("");
    setEdition("");
    setPublicationYear("");
    setCondition("NEW");
    setLanguage("");
    setPages("");
    setFormat("PAPERBACK");
    setTags("");
    setIsFormOpen(false);
  };

  const startEditing = (book: Book) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price.toString());
    setStockQuantity(book.stockQuantity.toString());
    setCategoryId(book.categoryId);
    setSubcategoryId(book.subcategoryId || undefined);
    setCompareAtPrice(
      book.compareAtPrice ? book.compareAtPrice.toString() : "",
    );
    setCostPrice(book.costPrice ? book.costPrice.toString() : "");
    setIsPreOrder(!!book.isPreOrder);
    setIsbn(book.isbn || "");
    setPublisher(book.publisher || "");
    setEdition(book.edition || "");
    setPublicationYear(book.publicationYear?.toString() || "");
    setCondition(book.bookCondition === "NEW" ? "NEW" : book.condition || "NEW");
    setLanguage(book.language || "");
    setPages((book.numberOfPages ?? book.pages)?.toString() || "");
    setFormat(book.format || "PAPERBACK");
    setTags(book.tags?.join(", ") || "");
    setIsFormOpen(true);
  };

  const onSubmit = async () => {
    if (
      !title ||
      !author ||
      !price ||
      !stockQuantity ||
      !categoryId ||
      !costPrice
    ) {
      toast("Please fill all required fields");
      return;
    }
    const payload = {
      title,
      author,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      categoryId,
      subcategoryId: subcategoryId || undefined,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPrice: Number(costPrice),
      isPreOrder,
      isbn: isbn || undefined,
      publisher: publisher || undefined,
      edition: edition || undefined,
      publicationYear: publicationYear ? Number(publicationYear) : undefined,
      bookCondition: (condition === "NEW" ? "NEW" : "GOOD") as "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR",
      language: language || undefined,
      numberOfPages: pages ? Number(pages) : undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
    };
    setIsSaving(true);
    try {
      if (editingBookId) {
        await updateBook.mutateAsync({ id: editingBookId, payload });
        toast("Book updated");
      } else {
        const created = await createBook.mutateAsync(payload);
        const picked = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
        if (!picked.canceled) {
          await uploadCover.mutateAsync({
            bookId: created.data.id,
            fileUri: picked.assets[0].uri,
          });
        }
        toast("Book added");
      }
      resetForm();
    } catch {
      toast("Failed to save book");
    } finally {
      setIsSaving(false);
    }
  };

  const threshold = inventory.data?.lowStockThreshold ?? 5;
  const stockStatus = (book: Book): Exclude<StockFilter, "all"> =>
    book.stockQuantity === 0
      ? "outOfStock"
      : book.stockQuantity <= threshold
        ? "lowStock"
        : "inStock";

  const filteredBooks = useMemo(() => {
    let list = books.data?.data ?? [];
    if (stockFilter !== "all")
      list = list.filter((b) => stockStatus(b) === stockFilter);
    if (filterCategoryId)
      list = list.filter((b) => b.categoryId === filterCategoryId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q),
      );
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.data, stockFilter, filterCategoryId, search, threshold]);

  const confirmDelete = () => {
    if (!deletingBook) return;
    deleteBook.mutate(deletingBook.id, {
      onSuccess: () => toast("Book deleted"),
    });
    setDeletingBook(null);
  };

  const bookRows = useMemo(() => {
    const rows: Book[][] = [];
    for (let i = 0; i < filteredBooks.length; i += 2) {
      rows.push(filteredBooks.slice(i, i + 2));
    }
    return rows;
  }, [filteredBooks]);

  const handleOpenFilters = () => {
    setDraftStockFilter(stockFilter);
    setDraftCategoryId(filterCategoryId);
    setFilterSheetOpen(true);
  };

  const handleApplyFilters = () => {
    setStockFilter(draftStockFilter);
    setFilterCategoryId(draftCategoryId);
    setFilterSheetOpen(false);
  };

  const handleClearFilters = () => {
    setDraftStockFilter("all");
    setDraftCategoryId(undefined);
  };

  const isFiltering = stockFilter !== "all" || filterCategoryId !== undefined;

  if (books.isLoading) return <Skeleton height={300} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={books.isFetching && !books.isLoading}
          onRefresh={() => {
            void books.refetch();
            void inventory.refetch();
          }}
          tintColor={theme.colors.adminAccent}
        />
      }
    >
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        {/* Header title */}
        <View style={{ marginBottom: theme.spacing.xs }}>
          <AppText variant="title">Books</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Add, update, and manage campus book catalogue
          </AppText>
        </View>

        {/* Search and Filters Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search title or author"
              debounceMs={0}
            />
          </View>
          <IconButton
            name="options-outline"
            size={22}
            color="#FFFFFF"
            style={{
              borderRadius: 999,
              backgroundColor: theme.colors.primary,
              minHeight: 48,
              minWidth: 48,
            }}
            onPress={handleOpenFilters}
          />
        </View>

        <AppText
          variant="label"
          style={{ color: theme.colors.textTertiary, marginTop: -4 }}
        >
          Tap a book, or its pencil/trash badges, to edit or delete.
        </AppText>

        {bookRows.length === 0 ? (
          books.data?.data.length ? (
            <EmptyState
              icon="search-outline"
              message="No books match these filters"
              subtext="Try a different search or clear the filters."
            />
          ) : (
            <EmptyState
              icon="book-outline"
              message="No books yet."
              subtext="Add your first book above."
            />
          )
        ) : (
          <View style={{ gap: 8 }}>
            {bookRows.map((row) => (
              <View key={row[0].id} style={{ flexDirection: "row", gap: 8 }}>
                {row.map((item) => (
                  <View key={item.id} style={{ flex: 1 }}>
                    <BookCard
                      book={item}
                      width="100%"
                      onPress={() => startEditing(item)}
                      onEditPress={() => startEditing(item)}
                      onDeletePress={() => setDeletingBook(item)}
                    />
                  </View>
                ))}
                {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add/Edit Book Form Modal */}
      <Modal
        visible={isFormOpen}
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.divider,
            }}
          >
            <AppText variant="sectionHeader">
              {editingBookId ? "Edit Book" : "Add New Book"}
            </AppText>
            <TouchableOpacity onPress={resetForm}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <Input
              label="Title *"
              placeholder="e.g. Introduction to Programming"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Author *"
              placeholder="e.g. John Doe"
              value={author}
              onChangeText={setAuthor}
            />
            <Input
              label="Wholesale Cost Price (₦) *"
              placeholder="e.g. 3500"
              keyboardType="numeric"
              value={costPrice}
              onChangeText={setCostPrice}
            />
            <Input
              label="Customer Retail Price (₦) *"
              placeholder="e.g. 5000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
            <Input
              label="Compare At Retail Price (₦, optional)"
              placeholder="e.g. 6000"
              keyboardType="numeric"
              value={compareAtPrice}
              onChangeText={setCompareAtPrice}
            />
            <Input
              label="Initial Stock Quantity *"
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={stockQuantity}
              onChangeText={setStockQuantity}
            />

            {/* New Bookstore Fields */}
            <AppText
              variant="sectionHeader"
              style={{ marginTop: theme.spacing.sm }}
            >
              Book Details (Optional)
            </AppText>
            <Input
              label="ISBN"
              placeholder="e.g. 978-3-16-148410-0"
              value={isbn}
              onChangeText={setIsbn}
            />
            <Input
              label="Publisher"
              placeholder="e.g. Pearson"
              value={publisher}
              onChangeText={setPublisher}
            />
            <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Edition"
                  placeholder="e.g. 3rd Edition"
                  value={edition}
                  onChangeText={setEdition}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Publication Year"
                  placeholder="e.g. 2023"
                  keyboardType="numeric"
                  value={publicationYear}
                  onChangeText={setPublicationYear}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary, marginBottom: 8 }}
                >
                  Condition
                </AppText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Chip
                    variant="seller"
                    label="New"
                    selected={condition === "NEW"}
                    onPress={() => setCondition("NEW")}
                  />
                  <Chip
                    variant="seller"
                    label="Used"
                    selected={condition === "USED"}
                    onPress={() => setCondition("USED")}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <AppText
                  variant="label"
                  weight="semiBold"
                  style={{ color: theme.colors.textSecondary, marginBottom: 8 }}
                >
                  Format
                </AppText>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <Chip
                    variant="seller"
                    label="Paperback"
                    selected={format === "PAPERBACK"}
                    onPress={() => setFormat("PAPERBACK")}
                  />
                  <Chip
                    variant="seller"
                    label="Hardcover"
                    selected={format === "HARDCOVER"}
                    onPress={() => setFormat("HARDCOVER")}
                  />
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.md,
                marginTop: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Input
                  label="Language"
                  placeholder="e.g. English"
                  value={language}
                  onChangeText={setLanguage}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Pages"
                  placeholder="e.g. 350"
                  keyboardType="numeric"
                  value={pages}
                  onChangeText={setPages}
                />
              </View>
            </View>
            <Input
              label="Tags (comma separated)"
              placeholder="e.g. fiction, bestseller, romance"
              value={tags}
              onChangeText={setTags}
            />

            <AppText
              variant="sectionHeader"
              style={{ marginTop: theme.spacing.sm }}
            >
              Settings
            </AppText>
            <Pressable
              onPress={() => setIsPreOrder((v) => !v)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.xs,
              }}
            >
              <AppText variant="bodyMedium" weight="semiBold">
                Pre-order
              </AppText>
              <Ionicons
                name={isPreOrder ? "checkbox" : "square-outline"}
                size={22}
                color={
                  isPreOrder
                    ? theme.colors.adminAccent
                    : theme.colors.textSecondary
                }
              />
            </Pressable>
            <View style={{ gap: theme.spacing.xs }}>
              <AppText
                variant="label"
                weight="semiBold"
                style={{ color: theme.colors.textSecondary }}
              >
                Category
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm,
                }}
              >
                {(categories.data ?? []).map((category) => (
                  <Chip
                    key={category.id}
                    variant="seller"
                    label={category.name}
                    selected={categoryId === category.id}
                    onPress={() => {
                      setCategoryId(category.id);
                      setSubcategoryId(undefined);
                    }}
                  />
                ))}
              </View>
            </View>

            {categoryId && (subcategories.data?.length ?? 0) > 0 ? (
              <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
                <AppText
                  variant="label"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Subcategory / Section
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: theme.spacing.sm,
                  }}
                >
                  {(subcategories.data ?? []).map((sub) => (
                    <Chip
                      key={sub.id}
                      variant="seller"
                      label={sub.name}
                      selected={subcategoryId === sub.id}
                      onPress={() =>
                        setSubcategoryId(
                          subcategoryId === sub.id ? undefined : sub.id
                        )
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View
              style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}
            >
              <Button
                tone="seller"
                label={
                  editingBookId ? "Update Book" : "Add Book (pick cover next)"
                }
                isLoading={isSaving}
                loadingLabel="Saving…"
                onPress={onSubmit}
              />
              {editingBookId ? (
                <Button
                  label="Adjust Stock"
                  tone="seller"
                  variant="outline"
                  onPress={() => {
                    const book = books.data?.data.find(
                      (b) => b.id === editingBookId,
                    );
                    if (book) setAdjustingStockFor(book);
                  }}
                />
              ) : null}
              {editingBookId ? (
                <Button
                  label="Upload Sample Image"
                  tone="seller"
                  variant="outline"
                  onPress={async () => {
                    const picked = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
                      quality: 0.7,
                    });
                    if (!picked.canceled) {
                      await uploadSample.mutateAsync({
                        bookId: editingBookId,
                        fileUri: picked.assets[0].uri,
                      });
                      toast("Sample image uploaded");
                    }
                  }}
                />
              ) : null}
              <Button
                label="Cancel"
                tone="seller"
                variant="outline"
                onPress={resetForm}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Advanced Custom Filter Sheet */}
      <FilterSheet
        visible={filterSheetOpen}
        title="Filter Books"
        onClose={() => setFilterSheetOpen(false)}
        onClearAll={handleClearFilters}
        onApply={handleApplyFilters}
        resultLabel="Apply Filters"
      >
        {/* Stock Status Section */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText
            variant="label"
            weight="bold"
            style={{
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            Filter by Stock Status
          </AppText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
            }}
          >
            <Chip
              variant="seller"
              label="All"
              selected={draftStockFilter === "all"}
              onPress={() => setDraftStockFilter("all")}
            />
            <Chip
              variant="seller"
              label="In stock"
              selected={draftStockFilter === "inStock"}
              onPress={() => setDraftStockFilter("inStock")}
            />
            <Chip
              variant="seller"
              label="Low stock"
              selected={draftStockFilter === "lowStock"}
              onPress={() => setDraftStockFilter("lowStock")}
            />
            <Chip
              variant="seller"
              label="Out of stock"
              selected={draftStockFilter === "outOfStock"}
              onPress={() => setDraftStockFilter("outOfStock")}
            />
          </View>
        </View>

        {/* Category Section */}
        <View style={{ gap: theme.spacing.sm }}>
          <AppText
            variant="label"
            weight="bold"
            style={{
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            Filter by Category
          </AppText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
            }}
          >
            <Chip
              variant="seller"
              label="All Categories"
              selected={draftCategoryId === undefined}
              onPress={() => setDraftCategoryId(undefined)}
            />
            {(categories.data ?? []).map((category) => (
              <Chip
                key={category.id}
                variant="seller"
                label={category.name}
                selected={draftCategoryId === category.id}
                onPress={() => setDraftCategoryId(category.id)}
              />
            ))}
          </View>
        </View>
      </FilterSheet>

      <ConfirmSheet
        visible={!!deletingBook}
        title="Delete this book?"
        message={
          deletingBook
            ? `"${deletingBook.title}" will be permanently removed from the catalogue.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        isConfirming={deleteBook.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingBook(null)}
      />

      {adjustingStockFor ? (
        <AdjustStockSheet
          visible={!!adjustingStockFor}
          bookId={adjustingStockFor.id}
          bookTitle={adjustingStockFor.title}
          currentStock={adjustingStockFor.stockQuantity}
          onClose={() => setAdjustingStockFor(null)}
        />
      ) : null}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsFormOpen(true)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 99,
        }}
      >
        <Ionicons name="add" size={28} color={theme.colors.textInverse} />
      </TouchableOpacity>
    </ScrollView>
  );
}
