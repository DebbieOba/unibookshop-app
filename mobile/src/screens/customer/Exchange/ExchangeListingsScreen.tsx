import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useListings } from "../../../hooks/useExchange";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { SearchBar } from "../../../components/SearchBar";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";

type Props = NativeStackScreenProps<CustomerStackParamList, "ExchangeListings">;

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export function ExchangeListingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const listings = useListings({ search: search || undefined, limit: 40 });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="title">Used Textbook Exchange</AppText>
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          Buy and sell used course books directly with other students.
        </AppText>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search title, author or course code"
        />
        <Button
          label="List a Book"
          icon="add-circle-outline"
          onPress={() => navigation.navigate("CreateListing")}
        />
      </View>

      {listings.isLoading ? (
        <View
          style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
        >
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={90} />
        </View>
      ) : listings.isError ? (
        <ErrorState onRetry={() => listings.refetch()} />
      ) : (
        <FlatList
          data={listings.data?.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: 0,
            gap: theme.spacing.sm,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="pricetags-outline"
              message="No listings yet"
              subtext="Be the first to list a used course book for sale."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("ListingDetails", { listingId: item.id })
              }
            >
              <Card
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.md,
                  padding: theme.spacing.sm,
                  alignItems: "center",
                }}
              >
                {item.images[0] ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={{
                      width: 56,
                      height: 74,
                      borderRadius: 8,
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 74,
                      borderRadius: 8,
                      backgroundColor: theme.colors.surfaceAlt,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="book-outline"
                      size={22}
                      color={theme.colors.textTertiary}
                    />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyMedium" weight="bold" numberOfLines={2}>
                    {item.title}
                  </AppText>
                  {item.author ? (
                    <AppText
                      variant="caption"
                      style={{ color: theme.colors.textSecondary }}
                      numberOfLines={1}
                    >
                      {item.author}
                    </AppText>
                  ) : null}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                      marginTop: 4,
                    }}
                  >
                    <AppText
                      variant="price"
                      style={{ color: theme.colors.primary, fontSize: 15 }}
                    >
                      ₦{item.price.toLocaleString()}
                    </AppText>
                    <View
                      style={{
                        backgroundColor: theme.colors.gold + "15",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        style={{ color: theme.colors.gold, fontSize: 10 }}
                      >
                        {CONDITION_LABELS[item.condition] ?? item.condition}
                      </AppText>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textTertiary}
                />
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
