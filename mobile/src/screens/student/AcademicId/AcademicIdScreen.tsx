import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useProfile } from '../../../hooks/useProfile';
import { AppText } from '../../../components/AppText';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Skeleton } from '../../../components/Skeleton';
import { ErrorState } from '../../../components/ErrorState';

type Props = NativeStackScreenProps<StudentStackParamList, 'AcademicId'>;

function IdRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>{label}</AppText>
        <AppText variant="bodyMedium" weight="bold">{value}</AppText>
      </View>
    </View>
  );
}

export function AcademicIdScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();

  if (profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.lg, gap: theme.spacing.md }}>
        <Skeleton height={220} style={{ borderRadius: 20 }} />
        <Skeleton height={120} />
      </View>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + theme.spacing.lg }}>
        <ErrorState onRetry={() => profile.refetch()} />
      </View>
    );
  }

  const data = profile.data;
  const isComplete = !!(data.user?.matricNumber && data.user?.department && data.user?.level);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.lg, gap: theme.spacing.lg }}
    >
      <View style={{ gap: 2 }}>
        <AppText variant="title">Academic ID</AppText>
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          Your verified CURRICULA student record.
        </AppText>
      </View>

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: theme.spacing.lg, gap: theme.spacing.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 999 }}>
            <Avatar url={data.avatarUrl} fullName={data.fullName} size={64} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>CURRICULA STUDENT</AppText>
            <AppText variant="sectionHeader" style={{ color: '#FFFFFF' }} numberOfLines={1}>
              {data.fullName}
            </AppText>
            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>
              {data.user?.matricNumber ?? 'Matric number not set'}
            </AppText>
          </View>
        </View>
      </LinearGradient>

      <Card style={{ gap: theme.spacing.md }}>
        <IdRow icon="school-outline" label="Department" value={data.user?.department?.name ?? 'Not set'} />
        <IdRow icon="layers-outline" label="Level" value={data.user?.level?.name ?? 'Not set'} />
        <IdRow icon="card-outline" label="Matric number" value={data.user?.matricNumber ?? 'Not set'} />
        {data.user?.email ? <IdRow icon="mail-outline" label="Email" value={data.user.email} /> : null}
      </Card>

      {!isComplete ? (
        <Card style={{ gap: theme.spacing.xs, borderColor: theme.colors.warning, borderWidth: 1 }}>
          <AppText variant="bodyMedium" weight="bold" style={{ color: theme.colors.warning }}>
            Your academic profile is incomplete
          </AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Add your matric number, department and level so this ID reflects your real record.
          </AppText>
          <Button label="Complete profile" tone="student" onPress={() => navigation.navigate('EditProfile')} style={{ marginTop: theme.spacing.xs }} />
        </Card>
      ) : null}
    </ScrollView>
  );
}
