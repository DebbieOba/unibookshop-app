import { useState, useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useChangePassword } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input, InputTrailingIcon } from '../../../components/Input';
import { Card } from '../../../components/Card';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<StudentStackParamList, 'Security'>;

export function SecurityScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const changePassword = useChangePassword();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Live password strength checklist calculations
  const requirements = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      letter: /[a-zA-Z]/.test(newPassword),
    };
  }, [newPassword]);

  const canSubmit = currentPassword.length > 0 && requirements.length && requirements.number && requirements.letter;

  const onSubmit = async () => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast('Password updated successfully', 'success');
      navigation.goBack();
    } catch {
      toast('Could not update password. Please check your credentials.', 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Lock Illustration Banner */}
        <View style={{ alignItems: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
          <View style={{ backgroundColor: theme.colors.primary + '12', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm }}>
            <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
          </View>
          <AppText variant="title" style={{ fontSize: 20 }}>Account Security</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 2 }}>
            Protect your curricula orders with a strong password
          </AppText>
        </View>

        {/* Input Fields Wrapper Card */}
        <Card style={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
          <Input
            label="Current Password"
            placeholder="Verify current password"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            trailingAction={<InputTrailingIcon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowCurrent((v) => !v)} />}
          />
          
          <Input
            label="New Password"
            placeholder="At least 8 characters with numbers"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            trailingAction={<InputTrailingIcon name={showNew ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowNew((v) => !v)} />}
          />
        </Card>

        {/* Password Strength validation guidelines checklist */}
        <Card style={{ gap: theme.spacing.xs, padding: theme.spacing.md, backgroundColor: theme.colors.surfaceAlt }}>
          <AppText variant="caption" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Password Strength Requirements
          </AppText>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Ionicons
              name={requirements.length ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={requirements.length ? "#34C759" : theme.colors.textTertiary}
            />
            <AppText variant="caption" style={{ color: requirements.length ? theme.colors.textPrimary : theme.colors.textSecondary }}>
              At least 8 characters long
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name={requirements.number ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={requirements.number ? "#34C759" : theme.colors.textTertiary}
            />
            <AppText variant="caption" style={{ color: requirements.number ? theme.colors.textPrimary : theme.colors.textSecondary }}>
              Contains at least one number
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name={requirements.letter ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={requirements.letter ? "#34C759" : theme.colors.textTertiary}
            />
            <AppText variant="caption" style={{ color: requirements.letter ? theme.colors.textPrimary : theme.colors.textSecondary }}>
              Contains letters
            </AppText>
          </View>
        </Card>

        {/* Action Row - Split navigation controls */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
          <Button
            style={{ flex: 1 }}
            label="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
          <Button
            style={{ flex: 2 }}
            label="Update Password"
            isLoading={changePassword.isPending}
            loadingLabel="Updating…"
            disabled={!canSubmit}
            onPress={onSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}
