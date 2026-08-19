import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBroadcast } from '../../../hooks/useBroadcast';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Input } from '../../../components/Input';
import { IconButton } from '../../../components/IconButton';

type Audience = 'student' | 'admin' | 'all';
const AUDIENCES: Audience[] = ['student', 'admin', 'all'];

export function AdminNotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const toast = useToast();
  const broadcast = useBroadcast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('student');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Custom Header Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
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
          <AppText variant="title" style={{ fontSize: 20 }}>Broadcast</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Send push notifications to students, admins, or all users
          </AppText>
        </View>
      </View>

      <View style={{ flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <Input label="Title" placeholder="Title" value={title} onChangeText={setTitle} />

        <Input
          label="Message"
          placeholder="Message"
          value={body}
          onChangeText={setBody}
          multiline
        />

        <AppText variant="sectionHeader">Audience</AppText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {AUDIENCES.map((option) => (
            <Chip
              key={option}
              variant="admin"
              label={option}
              selected={audience === option}
              onPress={() => setAudience(option)}
            />
          ))}
        </View>

        <Button
          tone="admin"
          label="Send Broadcast"
          isLoading={broadcast.isPending}
          loadingLabel="Sending…"
          disabled={!title || !body}
          onPress={async () => {
            await broadcast.mutateAsync({ title, body, audience });
            setTitle('');
            setBody('');
            toast('Broadcast sent');
          }}
        />
      </View>
    </View>
  );
}
