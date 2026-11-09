import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SuperAdminStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useProfile } from "../../hooks/useProfile";
import {
  useSuperAdminRoles,
  useSuperAdminStaff,
} from "../../hooks/useSuperAdmin";
import { AppText } from "../../components/AppText";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { Skeleton } from "../../components/Skeleton";

type Props = NativeStackScreenProps<
  SuperAdminStackParamList,
  "SuperAdminDashboard"
>;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function SuperAdminDashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();

  const roles = useSuperAdminRoles();
  const staff = useSuperAdminStaff();


  const firstName = useMemo(
    () => profile.data?.fullName?.trim().split(/\s+/)[0] ?? "Seller",
    [profile.data?.fullName],
  );

  const stats = useMemo(() => {
    return [

      {
        label: "Dynamic Roles",
        value: roles.data?.length ?? 0,
        icon: "key" as const,
        color: "#E0A82E",
        tint: "#E0A82E12",
      },
      {
        label: "Staff Members",
        value: staff.data?.length ?? 0,
        icon: "people" as const,
        color: "#10B981",
        tint: "#10B98112",
      },
    ];
  }, [roles.data, staff.data, theme]);

  const MANAGEMENT_MODULES = [

    {
      label: "Staff Registry",
      desc: "Platform workers & assignments",
      icon: "people-outline" as const,
      color: "#10B981",
      route: "StaffManagement" as const,
    },
    {
      label: "Role Permissions",
      desc: "Dynamic dynamic policy mapping",
      icon: "key-outline" as const,
      color: "#E0A82E",
      route: "RoleManagement" as const,
    },
  ];

  if (
    profile.isLoading ||
    roles.isLoading ||
    staff.isLoading
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.xl,
        }}
      >
        <Skeleton height={80} />
        <Skeleton height={140} />
        <Skeleton height={200} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: insets.top + theme.spacing.xl, // Extra top breathing room
        paddingBottom: insets.bottom + theme.spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Dashboard Top Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.xl,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            {greeting()},
          </AppText>
          <AppText variant="title" weight="bold">
            {firstName} 👋
          </AppText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#10B981",
              }}
            />
            <AppText
              variant="caption"
              weight="bold"
              style={{
                color: theme.colors.primary,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              System Console Active
            </AppText>
          </View>
        </View>

        {/* Right side settings navigation trigger */}
        <Pressable
          onPress={() => navigation.navigate("SuperAdminSettings")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          })}
        >
          <Avatar
            fullName={profile.data?.fullName ?? "Super Seller"}
            size={44}
          />
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={theme.colors.textPrimary}
            />
          </View>
        </Pressable>
      </View>

      {/* Spacious KPI Stats Overview */}
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}
      >
        {stats.map((s) => (
          <Card
            key={s.label}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              gap: theme.spacing.sm,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: s.tint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <View style={{ gap: 2 }}>
              <AppText
                variant="sectionHeader"
                weight="bold"
                style={{ fontSize: 20 }}
              >
                {s.value}
              </AppText>
              <AppText
                variant="caption"
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 10,
                  fontWeight: "600",
                }}
              >
                {s.label}
              </AppText>
            </View>
          </Card>
        ))}
      </View>

      {/* Control Center / Management Modules Section */}
      <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <AppText
          variant="sectionHeader"
          weight="bold"
          style={{ fontSize: 16, letterSpacing: 0.5 }}
        >
          Control Center
        </AppText>
        <View style={{ gap: theme.spacing.md }}>
          {MANAGEMENT_MODULES.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.route)}
            >
              <Card
                style={{
                  padding: theme.spacing.lg,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: item.color + "12",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={{ fontSize: 15 }}
                  >
                    {item.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {item.desc}
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textTertiary}
                />
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Platform Status & Security Center */}
      <View style={{ gap: theme.spacing.md }}>
        <AppText
          variant="sectionHeader"
          weight="bold"
          style={{ fontSize: 16, letterSpacing: 0.5 }}
        >
          System Monitor
        </AppText>
        <Card
          style={{
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <AppText variant="bodyMedium" weight="bold">
                Database & Guard Sync
              </AppText>
            </View>
            <View
              style={{
                backgroundColor: "#10B98115",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: "#10B981", fontSize: 9 }}
              >
                ONLINE
              </AppText>
            </View>
          </View>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary, lineHeight: 16 }}
          >
            Dynamic RBAC matrix is operational. Access rules are enforced at the
            NestJS router boundary.
          </AppText>
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              paddingTop: theme.spacing.md,
              gap: theme.spacing.lg,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText
                variant="caption"
                style={{ color: theme.colors.textTertiary }}
              >
                API LATENCY
              </AppText>
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={{ color: "#10B981" }}
              >
                Normal
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                variant="caption"
                style={{ color: theme.colors.textTertiary }}
              >
                ACTIVE HOOKS
              </AppText>
              <AppText variant="bodyMedium" weight="bold">
                4 Secure
              </AppText>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
