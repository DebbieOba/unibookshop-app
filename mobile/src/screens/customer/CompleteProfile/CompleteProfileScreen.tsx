import { ReactNode, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useTheme } from "../../../hooks/useTheme";
import { useUpdateProfile, useUploadAvatar } from "../../../hooks/useProfile";
import { useAuthStore } from "../../../store/authStore";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Chip } from "../../../components/Chip";
import { AuthBackdrop } from "../../../components/AuthBackdrop";
import { AvatarPicker } from "../../../components/AvatarPicker";

const INTERESTS = [
  "Engineering",
  "Computer Science",
  "Business",
  "Medicine",
  "Law",
  "Arts",
];

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    height: 48,
    borderRadius: theme.radii.input,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
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

/**
 * Shown once, right after a fresh signup (gated by authStore.needsOnboarding
 * — see RootNavigator.tsx), before the dashboard. Carries what the old
 * SignUp wizard's steps 2–4 used to collect: this is that content, moved
 * out from behind the account-creation form so signup itself is just
 * identifier + password.
 */
export function CompleteProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", interests: [] },
  });

  const interests = watch("interests") ?? [];

  const isSubmitting = updateProfile.isPending || uploadAvatar.isPending;

  const pickAvatar = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!picked.canceled) setAvatarUri(picked.assets[0].uri);
  };

  const toggleInterest = (interest: string) => {
    const next = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest];
    setValue("interests", next);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName,
        phone: values.phone || undefined,
        interests: values.interests,
      });
      if (avatarUri) {
        await uploadAvatar.mutateAsync(avatarUri);
      }
      // RootNavigator falls through to CustomerStack (dashboard) once this clears.
      setNeedsOnboarding(false);
    } catch {
      setSubmitError(
        "Could not save your profile. Check your details and try again.",
      );
    }
  });

  return (
    <AuthBackdrop heightFraction={0.25}>
      <View
        style={{
          flexGrow: 1,
          paddingTop: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="title">Complete your profile</AppText>
        <AppText
          variant="body"
          style={{
            color: theme.colors.textSecondary,
            marginTop: -theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          }}
        >
          Just a few more details before you dive in.
        </AppText>

        <View style={{ alignItems: "center", marginBottom: theme.spacing.sm }}>
          <AvatarPicker uri={avatarUri} onPress={pickAvatar} />
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <Input
              label="Full Name"
              placeholder="Your full name"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Phone Number (optional)"
              placeholder="e.g. 0803 000 0000"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <AppText variant="sectionHeader">What are you interested in?</AppText>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {INTERESTS.map((interest) => (
            <Chip
              key={interest}
              label={interest}
              selected={interests.includes(interest)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
        </View>

        {submitError ? (
          <AppText variant="label" style={{ color: theme.colors.error }}>
            {submitError}
          </AppText>
        ) : null}

        <Button
          label="Finish"
          isLoading={isSubmitting}
          loadingLabel="Saving…"
          onPress={onSubmit}
        />
      </View>
    </AuthBackdrop>
  );
}
