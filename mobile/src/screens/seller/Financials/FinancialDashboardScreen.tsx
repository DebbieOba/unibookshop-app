import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart, LineChart } from "react-native-gifted-charts";

import { SellerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useFinancialDashboard, useInventoryValue } from "../../../hooks/useFinancials";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { ErrorState } from "../../../components/ErrorState";
import { IconButton } from "../../../components/IconButton";
import { SkeletonLoader } from "../../../components/SkeletonLoader";
import { BottomSheet } from "../../../components/BottomSheet";
import { GradientCard } from "../../../components/GradientCard";

type Props = NativeStackScreenProps<SellerStackParamList, "FinancialDashboard">;
type DateRange = "today" | "week" | "month" | "year" | "all";

export function FinancialDashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [range, setRange] = useState<DateRange>("month");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  
  const { startDate, endDate } = useMemo(() => {
    if (range === "all") return { startDate: undefined, endDate: undefined };
    const end = new Date();
    const start = new Date();
    if (range === "today") start.setHours(0, 0, 0, 0);
    if (range === "week") start.setDate(start.getDate() - 7);
    if (range === "month") start.setDate(start.getDate() - 30);
    if (range === "year") start.setDate(start.getDate() - 365);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [range]);

  const { data, isLoading, isError, refetch, isFetching } = useFinancialDashboard(startDate, endDate);
  const inventoryQuery = useInventoryValue();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const formatCurrency = (val: number) => `₦${Math.round(val).toLocaleString()}`;
  
  const getRangeLabel = (r: DateRange) => {
    switch (r) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      case "all": return "All Time";
    }
  };

  if (isError || inventoryQuery.isError) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <ErrorState
          message="Failed to load dashboard data. Make sure the backend server is running and try again."
          onRetry={() => {
            void refetch();
            void inventoryQuery.refetch();
          }}
        />
      </View>
    );
  }

  const renderSkeleton = () => (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <View>
          <SkeletonLoader width={100} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={150} height={28} />
        </View>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        <SkeletonLoader width="100%" height={160} borderRadius={24} style={{ marginBottom: 24 }} />
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <SkeletonLoader style={{ flex: 1 }} height={100} borderRadius={16} />
          <SkeletonLoader style={{ flex: 1 }} height={100} borderRadius={16} />
        </View>
        <SkeletonLoader width={120} height={20} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="100%" height={300} borderRadius={24} style={{ marginBottom: 24 }} />
      </ScrollView>
    </View>
  );

  if (isLoading || inventoryQuery.isLoading || !data || !inventoryQuery.data) {
    return renderSkeleton();
  }

  const { summary, chartData, bestSellingBooks, mostProfitableBooks, expenseBreakdown, insights } = data;

  // Prepare Pie Chart Data
  const pieData = [
    { value: Math.max(1, summary.netProfit), color: theme.colors.success, text: "Profit" },
    { value: Math.max(1, summary.totalExpenses), color: theme.colors.error, text: "Exp" },
    { value: Math.max(1, summary.cogs), color: theme.colors.gold, text: "COGS" }
  ];

  // Prepare Line Chart Data
  const lineData = chartData.slice(-7).map(d => ({
    value: Math.max(0, d.profit),
    label: new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" }),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Financial Overview</AppText>
          <AppText variant="heading2">Dashboard</AppText>
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: theme.colors.surfaceAlt }]}
          onPress={() => setShowFilters(true)}
        >
          <AppText variant="bodyMedium" style={{ marginRight: 4 }}>{getRangeLabel(range)}</AppText>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[theme.colors.primary]} />}
      >
        {/* HERO CARD */}
        <GradientCard style={styles.heroCard}>
          <AppText style={{ color: "rgba(255,255,255,0.8)", marginBottom: 8, fontFamily: "DMSans_500Medium" }}>Net Profit</AppText>
          <AppText style={{ color: "#fff", fontSize: 36, fontFamily: "DMSans_700Bold", letterSpacing: -1 }}>
            {formatCurrency(summary.netProfit)}
          </AppText>
          <View style={styles.heroStatsRow}>
            <View>
              <AppText style={styles.heroStatLabel}>Revenue</AppText>
              <AppText style={styles.heroStatValue}>{formatCurrency(summary.totalRevenue)}</AppText>
            </View>
            <View>
              <AppText style={styles.heroStatLabel}>Expenses</AppText>
              <AppText style={styles.heroStatValue}>{formatCurrency(summary.totalExpenses)}</AppText>
            </View>
          </View>
        </GradientCard>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate("Expenses")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.error + "20" }]}>
              <Ionicons name="receipt" size={24} color={theme.colors.error} />
            </View>
            <AppText variant="caption" style={styles.quickActionText}>Expenses</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + "20" }]}>
              <Ionicons name="swap-horizontal" size={24} color={theme.colors.primary} />
            </View>
            <AppText variant="caption" style={styles.quickActionText}>Transactions</AppText>
          </TouchableOpacity>
        </View>

        {/* ACTIVITY DONUT CHART */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <AppText variant="heading3">Activity Breakdown</AppText>
          </View>
          <View style={{ alignItems: "center", marginVertical: 16 }}>
            <PieChart
              data={pieData}
              donut
              innerRadius={70}
              radius={100}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Revenue</AppText>
                  <AppText variant="heading3">{formatCurrency(summary.totalRevenue)}</AppText>
                </View>
              )}
            />
          </View>
          <View style={styles.legendRow}>
            {pieData.map((item, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <AppText variant="caption">{item.text}</AppText>
              </View>
            ))}
          </View>
        </Card>

        {/* PROFIT TREND LINE CHART */}
        {lineData.length > 0 && (
          <Card style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading3">Profit Trend</AppText>
            </View>
            <View style={{ marginLeft: -10, marginTop: 10 }}>
              <LineChart
                data={lineData}
                width={300}
                height={160}
                spacing={45}
                color={theme.colors.primary}
                thickness={3}
                startFillColor={theme.colors.primary}
                endFillColor={theme.colors.background}
                startOpacity={0.4}
                endOpacity={0.05}
                yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10, fontFamily: "DMSans_400Regular" }}
                xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10, fontFamily: "DMSans_400Regular" }}
                hideRules
                hideDataPoints
                curved
                areaChart
              />
            </View>
          </Card>
        )}

        {/* MINIMAL LIST: MOST PROFITABLE */}
        <View style={{ marginTop: 8 }}>
          <AppText variant="heading3" style={{ marginBottom: 16 }}>Top Books</AppText>
          {mostProfitableBooks.slice(0, 5).map((book, idx) => {
            const isExpanded = expandedBook === book.title;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.minimalListItem, { backgroundColor: theme.colors.surface }]}
                onPress={() => setExpandedBook(isExpanded ? null : book.title)}
              >
                <View style={styles.minimalListHeader}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <View style={[styles.iconWrapperSmall, { backgroundColor: theme.colors.primary + "15", marginRight: 12 }]}>
                      <Ionicons name="book" size={16} color={theme.colors.primary} />
                    </View>
                    <AppText variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>{book.title}</AppText>
                  </View>
                  <AppText variant="bodyMedium" style={{ color: theme.colors.success, fontFamily: "DMSans_600SemiBold" }}>
                    {formatCurrency(book.profit || 0)}
                  </AppText>
                </View>
                {isExpanded && (
                  <View style={[styles.minimalListDetails, { borderTopColor: theme.colors.divider }]}>
                    <View>
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Copies Sold</AppText>
                      <AppText variant="bodyMedium">{book.copies}</AppText>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Profit Margin</AppText>
                      <AppText variant="bodyMedium">{Math.round(book.profitMargin || 0)}%</AppText>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FILTER BOTTOM SHEET */}
      <BottomSheet visible={showFilters} onDismiss={() => setShowFilters(false)}>
        <AppText variant="heading3" style={{ marginBottom: 20 }}>Select Period</AppText>
        {(["today", "week", "month", "year", "all"] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.filterOption,
              range === r && { backgroundColor: theme.colors.primary + "15", borderColor: theme.colors.primary, borderWidth: 1 }
            ]}
            onPress={() => {
              setRange(r);
              setShowFilters(false);
            }}
          >
            <AppText 
              variant="bodyLarge" 
              style={{ color: range === r ? theme.colors.primary : theme.colors.textPrimary, fontFamily: range === r ? "DMSans_600SemiBold" : "DMSans_400Regular" }}
            >
              {getRangeLabel(r)}
            </AppText>
            {range === r && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scrollContent: { padding: 20, paddingBottom: 60 },
  heroCard: {
    marginBottom: 24,
    borderRadius: 24,
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  heroStatLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 },
  heroStatValue: { color: "#fff", fontSize: 16, fontFamily: "DMSans_600SemiBold" },
  quickActionsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontFamily: "DMSans_500Medium",
  },
  cardSection: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowOpacity: 0.05,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  minimalListItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  minimalListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrapperSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  minimalListDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
});
