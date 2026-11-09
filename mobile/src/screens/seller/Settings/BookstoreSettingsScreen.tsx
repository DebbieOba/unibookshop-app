import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { SellerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";

import { secureStorage } from "../../../lib/secureStorage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../lib/apiError";
import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../api/client";

type Props = NativeStackScreenProps<SellerStackParamList, "BookstoreSettings">;

const schema = z.object({
  name: z.string().min(1, "Bookstore name is required"),
  description: z.string().optional().nullable(),
  email: z
    .union([z.literal(""), z.string().email("Valid email required")])
    .optional()
    .nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function BookstoreSettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bookshopId = user?.bookshopId;

  const { data: bookshop, isLoading } = useQuery({
    queryKey: ["bookshop", bookshopId ?? "me"],
    queryFn: async () => {
      const endpoint = bookshopId ? `/bookshop/${bookshopId}` : "/bookshop/me";
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      openingHours: "",
    },
  });

  useEffect(() => {
    if (bookshop) {
      reset({
        name: bookshop.name || "",
        description: bookshop.description || "",
        email: bookshop.email || "",
        phone: bookshop.phone || "",
        address: bookshop.address || "",
        city: bookshop.city || "",
        state: bookshop.state || "",
        country: bookshop.country || "",
        openingHours: bookshop.openingHours || "",
      });
    }
  }, [bookshop, reset]);

  const updateBookshop = useMutation({
    mutationFn: async (values: FormValues) => {
      const targetId = bookshopId ?? bookshop?.id;
      const endpoint = targetId ? `/bookshop/${targetId}` : "/bookshop/me";
      const res = await api.patch(endpoint, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshop"] });
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
      navigation.goBack();
    },
    onError: (error) => {
      setSubmitError(getErrorMessage(error));
    },
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    updateBookshop.mutate(values);
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <AppText variant="title">Bookstore Profile</AppText>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + 100,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          Manage your bookstore's public profile and contact information.
        </AppText>

        <View style={{ gap: theme.spacing.md }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Bookstore Name"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.name?.message}
                placeholder="e.g. FUTA Campus Bookstore"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Input
                label="Description"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.description?.message}
                placeholder="A short description of your bookstore"
                multiline
                numberOfLines={3}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Contact Email"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.email?.message}
                placeholder="contact@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                label="Phone Number"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.phone?.message}
                placeholder="+234 800 000 0000"
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                label="Street Address"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.address?.message}
                placeholder="123 Campus Way"
              />
            )}
          />

          <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Input
                    label="City"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={errors.city?.message}
                    placeholder="Akure"
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Input
                    label="State"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={errors.state?.message}
                    placeholder="Ondo"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="openingHours"
            render={({ field }) => (
              <Input
                label="Opening Hours"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.openingHours?.message}
                placeholder="Mon-Fri, 9am - 5pm"
              />
            )}
          />
        </View>

        {submitError ? (
          <AppText variant="label" style={{ color: theme.colors.error }}>
            {submitError}
          </AppText>
        ) : null}
      </ScrollView>

      {/* Sticky footer for submit button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.md),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button
          label="Save Changes"
          onPress={onSubmit}
          isLoading={updateBookshop.isPending}
          disabled={!isDirty || isLoading}
        />
      </View>
    </View>
  );
}
