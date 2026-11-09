import { useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import {
  useListing,
  useDeleteListing,
  useUpdateListingStatus,
} from "../../../hooks/useExchange";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../hooks/useToast";
import { AppText } from "../../../components/AppText";
import { Avatar } from "../../../components/Avatar";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";

type Props = NativeStackScreenProps<CustomerStackParamList, "ListingDetails">;

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export function ListingDetailsScreen({ route }: Props) {
  const theme = useTheme();
  const toast = useToast();
  const { listingId } = route.params;
  const listing = useListing(listingId);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const updateStatus = useUpdateListingStatus();
  const deleteListing = useDeleteListing();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (listing.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <Skeleton height={220} style={{ borderRadius: 16 }} />
        <Skeleton height={28} width="70%" />
        <Skeleton height={80} />
      </View>
    );
  }

  if (listing.isError || !listing.data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: theme.spacing.lg,
        }}
      >
        <ErrorState onRetry={() => listing.refetch()} />
      </View>
    );
  }

  const data = listing.data;
  const isOwner = data.sellerId === currentUserId;
  const isSold = data.status === "SOLD";

  const handleContact = () => {
    if (data.seller.phone) {
      void Linking.openURL(`tel:${data.seller.phone}`);
    } else {
      toast("This seller has not added a phone number yet", "error");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      {data.images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height: 220, borderRadius: 16 }}
        >
          {data.images.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={{
                width: 300,
                height: 220,
                borderRadius: 16,
                marginRight: theme.spacing.sm,
              }}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            height: 220,
            borderRadius: 16,
            backgroundColor: theme.colors.surfaceAlt,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="book-outline"
            size={40}
            color={theme.colors.textTertiary}
          />
        </View>
      )}

      <View style={{ gap: 4 }}>
        <AppText variant="title" style={{ fontSize: 22 }}>
          {data.title}
        </AppText>
        {data.author ? (
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            {data.author}
          </AppText>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <AppText variant="priceLarge" style={{ color: theme.colors.primary }}>
          ₦{data.price.toLocaleString()}
        </AppText>
        <View
          style={{
            backgroundColor: theme.colors.gold + "15",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={{ color: theme.colors.gold }}
          >
            {CONDITION_LABELS[data.condition] ?? data.condition}
          </AppText>
        </View>
        {isSold ? (
          <View
            style={{
              backgroundColor: theme.colors.error + "15",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: theme.colors.error }}
            >
              Sold
            </AppText>
          </View>
        ) : null}
      </View>

      {data.courseCode ? (
        <AppText
          variant="caption"
          style={{ color: theme.colors.textSecondary }}
        >
          Course: {data.courseCode}
        </AppText>
      ) : null}

      {data.description ? (
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="sectionHeader">Description</AppText>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            {data.description}
          </AppText>
        </View>
      ) : null}

      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <Avatar
          url={data.seller.avatarUrl ?? undefined}
          fullName={data.seller.fullName}
          size={40}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" weight="bold">
            {data.seller.fullName}
          </AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Seller
          </AppText>
        </View>
      </Card>

      {isOwner ? (
        <View style={{ gap: theme.spacing.sm }}>
          {!isSold ? (
            <Button
              label="Mark as sold"
              variant="outline"
              isLoading={updateStatus.isPending}
              onPress={() =>
                updateStatus.mutate(
                  { id: data.id, status: "SOLD" },
                  { onSuccess: () => toast("Marked as sold") },
                )
              }
            />
          ) : null}
          <Button
            label="Delete listing"
            variant="destructive"
            onPress={() => setConfirmingDelete(true)}
          />
        </View>
      ) : (
        <Button
          label="Contact Seller"
          icon="call-outline"
          onPress={handleContact}
          disabled={isSold}
        />
      )}

      <ConfirmSheet
        visible={confirmingDelete}
        title="Delete this listing?"
        message={`"${data.title}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isConfirming={deleteListing.isPending}
        onConfirm={() =>
          deleteListing.mutate(data.id, {
            onSuccess: () => toast("Listing deleted"),
          })
        }
        onCancel={() => setConfirmingDelete(false)}
      />
    </ScrollView>
  );
}
