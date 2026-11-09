import { useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useActiveUsers,
  useApprovals,
  useDecideApproval,
  useRestrictUser,
  useRestoreUser,
} from "../../../hooks/useApprovals";
import { useTheme } from "../../../hooks/useTheme";
import { useToast } from "../../../hooks/useToast";
import { ActiveUser, PendingUser } from "../../../types/seller";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Chip } from "../../../components/Chip";
import { SearchBar } from "../../../components/SearchBar";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { ReasonSheet } from "../../../components/ReasonSheet";
import { EmptyState } from "../../../components/EmptyState";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";

type Tab = "pending" | "active";

function matchesSearch(item: PendingUser | ActiveUser, q: string) {
  return (
    (item.profile?.fullName ?? "").toLowerCase().includes(q) ||
    item.email.toLowerCase().includes(q)
  );
}

export function ApprovalsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");

  const approvals = useApprovals();
  const activeUsers = useActiveUsers();
  const decide = useDecideApproval();
  const restrict = useRestrictUser();
  const restore = useRestoreUser();

  const [rejecting, setRejecting] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [restricting, setRestricting] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [restoring, setRestoring] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const query = tab === "pending" ? approvals : activeUsers;

  const filtered = useMemo(() => {
    const list = (tab === "pending" ? approvals.data : activeUsers.data) ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((item) => matchesSearch(item, q));
  }, [tab, approvals.data, activeUsers.data, search]);

  if (query.isLoading) return <Skeleton height={300} />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const confirmReject = () => {
    if (!rejecting) return;
    decide.mutate(
      { userId: rejecting.id, decision: "REJECTED" },
      { onSuccess: () => toast("Customer rejected") },
    );
    setRejecting(null);
  };

  const confirmRestrict = (reason: string) => {
    if (!restricting) return;
    restrict.mutate(
      { userId: restricting.id, reason },
      { onSuccess: () => toast("Account restricted") },
    );
    setRestricting(null);
  };

  const confirmRestore = () => {
    if (!restoring) return;
    restore.mutate(restoring.id, {
      onSuccess: () => toast("Account restored"),
    });
    setRestoring(null);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.md,
      }}
    >
      {/* Header title */}
      <View style={{ marginBottom: theme.spacing.sm }}>
        <AppText variant="title">Users & Access</AppText>
        <AppText
          variant="caption"
          style={{ color: theme.colors.textSecondary }}
        >
          Review sign-ups, approve store access, and restrict accounts
        </AppText>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        <Chip
          variant="seller"
          label="Pending"
          selected={tab === "pending"}
          onPress={() => setTab("pending")}
        />
        <Chip
          variant="seller"
          label="Active"
          selected={tab === "active"}
          onPress={() => setTab("active")}
        />
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email or matric number"
          debounceMs={0}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={() => query.refetch()}
            tintColor={theme.colors.adminAccent}
          />
        }
        ListEmptyComponent={
          search ? (
            <EmptyState
              icon="search-outline"
              message="No matching accounts"
              subtext="Try a different name, email or matric number."
            />
          ) : tab === "pending" ? (
            <EmptyState
              icon="people-outline"
              message="No pending applications."
              subtext="New sign-ups awaiting a decision will appear here."
            />
          ) : (
            <EmptyState
              icon="people-outline"
              message="No active accounts yet."
              subtext="Approved students will appear here."
            />
          )
        }
        renderItem={({ item }) => (
          <Card style={{ gap: theme.spacing.sm }}>
            <AppText variant="sectionHeader">
              {item.profile?.fullName ?? item.email}
            </AppText>
            <AppText
              variant="body"
              style={{ color: theme.colors.textSecondary }}
            >
              {item.email}
            </AppText>

            {tab === "pending" ? (
              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    tone="seller"
                    label="Approve"
                    disabled={decide.isPending}
                    onPress={() =>
                      decide.mutate(
                        { userId: item.id, decision: "APPROVED" },
                        { onSuccess: () => toast("Customer approved") },
                      )
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="destructive"
                    label="Reject"
                    disabled={decide.isPending}
                    onPress={() =>
                      setRejecting({
                        id: item.id,
                        label: item.profile?.fullName ?? item.email,
                      })
                    }
                  />
                </View>
              </View>
            ) : (
              <>
                {(item as ActiveUser).accountState === "RESTRICTED" &&
                (item as ActiveUser).restrictionReason ? (
                  <AppText
                    variant="label"
                    style={{ color: theme.colors.error }}
                  >
                    Restricted: {(item as ActiveUser).restrictionReason}
                  </AppText>
                ) : null}
                <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                  {(item as ActiveUser).accountState === "RESTRICTED" ? (
                    <View style={{ flex: 1 }}>
                      <Button
                        tone="seller"
                        label="Restore"
                        disabled={restore.isPending}
                        onPress={() =>
                          setRestoring({
                            id: item.id,
                            label: item.profile?.fullName ?? item.email,
                          })
                        }
                      />
                    </View>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Button
                        variant="destructive"
                        label="Restrict"
                        disabled={restrict.isPending}
                        onPress={() =>
                          setRestricting({
                            id: item.id,
                            label: item.profile?.fullName ?? item.email,
                          })
                        }
                      />
                    </View>
                  )}
                </View>
              </>
            )}
          </Card>
        )}
      />

      <ConfirmSheet
        visible={!!rejecting}
        title="Reject this application?"
        message={
          rejecting
            ? `${rejecting.label} will not be able to sign in until they're approved.`
            : ""
        }
        confirmLabel="Reject"
        destructive
        isConfirming={decide.isPending}
        onConfirm={confirmReject}
        onCancel={() => setRejecting(null)}
      />

      <ReasonSheet
        visible={!!restricting}
        title="Restrict this account?"
        message={
          restricting
            ? `${restricting.label} will be signed out and unable to use the app until restored.`
            : ""
        }
        reasonLabel="Reason for restriction"
        confirmLabel="Restrict"
        destructive
        isConfirming={restrict.isPending}
        onConfirm={confirmRestrict}
        onCancel={() => setRestricting(null)}
      />

      <ConfirmSheet
        visible={!!restoring}
        title="Restore this account?"
        message={
          restoring
            ? `${restoring.label} will regain full access to the app.`
            : ""
        }
        confirmLabel="Restore"
        isConfirming={restore.isPending}
        onConfirm={confirmRestore}
        onCancel={() => setRestoring(null)}
      />
    </View>
  );
}
