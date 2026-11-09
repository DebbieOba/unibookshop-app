import { useState, useMemo } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import {
  useApplyPromoCode,
  useCart,
  useRemovePromoCode,
  useSetCartLine,
} from "../../../hooks/useCart";
import {
  useFavourites,
  useToggleFavourite,
} from "../../../hooks/useFavourites";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { IconButton } from "../../../components/IconButton";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";
import { getBookPlaceholderCover } from "../../../components/BookCard";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "../../../hooks/useToast";

type Props = NativeStackScreenProps<CustomerStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const cart = useCart();
  const setCartLine = useSetCartLine();
  const favourites = useFavourites();
  const toggleFavourite = useToggleFavourite();
  const applyPromoCode = useApplyPromoCode();
  const removePromoCode = useRemovePromoCode();

  const [removingLine, setRemovingLine] = useState<{
    bookId: string;
    title: string;
  } | null>(null);
  const [promoInput, setPromoInput] = useState("");

  const items = cart.data?.items ?? [];

  const confirmRemove = () => {
    if (!removingLine) return;
    setCartLine.mutate({ bookId: removingLine.bookId, quantity: 0 });
    setRemovingLine(null);
  };

  const handleSaveForLater = (bookId: string, title: string) => {
    // 1. Add to favourites
    toggleFavourite.mutate(
      { bookId, isFavourited: false },
      {
        onSuccess: () => {
          // 2. Remove from cart
          setCartLine.mutate(
            { bookId, quantity: 0 },
            {
              onSuccess: () => {
                toast(`Saved "${title}" to favourites`);
              },
            },
          );
        },
        onError: () => {
          toast("Could not save to favourites", "error");
        },
      },
    );
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) return;
    applyPromoCode.mutate(code, {
      onSuccess: (updatedCart) => {
        toast(`Promo code applied: ${updatedCart.promoCode}`, "success");
        setPromoInput("");
      },
      onError: () => toast("Invalid or expired promo code", "error"),
    });
  };

  const handleRemovePromo = () => {
    removePromoCode.mutate(undefined, {
      onSuccess: () => toast("Promo code removed"),
    });
  };

  const totals = useMemo(
    () => ({
      rawTotal: cart.data?.subtotal ?? 0,
      discountAmount: cart.data?.discountAmount ?? 0,
      finalTotal: cart.data?.total ?? 0,
    }),
    [cart.data],
  );
  const appliedPromo = cart.data?.promoCode ?? null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      {cart.isLoading ? (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : cart.isError ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <ErrorState onRetry={() => cart.refetch()} />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.bookId}
            contentContainerStyle={{
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.md,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                type="info"
                icon="cart-outline"
                message="Your cart is empty."
                subtext="Browse the campus catalogue to add required course syllabus textbooks."
                actionLabel="Explore Store"
                onAction={() =>
                  navigation.navigate("CustomerTabs", { screen: "Store" })
                }
              />
            }
            renderItem={({ item }) => {
              const coverPlaceholder = getBookPlaceholderCover(item.book.title);
              return (
                <Card
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    padding: theme.spacing.sm,
                  }}
                >
                  <Image
                    source={coverPlaceholder}
                    style={{
                      width: 44,
                      aspectRatio: 2 / 3,
                      borderRadius: 8,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      numberOfLines={2}
                    >
                      {item.book.title}
                    </AppText>
                    <AppText
                      variant="price"
                      style={{ color: theme.colors.primary, fontSize: 13 }}
                    >
                      ₦{(item.book.price * item.quantity).toLocaleString()}
                    </AppText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {/* Save for later icon button */}
                    <IconButton
                      name="heart-outline"
                      color={theme.colors.primary}
                      onPress={() =>
                        handleSaveForLater(item.bookId, item.book.title)
                      }
                      style={{ minHeight: 32, minWidth: 32 }}
                    />

                    <IconButton
                      name="remove-circle-outline"
                      disabled={item.quantity <= 1}
                      onPress={() =>
                        setCartLine.mutate({
                          bookId: item.bookId,
                          quantity: item.quantity - 1,
                        })
                      }
                      style={{ minHeight: 32, minWidth: 32 }}
                    />
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      style={{ paddingHorizontal: 2 }}
                    >
                      {item.quantity}
                    </AppText>
                    <IconButton
                      name="add-circle-outline"
                      onPress={() =>
                        setCartLine.mutate({
                          bookId: item.bookId,
                          quantity: item.quantity + 1,
                        })
                      }
                      style={{ minHeight: 32, minWidth: 32 }}
                    />
                    <IconButton
                      name="trash-outline"
                      color={theme.colors.error}
                      onPress={() =>
                        setRemovingLine({
                          bookId: item.bookId,
                          title: item.book.title,
                        })
                      }
                      style={{ minHeight: 32, minWidth: 32 }}
                    />
                  </View>
                </Card>
              );
            }}
          />

          {/* Checkout Info block */}
          {items.length > 0 ? (
            <View
              style={{ paddingBottom: theme.spacing.xl, gap: theme.spacing.md }}
            >
              {/* Interactive Promo Code box */}
              {appliedPromo ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: 16,
                    height: 44,
                  }}
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {appliedPromo} applied
                  </AppText>
                  <Button
                    label="Remove"
                    variant="text"
                    size="small"
                    isLoading={removePromoCode.isPending}
                    onPress={handleRemovePromo}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.xs,
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    placeholder="Enter Promo Code (e.g. FUTA10)"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={promoInput}
                    onChangeText={setPromoInput}
                    autoCapitalize="characters"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 16,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surface,
                      fontSize: 13,
                    }}
                  />
                  <Button
                    label="Apply"
                    isLoading={applyPromoCode.isPending}
                    loadingLabel="Applying…"
                    onPress={handleApplyPromo}
                    style={{
                      height: 44,
                      borderRadius: 999,
                      paddingHorizontal: 16,
                    }}
                  />
                </View>
              )}

              {/* Total Calculation summary card */}
              <Card
                style={{
                  gap: theme.spacing.xs,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Subtotal
                  </AppText>
                  <AppText variant="bodyMedium" weight="bold">
                    ₦{totals.rawTotal.toLocaleString()}
                  </AppText>
                </View>

                {appliedPromo ? (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: "#34C759", fontWeight: "bold" }}
                    >
                      Discount ({appliedPromo})
                    </AppText>
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      style={{ color: "#34C759" }}
                    >
                      - ₦{totals.discountAmount.toLocaleString()}
                    </AppText>
                  </View>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    paddingTop: theme.spacing.xs,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  <AppText variant="sectionHeader">Final Total</AppText>
                  <AppText
                    variant="priceLarge"
                    style={{ color: theme.colors.primary }}
                  >
                    ₦{totals.finalTotal.toLocaleString()}
                  </AppText>
                </View>
              </Card>

              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <Button
                  style={{ flex: 1, borderRadius: 999 }}
                  label="Back"
                  variant="outline"
                  onPress={() => navigation.goBack()}
                />
                <Button
                  style={{ flex: 2, borderRadius: 999 }}
                  label="Proceed to Checkout"
                  disabled={items.length === 0}
                  onPress={() => navigation.navigate("Checkout")}
                />
              </View>
            </View>
          ) : null}
        </>
      )}

      <ConfirmSheet
        visible={!!removingLine}
        title="Remove this book?"
        message={
          removingLine
            ? `"${removingLine.title}" will be removed from your cart.`
            : ""
        }
        confirmLabel="Remove"
        destructive
        isConfirming={setCartLine.isPending}
        onConfirm={confirmRemove}
        onCancel={() => setRemovingLine(null)}
      />
    </View>
  );
}
