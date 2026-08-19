import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminTabParamList, AdminStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useThemeStore } from '../../../store/themeStore';
import { secureStorage } from '../../../lib/secureStorage';
import { ThemeMode } from '../../../theme';
import { useLogout } from '../../../hooks/useAuth';
import { useProfile } from '../../../hooks/useProfile';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Avatar } from '../../../components/Avatar';
import { ConfirmSheet } from '../../../components/ConfirmSheet';
import { Skeleton } from '../../../components/Skeleton';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'More'>,
  NativeStackScreenProps<AdminStackParamList>
>;

const MODE_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
];

type NoParamAdminScreen = keyof Pick<
  AdminStackParamList,
  'Schools' | 'Departments' | 'Levels' | 'Categories' | 'ProfitLoss' | 'Approvals' | 'AdminNotifications'
>;

const SECTIONS: Array<{
  title: string;
  rows: Array<{ label: string; screen: NoParamAdminScreen; icon: keyof typeof Ionicons.glyphMap }>;
}> = [
  {
    title: 'Catalogue Structure',
    rows: [
      { label: 'Schools', screen: 'Schools', icon: 'business-outline' },
      { label: 'Departments', screen: 'Departments', icon: 'git-branch-outline' },
      { label: 'Levels', screen: 'Levels', icon: 'layers-outline' },
      { label: 'Categories', screen: 'Categories', icon: 'grid-outline' },
    ],
  },
  {
    title: 'Reports & Finance',
    rows: [
      { label: 'Profit and Loss', screen: 'ProfitLoss', icon: 'analytics-outline' },
    ],
  },
  {
    title: 'Users & Communication',
    rows: [
      { label: 'Users & Access', screen: 'Approvals', icon: 'people-outline' },
      { label: 'Broadcast', screen: 'AdminNotifications', icon: 'megaphone-outline' },
    ],
  },
];

function NavRow({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
        }}
      >
        <View style={{ backgroundColor: theme.colors.surfaceAlt, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <AppText variant="bodyMedium" weight="semiBold" style={{ flex: 1, color: theme.colors.textPrimary }}>
          {label}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </View>
    </Pressable>
  );
}

export function MoreScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useLogout();
  const profile = useProfile();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Skeleton height={60} width={60} style={{ borderRadius: 30 }} />
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <Skeleton height={18} width={160} style={{ borderRadius: 6 }} />
            <Skeleton height={13} width={100} style={{ borderRadius: 6 }} />
          </View>
        </View>
        <View style={{ gap: theme.spacing.sm }}>
          <Skeleton height={12} width={90} style={{ borderRadius: 4 }} />
          <View style={{ borderRadius: 16, overflow: 'hidden', gap: 1 }}>
            <Skeleton height={56} style={{ borderRadius: 0 }} />
            <Skeleton height={56} style={{ borderRadius: 0 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, gap: theme.spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: theme.spacing.xs }}>
          <AppText variant="title">Account</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Manage your account settings, bookstore structure, and access
          </AppText>
        </View>

        {/* Premium Profile Hero Card */}
        <Card style={{ padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, borderLeftWidth: 4, borderLeftColor: theme.colors.primary }}>
          <View style={{ position: 'relative' }}>
            <Avatar url={profile.data?.avatarUrl} fullName={profile.data?.fullName ?? ''} size={60} />
            <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#34C759', width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' }} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyMedium" weight="bold" style={{ fontSize: 17 }}>
              {profile.data?.fullName || 'Admin Account'}
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {profile.data?.user?.email || 'No email verified'}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <View style={{ backgroundColor: theme.colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <AppText variant="caption" weight="bold" style={{ color: theme.colors.primary, fontSize: 8 }}>Store Administrator</AppText>
              </View>
            </View>
          </View>
        </Card>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ gap: theme.spacing.xs }}>
            <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, paddingLeft: 4 }}>
              {section.title}
            </AppText>
            <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
              {section.rows.map((row, index) => (
                <View key={row.screen} style={index > 0 ? { borderTopWidth: 1, borderTopColor: theme.colors.border } : undefined}>
                  <NavRow label={row.label} icon={row.icon} onPress={() => navigation.navigate(row.screen)} />
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Appearance Settings */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, paddingLeft: 4 }}>
            Appearance Theme
          </AppText>
          <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: 999, padding: 4 }}>
              {MODE_OPTIONS.map((option) => {
                const active = themeMode === option.mode;
                return (
                  <Pressable
                    key={option.mode}
                    onPress={() => {
                      setThemeMode(option.mode);
                      void secureStorage.setThemeMode(option.mode);
                    }}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 999,
                      backgroundColor: active ? theme.colors.primary : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Ionicons name={option.icon} size={16} color={active ? '#FFFFFF' : theme.colors.textSecondary} />
                    <AppText variant="label" weight="bold" style={{ color: active ? '#FFFFFF' : theme.colors.textSecondary }}>
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Log Out Row */}
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
          <Button
            label="Log Out Account"
            variant="outline"
            icon="log-out-outline"
            style={{ borderRadius: 999 }}
            onPress={() => setConfirmingLogout(true)}
          />
          <AppText variant="caption" style={{ textAlign: 'center', color: theme.colors.textTertiary }}>
            Curricula Admin App • Version {Constants.expoConfig?.version ?? '—'}
          </AppText>
        </View>

        <ConfirmSheet
          visible={confirmingLogout}
          title="Log out?"
          message="You'll need to sign in again to access the admin dashboard."
          confirmLabel="Log out"
          destructive
          isConfirming={logout.isPending}
          onConfirm={() => logout.mutate()}
          onCancel={() => setConfirmingLogout(false)}
        />
      </ScrollView>
    </View>
  );
}
