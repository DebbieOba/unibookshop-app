import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SellerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useProfitLoss } from "../../../hooks/useProfitLoss";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { ErrorState } from "../../../components/ErrorState";
import { IconButton } from "../../../components/IconButton";

type Props = NativeStackScreenProps<SellerStackParamList, "ProfitLoss">;

export function ProfitLossScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");
  const { data, isLoading, isError, refetch, isFetching } =
    useProfitLoss(range);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText style={{ marginTop: theme.spacing.md }}>
          Loading P&L dashboard...
        </AppText>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View
        style={[
          styles.flex,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <ErrorState
          message="Failed to load profit and loss data. Make sure the backend server is running and try again."
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  const { summary, dailyBreakdown } = data;

  // Format currency
  const formatCurrency = (val: number) => {
    return `₦${Math.round(val).toLocaleString()}`;
  };

  // Find max profit for bar chart height calculations
  const maxDailyProfit = Math.max(
    ...dailyBreakdown.map((d) => Math.max(0, d.profit)),
    1,
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Header Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        }}
      >
        <IconButton
          name="arrow-back"
          size={22}
          color={theme.colors.textPrimary}
          onPress={() => navigation.goBack()}
          style={{ marginRight: theme.spacing.sm }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="title" style={{ fontSize: 20 }}>
            Profit & Loss
          </AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Track daily sales, book costs, and net margins
          </AppText>
        </View>
      </View>

      <ScrollView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Range Selector */}
        <View
          style={[
            styles.rangeContainer,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radii.card,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.rangeButton,
              range === "7d" && {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.button,
              },
            ]}
            onPress={() => setRange("7d")}
          >
            <AppText
              variant="bodyMedium"
              style={{
                color:
                  range === "7d"
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary,
              }}
            >
              Last 7 Days
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeButton,
              range === "30d" && {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.button,
              },
            ]}
            onPress={() => setRange("30d")}
          >
            <AppText
              variant="bodyMedium"
              style={{
                color:
                  range === "30d"
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary,
              }}
            ></AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeButton,
              range === "all" && {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.button,
              },
            ]}
            onPress={() => setRange("all")}
          >
            <AppText
              variant="bodyMedium"
              style={{
                color:
                  range === "all"
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary,
              }}
            >
              All Time
            </AppText>
          </TouchableOpacity>
        </View>

        {/* KPI Cards Grid */}
        <View style={styles.grid}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText
                variant="label"
                style={{ color: theme.colors.textSecondary }}
              >
                REVENUE
              </AppText>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.successSubtle },
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={18}
                  color={theme.colors.success}
                />
              </View>
            </View>
            <AppText variant="heading2" style={styles.cardValue}>
              {formatCurrency(summary.totalRevenue)}
            </AppText>
            <View style={styles.growthContainer}>
              <Ionicons
                name={summary.revenueGrowth >= 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={
                  summary.revenueGrowth >= 0
                    ? theme.colors.success
                    : theme.colors.error
                }
              />
              <AppText
                variant="caption"
                style={{
                  color:
                    summary.revenueGrowth >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                  marginLeft: 2,
                }}
              >
                {Math.abs(summary.revenueGrowth)}% vs prev period
              </AppText>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText
                variant="label"
                style={{ color: theme.colors.textSecondary }}
              >
                COST OF GOODS
              </AppText>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={theme.colors.warning}
                />
              </View>
            </View>
            <AppText variant="heading2" style={styles.cardValue}>
              {formatCurrency(summary.totalCost)}
            </AppText>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textTertiary, marginTop: 4 }}
            >
              Wholesale book cost
            </AppText>
          </Card>
        </View>

        <View style={styles.grid}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText
                variant="label"
                style={{ color: theme.colors.textSecondary }}
              >
                GROSS PROFIT
              </AppText>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primaryTint },
                ]}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <AppText
              variant="heading2"
              style={[styles.cardValue, { color: theme.colors.primary }]}
            >
              {formatCurrency(summary.totalProfit)}
            </AppText>
            <View style={styles.growthContainer}>
              <Ionicons
                name={summary.profitGrowth >= 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={
                  summary.profitGrowth >= 0
                    ? theme.colors.success
                    : theme.colors.error
                }
              />
              <AppText
                variant="caption"
                style={{
                  color:
                    summary.profitGrowth >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                  marginLeft: 2,
                }}
              >
                {Math.abs(summary.profitGrowth)}% vs prev period
              </AppText>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText
                variant="label"
                style={{ color: theme.colors.textSecondary }}
              >
                PROFIT MARGIN
              </AppText>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.goldTint },
                ]}
              >
                <Ionicons
                  name="pie-chart-outline"
                  size={18}
                  color={theme.colors.gold}
                />
              </View>
            </View>
            <AppText
              variant="heading2"
              style={[styles.cardValue, { color: theme.colors.gold }]}
            >
              {summary.profitMargin}%
            </AppText>
            <AppText
              variant="caption"
              style={{ color: theme.colors.textTertiary, marginTop: 4 }}
            >
              Net profit efficiency
            </AppText>
          </Card>
        </View>

        {/* Visual Chart */}
        <Card style={styles.chartCard}>
          <AppText
            variant="sectionHeader"
            style={{ marginBottom: theme.spacing.base }}
          >
            Daily Profit Breakdown
          </AppText>

          {dailyBreakdown.length === 0 ? (
            <View style={styles.emptyChart}>
              <AppText style={{ color: theme.colors.textTertiary }}>
                No transactions in this period
              </AppText>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <View style={styles.barsRow}>
                {dailyBreakdown
                  .slice()
                  .reverse()
                  .map((day) => {
                    const percent = Math.max(
                      5,
                      (day.profit / maxDailyProfit) * 100,
                    );
                    const dateObj = new Date(day.date);
                    const label = dateObj.toLocaleDateString(undefined, {
                      weekday: "narrow",
                    });

                    return (
                      <View key={day.date} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: `${percent}%`,
                                backgroundColor:
                                  day.profit > 0
                                    ? theme.colors.primary
                                    : theme.colors.borderStrong,
                                borderRadius: 4,
                              },
                            ]}
                          />
                        </View>
                        <AppText variant="caption" style={styles.barLabel}>
                          {label}
                        </AppText>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}
        </Card>

        {/* Daily Breakdown List */}
        <Card style={styles.listCard}>
          <AppText
            variant="sectionHeader"
            style={{ marginBottom: theme.spacing.base }}
          >
            Daily Transaction History
          </AppText>

          {dailyBreakdown.map((day) => {
            const dateObj = new Date(day.date);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <View
                key={day.date}
                style={[
                  styles.dayRow,
                  { borderBottomColor: theme.colors.divider },
                ]}
              >
                <View style={styles.dayInfo}>
                  <AppText variant="bodyMedium">{formattedDate}</AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {day.unitsSold ?? day.orderCount}{" "}
                    {(day.unitsSold ?? day.orderCount) === 1 ? "unit" : "units"}{" "}
                    sold
                  </AppText>
                </View>

                <View style={styles.dayStats}>
                  <View style={styles.statColumn}>
                    <AppText variant="label" style={styles.statLabel}>
                      REVENUE
                    </AppText>
                    <AppText variant="body" style={styles.statValue}>
                      {formatCurrency(day.revenue)}
                    </AppText>
                  </View>

                  <View style={styles.statColumn}>
                    <AppText variant="label" style={styles.statLabel}>
                      PROFIT
                    </AppText>
                    <AppText
                      variant="bodyMedium"
                      style={[
                        styles.statValue,
                        {
                          color:
                            day.profit > 0
                              ? theme.colors.success
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {day.profit > 0 ? "+" : ""}
                      {formatCurrency(day.profit)}
                    </AppText>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  rangeContainer: {
    flexDirection: "row",
    padding: 4,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  grid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
  },
  cardValue: {
    fontFamily: "DMSans_700Bold",
  },
  growthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  emptyChart: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    height: 180,
    justifyContent: "flex-end",
    paddingTop: 10,
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    flex: 1,
    width: 14,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
  },
  barLabel: {
    marginTop: 8,
    textAlign: "center",
  },
  listCard: {
    padding: 16,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dayInfo: {
    flex: 1,
  },
  dayStats: {
    flexDirection: "row",
  },
  statColumn: {
    alignItems: "flex-end",
    marginLeft: 20,
    width: 90,
  },
  statLabel: {
    fontSize: 9,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
  },
});
