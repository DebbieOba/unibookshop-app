import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useForgotPassword } from '../../../hooks/useAuth';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const schema = z.object({
  email: z.email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useTheme();
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await forgotPassword.mutateAsync(values.email);
    setSent(true);
  });

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
      <AppText variant="title">Forgot Password</AppText>

      {sent ? (
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          If an account exists for that email, a reset link has been sent. Check your inbox and
          follow the link to set a new password.
        </AppText>
      ) : (
        <>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            Enter your email and we'll send you a link to reset your password.
          </AppText>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                placeholder="Email"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={field.value}
                onChangeText={field.onChange}
                style={{
                  height: 48,
                  borderRadius: theme.radii.input,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: errors.email ? theme.colors.error : theme.colors.border,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.textPrimary,
                }}
              />
            )}
          />
          {errors.email ? (
            <AppText variant="label" style={{ color: theme.colors.error }}>
              {errors.email.message}
            </AppText>
          ) : null}
          <Button
            label="Send Reset Link"
            isLoading={forgotPassword.isPending}
            loadingLabel="Sending…"
            onPress={onSubmit}
          />
        </>
      )}

      <Button label="Back to Login" tone="student" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
