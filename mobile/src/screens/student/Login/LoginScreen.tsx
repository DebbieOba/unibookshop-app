import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useLogin } from '../../../hooks/useAuth';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input, InputTrailingIcon } from '../../../components/Input';
import { AuthBackdrop } from '../../../components/AuthBackdrop';
import { getErrorMessage } from '../../../lib/apiError';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const schema = z.object({
  identifier: z
    .string()
    .min(1, 'Enter your email or matric number'),
  password: z.string().min(1, 'Enter your password'),
});

type FormValues = z.infer<typeof schema>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: __DEV__ ? 'student1@curricula.test' : '',
      password: __DEV__ ? 'Student@123' : '',
    },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  // Dev-mode quick-fill helpers
  const fillStudent = () => { setValue('identifier', 'student1@curricula.test'); setValue('password', 'Student@123'); };
  const fillAdmin = () => { setValue('identifier', 'admin1@curricula.test'); setValue('password', 'Admin@123'); };

  // Extract a human-readable error from the mutation
  const loginErrorMessage = login.isError
    ? getErrorMessage(login.error)
    : null;

  return (
    <AuthBackdrop heightFraction={0.4}>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="title">Welcome back</AppText>
        <AppText
          variant="body"
          style={{ color: theme.colors.textSecondary, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.xs }}
        >
          Sign in to your CURRICULA account
        </AppText>

        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <Input
              leadingIcon="person-outline"
              placeholder="Email or matric number (e.g. EEE/34/1234)"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.identifier?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              leadingIcon="lock-closed-outline"
              trailingAction={
                <InputTrailingIcon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end' }}>
          <AppText variant="label" weight="semiBold" style={{ color: theme.colors.primary }}>
            Forgot password?
          </AppText>
        </Pressable>

        {loginErrorMessage ? (
          <AppText variant="label" style={{ color: theme.colors.error }}>
            {loginErrorMessage}
          </AppText>
        ) : null}


        <Button
          label="Sign In"
          isLoading={login.isPending}
          loadingLabel="Signing in…"
          onPress={onSubmit}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            Don't have an account yet?
          </AppText>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <AppText variant="body" weight="bold" style={{ color: theme.colors.primary }}>
              Create Account
            </AppText>
          </Pressable>
        </View>
      </View>
    </AuthBackdrop>
  );
}
