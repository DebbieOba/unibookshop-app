import React, { useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SellerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useFinancialTransactions } from "../../../hooks/useFinancials";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { ErrorState } from "../../../components/ErrorState";
import { IconButton } from "../../../components/IconButton";

type Props = NativeStackScreenProps<SellerStackParamList, "TransactionHistory">;

export function TransactionHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const { data: transactions, isLoading, isError, refetch, isFetching } = useFinancialTransactions();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText style={{ marginTop: theme.spacing.md }}>Loading transactions...</AppText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <ErrorState message="Failed to load transaction history." onRetry={() => void refetch()} />
      </View>
    );
  }

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    return `${isNegative ? "-" : ""}₦${Math.abs(Math.round(val)).toLocaleString()}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{
        flexDirection: "row", alignItems: "center", paddingTop: insets.top + theme.spacing.md,
        paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm,
        backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
      }}>
        <IconButton
          name="arrow-back" size={22} color={theme.colors.textPrimary}
          onPress={() => navigation.goBack()} style={{ marginRight: theme.spacing.sm }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="title" style={{ fontSize: 20 }}>Transaction History</AppText>
        </View>
      </View>

      <ScrollView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {!transactions || transactions.length === 0 ? (
          <View style={styles.centered}>
            <AppText style={{ color: theme.colors.textSecondary, marginTop: 40 }}>No transactions recorded.</AppText>
          </View>
        ) : (
          transactions.map(tx => (
            <View key={tx.id} style={{ 
              flexDirection: "row", justifyContent: "space-between", 
              paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.divider 
            }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <AppText variant="bodyMedium" numberOfLines={2}>{tx.description}</AppText>
                <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {new Date(tx.date).toLocaleString()} • {tx.type}
                </AppText>
              </View>
              <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                <AppText variant="bodyMedium" weight="bold" style={{ 
                  color: tx.amount >= 0 ? theme.colors.success : theme.colors.error 
                }}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </AppText>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
});
