import React, { useState, useEffect } from "react";
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
import { useExpenses, useDeleteExpense } from "../../../hooks/useExpenses";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { ErrorState } from "../../../components/ErrorState";
import { IconButton } from "../../../components/IconButton";
import { Button } from "../../../components/Button";

type Props = NativeStackScreenProps<SellerStackParamList, "Expenses">;

export function ExpensesScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const { data: expenses, isLoading, isError, refetch, isFetching } = useExpenses();
  const deleteExpense = useDeleteExpense();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText style={{ marginTop: theme.spacing.md }}>Loading expenses...</AppText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <ErrorState message="Failed to load expenses." onRetry={() => void refetch()} />
      </View>
    );
  }

  const formatCurrency = (val: number) => `₦${Math.round(val).toLocaleString()}`;

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
          <AppText variant="title" style={{ fontSize: 20 }}>Expenses</AppText>
        </View>
        <Button label="Add" variant="primary" size="small" onPress={() => {
            // Note: In a full app, this would open a modal to add expense.
            // For now we just implement the UI scaffolding for it.
            alert("Add Expense modal goes here");
        }} />
      </View>

      <ScrollView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {!expenses || expenses.length === 0 ? (
          <View style={styles.centered}>
            <AppText style={{ color: theme.colors.textSecondary, marginTop: 40 }}>No expenses recorded.</AppText>
          </View>
        ) : (
          expenses.map(expense => (
            <Card key={expense.id} style={{ marginBottom: 12, padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <AppText variant="bodyMedium" weight="bold">{expense.description}</AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>{expense.category || "Other"}</AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textTertiary }}>
                    {new Date(expense.date).toLocaleDateString()}
                  </AppText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <AppText variant="bodyMedium" style={{ color: theme.colors.error }}>-{formatCurrency(expense.amount)}</AppText>
                  <IconButton 
                    name="trash-outline" 
                    size={18} 
                    color={theme.colors.error} 
                    onPress={() => deleteExpense.mutate(expense.id)}
                    style={{ marginTop: 8 }}
                  />
                </View>
              </View>
            </Card>
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
