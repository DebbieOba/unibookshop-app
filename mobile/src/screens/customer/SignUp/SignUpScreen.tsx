import { useState, type ReactNode } from "react";
import { Pressable, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useRegister, useBookshops } from "../../../hooks/useAuth";
import { authApi } from "../../../api/auth.api";
import { useMutation } from "@tanstack/react-query";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Input, InputTrailingIcon } from "../../../components/Input";
import { AuthBackdrop } from "../../../components/AuthBackdrop";
import { SearchableBottomSheet } from "../../../components/SearchableBottomSheet";

const schema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((v) => v, "You must agree to continue"),
    mode: z.enum(["join", "create"]),
    bookshopId: z.string().optional(),
    bookshopName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.mode === "join" && !data.firstName?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "First name is required",
      path: ["firstName"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "join" && !data.lastName?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Last name is required",
      path: ["lastName"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "join" && !data.bookshopId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a bookshop to join",
      path: ["bookshopId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.mode === "create" &&
        (!data.bookshopName || data.bookshopName.trim().length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter a name for the new bookshop",
      path: ["bookshopName"],
    },
  );

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

function inputStyle(theme: any) {
  return {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.input,
    backgroundColor: theme.colors.surface,
    justifyContent: "center" as const,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText
        variant="label"
        weight="semiBold"
        style={{ color: theme.colors.textSecondary }}
      >
        {label}
      </AppText>
      {children}
      {error ? (
        <AppText variant="label" style={{ color: theme.colors.error }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const register = useRegister();
  const sendOtp = useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email, "verify-email"),
  });
  const bookshopsQuery = useBookshops();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bookshopSheetOpen, setBookshopSheetOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      mode: "join",
      bookshopId: "",
      bookshopName: "",
    },
  });

  const agreeToTerms = watch("agreeToTerms");
  const mode = watch("mode");
  const bookshopId = watch("bookshopId");
  const isSubmitting = register.isPending || sendOtp.isPending;

  const selectedBookshop = bookshopsQuery.data?.find(
    (b) => b.id === bookshopId,
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        role: values.mode === "create" ? "seller" : "customer",
        bookshopId: values.bookshopId || undefined,
        bookshopName: values.bookshopName || undefined,
      });
      // Registration succeeded (payload cached in Redis) — proceed to VerifyEmail
      navigation.navigate("VerifyEmail", {
        email: values.email,
        purpose: "verify-email",
        password: values.password, // used by VerifyEmailScreen to auto-login after verification
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Could not create your account. Check your details and try again.";
      
      if (msg === "Email already registered") {
        Alert.alert(
          "Account Exists",
          "An account with this email already exists. Would you like to sign in instead?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign In", onPress: () => navigation.navigate("Login") },
          ]
        );
      } else {
        setSubmitError(msg);
      }
    }
  });

  return (
    <AuthBackdrop heightFraction={0.22}>
      <View
        style={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="title">Welcome.</AppText>
        <AppText
          variant="body"
          style={{
            color: theme.colors.textSecondary,
            marginTop: -theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          }}
        >
          Let's get your BOOKDECK account set up.
        </AppText>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              leadingIcon="mail-outline"
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
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
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
              label="Password"
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input
              leadingIcon="lock-closed-outline"
              trailingAction={
                <InputTrailingIcon
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                />
              }
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Bookshop Mode Segmented Toggles */}
        <Field label="Who are you?">
          <View
            style={[
              styles.modeContainer,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radii.card,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "join" && {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.button,
                },
              ]}
              onPress={() => setValue("mode", "join", { shouldValidate: true })}
            >
              <AppText
                variant="bodyMedium"
                style={{
                  color:
                    mode === "join"
                      ? theme.colors.textInverse
                      : theme.colors.textSecondary,
                }}
              >
                Customer
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "create" && {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.button,
                },
              ]}
              onPress={() =>
                setValue("mode", "create", { shouldValidate: true })
              }
            >
              <AppText
                variant="bodyMedium"
                style={{
                  color:
                    mode === "create"
                      ? theme.colors.textInverse
                      : theme.colors.textSecondary,
                }}
              >
                Bookstore Seller
              </AppText>
            </TouchableOpacity>
          </View>
        </Field>

        {mode === "join" ? (
          <>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <Input
                      leadingIcon="person-outline"
                      label="First Name"
                      placeholder="John"
                      autoCapitalize="words"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      autoCapitalize="words"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>
            <Field label="Choose Bookshop" error={errors.bookshopId?.message}>
              <Pressable
                onPress={() => setBookshopSheetOpen(true)}
                style={inputStyle(theme)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AppText
                    variant="body"
                    style={{
                      color: selectedBookshop
                        ? theme.colors.textPrimary
                        : theme.colors.textTertiary,
                    }}
                  >
                    {selectedBookshop
                      ? selectedBookshop.name
                      : "Select a bookshop..."}
                  </AppText>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </Pressable>
            </Field>
          </>
        ) : (
          <Controller
            control={control}
            name="bookshopName"
            render={({ field }) => (
              <Input
                leadingIcon="business-outline"
                placeholder="Your Bookstore Name (e.g. ObaDee Books)"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.bookshopName?.message}
              />
            )}
          />
        )}


        <Controller
          control={control}
          name="agreeToTerms"
          render={({ field }) => (
            <Pressable
              onPress={() => field.onChange(!agreeToTerms)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.xs,
              }}
            >
              <Ionicons
                name={agreeToTerms ? "checkbox" : "square-outline"}
                size={20}
                color={
                  agreeToTerms
                    ? theme.colors.primary
                    : theme.colors.textTertiary
                }
              />
              <AppText
                variant="body"
                style={{ color: theme.colors.textSecondary, flex: 1 }}
              >
                I agree to the Terms of Service & Privacy Policy
              </AppText>
            </Pressable>
          )}
        />

        <Button
          label="Create Account"
          isLoading={isSubmitting}
          loadingLabel="Creating account…"
          onPress={onSubmit}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.xs,
          }}
        >
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            Already have an account?
          </AppText>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <AppText
              variant="body"
              weight="bold"
              style={{ color: theme.colors.primary }}
            >
              Sign in
            </AppText>
          </Pressable>
        </View>
        <SearchableBottomSheet
          visible={bookshopSheetOpen}
          title="Select Bookshop"
          items={bookshopsQuery.data ?? []}
          selectedId={bookshopId}
          onSelect={(b) =>
            setValue("bookshopId", b.id, { shouldValidate: true })
          }
          onClose={() => setBookshopSheetOpen(false)}
        />
      </View>
    </AuthBackdrop>
  );
}

const styles = StyleSheet.create({
  modeContainer: {
    flexDirection: "row",
    padding: 4,
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
});
