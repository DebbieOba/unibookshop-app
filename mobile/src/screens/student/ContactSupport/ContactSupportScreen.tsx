import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Input } from '../../../components/Input';

type Props = NativeStackScreenProps<StudentStackParamList, 'ContactSupport'>;

const CATEGORIES = ['Account', 'Orders', 'Payments', 'Delivery', 'Returns', 'Security'];
const SUPPORT_EMAIL = 'support@curricula.app';

// No support-ticket backend exists — this opens the device's mail app with a
// prefilled message instead of submitting to an endpoint that doesn't exist.
export function ContactSupportScreen({ route }: Props) {
  const theme = useTheme();
  const toast = useToast();
  const email = useAuthStore((s) => s.user?.email);
  const [category, setCategory] = useState(route.params?.category ?? CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const canSend = subject.trim().length > 0 && message.trim().length > 0;

  const onSend = async () => {
    const mailSubject = `[${category}] ${subject}`;
    const body = `${message}\n\n—\nAccount: ${email ?? 'not signed in'}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      toast('No email app is set up on this device', 'error');
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
    >
      <AppText variant="title">Contact support</AppText>
      <AppText variant="body" style={{ color: theme.colors.textSecondary, marginTop: -theme.spacing.sm }}>
        We'll open your email app with a message ready to send to our support team.
      </AppText>

      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
          Category
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
      </View>

      <Input label="Subject" placeholder="Briefly describe the issue" value={subject} onChangeText={setSubject} />
      <Input
        label="Message"
        placeholder="Tell us what's going on"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button label="Send message" icon="mail-outline" disabled={!canSend} onPress={onSend} />
    </ScrollView>
  );
}
