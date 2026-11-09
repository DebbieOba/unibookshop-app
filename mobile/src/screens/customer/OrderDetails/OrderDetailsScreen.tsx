import { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useOrder } from "../../../hooks/useOrders";
import { OrderStatus } from "../../../types/order";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { StatusPill } from "../../../components/StatusPill";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";
import { getBookPlaceholderCover } from "../../../components/BookCard";

type Props = NativeStackScreenProps<CustomerStackParamList, "OrderDetails">;

interface TimelineStep {
  status: OrderStatus;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    status: "PROCESSING",
    label: "Order Placed",
    desc: "Your collection request has been confirmed.",
    icon: "document-text-outline",
  },
  {
    status: "PROCESSING",
    label: "Preparing Booklets",
    desc: "Store managers are picking and sorting your books.",
    icon: "cube-outline",
  },
  {
    status: "COMPLETED",
    label: "Ready for Collection",
    desc: "Books are sorted and held at the school desk.",
    icon: "storefront-outline",
  },
  {
    status: "COMPLETED",
    label: "Collected",
    desc: "Receipt signed and books picked up.",
    icon: "checkmark-circle-outline",
  },
];

export function OrderDetailsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const orderId = route.params.orderId;
  const order = useOrder(orderId);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (order.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <Skeleton height={60} />
        <Skeleton height={200} />
        <Skeleton height={200} />
      </View>
    );
  }

  if (order.isError || !order.data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + theme.spacing.lg,
        }}
      >
        <ErrorState onRetry={() => order.refetch()} />
      </View>
    );
  }

  const data = order.data;
  const isCancelled = data.status === "CANCELLED";
  const date = new Date(data.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Branded Header Overlaid */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          paddingTop: insets.top + theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            padding: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </Pressable>
        <View>
          <AppText variant="sectionHeader">Order Review</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            ID: #{data.id.slice(0, 8).toUpperCase()}
          </AppText>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 60,
          gap: theme.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Header details */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textSecondary }}
            >
              Placed On
            </AppText>
            <AppText variant="bodyMedium" weight="bold">
              {date}
            </AppText>
          </View>
          <StatusPill status={data.status} />
        </View>

        {/* Milestone Timeline section */}
        <Card style={{ gap: theme.spacing.md }}>
          <AppText variant="sectionHeader">Order Timeline</AppText>

          {isCancelled ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                backgroundColor: theme.colors.error + "10",
                padding: theme.spacing.md,
                borderRadius: 12,
              }}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={theme.colors.error}
              />
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={{ color: theme.colors.error }}
                >
                  Order Cancelled
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: theme.colors.error }}
                >
                  This order was cancelled by the store managers.
                </AppText>
              </View>
            </View>
          ) : (
            <View
              style={{
                position: "relative",
                paddingLeft: 12,
                gap: theme.spacing.lg,
              }}
            >
              {/* Connecting rail line */}
              <View
                style={{
                  position: "absolute",
                  left: 21,
                  top: 16,
                  bottom: 16,
                  width: 2,
                  backgroundColor: theme.colors.border,
                }}
              />

              {TIMELINE_STEPS.map((step, index) => {
                // Compute reached milestone status
                const isCompleted = data.status === "COMPLETED";
                const isProcessing = data.status === "PROCESSING";

                let reached = false;
                if (index === 0) reached = true; // Always placed
                if (index === 1 && (isProcessing || isCompleted))
                  reached = true; // Preparing
                if (index === 2 && isCompleted) reached = true; // Ready
                if (index === 3 && isCompleted) reached = true; // Collected

                const activeColor = reached
                  ? theme.colors.primary
                  : theme.colors.border;

                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.md,
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: reached
                          ? theme.colors.primary
                          : theme.colors.surfaceAlt,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: reached ? 0 : 2,
                        borderColor: theme.colors.border,
                        zIndex: 2,
                      }}
                    >
                      <Ionicons
                        name={reached ? "checkmark" : "ellipse"}
                        size={reached ? 12 : 6}
                        color={reached ? "#FFFFFF" : theme.colors.textTertiary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                        }}
                      >
                        <Ionicons
                          name={step.icon}
                          size={16}
                          color={
                            reached
                              ? theme.colors.primary
                              : theme.colors.textTertiary
                          }
                        />
                        <AppText
                          variant="bodyMedium"
                          weight="bold"
                          style={{
                            color: reached
                              ? theme.colors.textPrimary
                              : theme.colors.textTertiary,
                          }}
                        >
                          {step.label}
                        </AppText>
                      </View>
                      <AppText
                        variant="caption"
                        style={{
                          color: theme.colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {step.desc}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Ordered Booklets receipt */}
        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Syllabus Materials</AppText>
          <View style={{ gap: theme.spacing.md }}>
            {data.items.map((item) => {
              const coverPlaceholder = getBookPlaceholderCover(
                item.titleSnapshot,
              );
              return (
                <View
                  key={item.bookId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  }}
                >
                  <Image
                    source={coverPlaceholder}
                    style={{
                      width: 36,
                      aspectRatio: 2 / 3,
                      borderRadius: 6,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      numberOfLines={2}
                    >
                      {item.titleSnapshot}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Quantity: {item.quantity}
                    </AppText>
                  </View>
                  <AppText
                    variant="body"
                    weight="bold"
                    style={{ color: theme.colors.primary }}
                  >
                    ₦{(item.unitPrice * item.quantity).toLocaleString()}
                  </AppText>
                </View>
              );
            })}
          </View>

          {/* Pricing summary */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              marginTop: theme.spacing.sm,
              paddingTop: theme.spacing.sm,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText variant="sectionHeader">Total Paid</AppText>
            <AppText
              variant="priceLarge"
              style={{ color: theme.colors.primary }}
            >
              ₦{data.totalAmount.toLocaleString()}
            </AppText>
          </View>
        </Card>

        {/* Support Help Action */}
        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="sectionHeader">Need help with collection?</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary, marginBottom: 4 }}
          >
            For pickup questions or order disputes, contact the campus store
            support line.
          </AppText>
          <Button
            label="Contact support"
            variant="outline"
            icon="mail-outline"
            onPress={() =>
              navigation.navigate("ContactSupport", { category: "Orders" })
            }
          />
        </Card>
      </ScrollView>
    </View>
  );
}
