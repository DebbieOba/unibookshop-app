import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { useSuperAdminRoles, useSuperAdminStaff, useSuperAdminSchools } from '../../hooks/useSuperAdmin';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Skeleton } from '../../components/Skeleton';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'SuperAdminDashboard'>;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function SuperAdminDashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const clearSession = useAuthStore((s) => s.clearSession);

  const roles = useSuperAdminRoles();
  const staff = useSuperAdminStaff();
  const schools = useSuperAdminSchools();

  const firstName = useMemo(
    () => profile.data?.fullName?.trim().split(/\s+/)[0] ?? 'Admin',
    [profile.data?.fullName]
  );
  
  const stats = useMemo(() => {
    return [
      {
        label: 'Schools',
        value: schools.data?.length ?? 0,
        icon: 'school-outline' as const,
        color: theme.colors.primary,
        tint: theme.colors.primary + '15',
      },
      {
        label: 'Dynamic Roles',
        value: roles.data?.length ?? 0,
        icon: 'key-outline' as const,
        color: '#E0A82E',
        tint: '#E0A82E15',
      },
      {
        label: 'Staff Members',
        value: staff.data?.length ?? 0,
        icon: 'people-outline' as const,
        color: '#4AF2A1',
        tint: '#4AF2A115',
      },
    ];
  }, [schools.data, roles.data, staff.data, theme]);

  const QUICK_ACTIONS = [
    {
      label: 'Manage Roles',
      desc: 'Set dynamic permission maps',
      icon: 'key-outline' as const,
      color: '#E0A82E',
      onPress: () => navigation.navigate('RoleManagement'),
    },
    {
      label: 'Manage Staff',
      desc: 'Add global platform workers',
      icon: 'people-outline' as const,
      color: '#4AF2A1',
      onPress: () => navigation.navigate('StaffManagement'),
    },
    {
      label: 'Manage Schools',
      desc: 'Config schools & departments',
      icon: 'school-outline' as const,
      color: theme.colors.primary,
      onPress: () => navigation.navigate('SchoolManagement'),
    },
  ];

  if (profile.isLoading || roles.isLoading || staff.isLoading || schools.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
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
        paddingTop: insets.top + theme.spacing.md,
        paddingBottom: insets.bottom + theme.spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl }}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            {greeting()},
          </AppText>
          <AppText variant="title" weight="bold">
            {firstName} 👋
          </AppText>
          <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary }}>
            SYSTEM SUPER ADMIN
          </AppText>
        </View>
        <Avatar fullName={profile.data?.fullName ?? 'Super Admin'} size={48} />
      </View>

      {/* KPI Stats Grid */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.xs }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: s.tint,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Ionicons name={s.icon} size={18} color={s.color} />
            </View>
            <AppText variant="title" weight="bold">
              {s.value}
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
              {s.label}
            </AppText>
          </Card>
        ))}
      </View>

      {/* Quick Action Navigation Grid */}
      <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <AppText variant="sectionHeader">Quick Actions</AppText>
        <View style={{ gap: theme.spacing.sm }}>
          {QUICK_ACTIONS.map((item) => (
            <Pressable key={item.label} onPress={item.onPress}>
              <Card
                style={{
                  padding: theme.spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: item.color + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyMedium" weight="bold">
                    {item.label}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                    {item.desc}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Seed Status Details */}
      <Card style={{ padding: theme.spacing.md, gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
          <AppText variant="bodyMedium" weight="bold">Platform Settings In Sync</AppText>
        </View>
        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
          Dynamic permissions are active. To modify dynamic mappings, manage permissions and dynamic staff roles.
        </AppText>
      </Card>

      {/* Logout button */}
      <Button
        label="Sign Out"
        variant="outline"
        icon="log-out-outline"
        onPress={clearSession}
        style={{ borderRadius: 999 }}
      />
    </ScrollView>
  );
}
