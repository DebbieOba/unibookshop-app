import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useResetPassword } from '../../../hooks/useAuth';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const schema = z
  .object({
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

// Reached via the deep link in the password-reset email
// (curricula://reset-password?token=...) — see RootNavigator's `linking`
// config and backend PasswordResetEmail.tsx.
export function ResetPasswordScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const token = route.params?.token;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    await resetPassword.mutateAsync({ token, newPassword: values.newPassword });
    setDone(true);
  });

  if (!token) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: 'center',
          padding: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="title">Invalid Link</AppText>
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          This reset link is missing its token. Request a new one from the login screen.
        </AppText>
        <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
      }}
    >
      <AppText variant="title">Reset Password</AppText>

      {done ? (
        <>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            Your password has been updated. Log in with your new password.
          </AppText>
          <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <TextInput
                placeholder="New password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: errors.newPassword ? theme.colors.error : theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                }}
              />
            )}
          />
          {errors.newPassword ? (
            <AppText variant="label" style={{ color: theme.colors.error }}>
              {errors.newPassword.message}
            </AppText>
          ) : null}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                }}
              />
            )}
          />
          {errors.confirmPassword ? (
            <AppText variant="label" style={{ color: theme.colors.error }}>
              {errors.confirmPassword.message}
            </AppText>
          ) : null}

          {resetPassword.isError ? (
            <AppText variant="label" style={{ color: theme.colors.error }}>
              That link may have expired. Request a new one.
            </AppText>
          ) : null}
          <Button
            label="Set New Password"
            isLoading={resetPassword.isPending}
            loadingLabel="Saving…"
            onPress={onSubmit}
          />
        </>
      )}
    </View>
  );
}
