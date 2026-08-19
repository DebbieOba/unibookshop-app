import { useEffect } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useProfile, useUpdateNotificationPreferences } from '../../../hooks/useProfile';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';

type Props = NativeStackScreenProps<StudentStackParamList, 'NotificationPreferences'>;

export function NotificationPreferencesScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const updateNotificationPrefs = useUpdateNotificationPreferences();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={120} />
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
        
        {/* Title area with no top header name and arrow */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <AppText variant="title">Notifications</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Configure push messages and email receipt alerts
          </AppText>
        </View>

        <Card style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="bold">Push Notifications</AppText>
              <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                Order status notifications and bookstore pickup reminders
              </AppText>
            </View>
            <Switch
              value={profile.data?.notificationPreferences?.push ?? true}
              onValueChange={(push) => updateNotificationPrefs.mutate({ push })}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="bold">Email Updates</AppText>
              <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                Digital checkout receipts and academic news alerts
              </AppText>
            </View>
            <Switch
              value={profile.data?.notificationPreferences?.email ?? true}
              onValueChange={(email) => updateNotificationPrefs.mutate({ email })}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </Card>

        {/* Action Row - No plain text/arrow header layout */}
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button
            label="Return to Settings"
            variant="outline"
            style={{ borderRadius: 999 }}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
