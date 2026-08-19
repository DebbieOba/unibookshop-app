import { useState, useEffect } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../../../hooks/useProfile';
import { useDepartments, useLevels } from '../../../hooks/useOrgStructure';
import { useToast } from '../../../hooks/useToast';
import { MATRIC_NUMBER_REGEX } from '../../../lib/validation';
import { getErrorMessage } from '../../../lib/apiError';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Chip } from '../../../components/Chip';
import { AvatarPicker } from '../../../components/AvatarPicker';
import { SearchableBottomSheet } from '../../../components/SearchableBottomSheet';
import { Skeleton } from '../../../components/Skeleton';

type Props = NativeStackScreenProps<StudentStackParamList, 'EditProfile'>;

const INTERESTS = ['Engineering', 'Computer Science', 'Business', 'Medicine', 'Law', 'Arts'];

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().optional(),
  matricNumber: z
    .string()
    .optional()
    .refine((value) => !value || MATRIC_NUMBER_REGEX.test(value), 'Format must be like EEE/34/1234'),
  departmentId: z.string().optional(),
  levelId: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const departments = useDepartments();
  const levels = useLevels();
  
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [departmentSheetOpen, setDepartmentSheetOpen] = useState(false);
  const [levelSheetOpen, setLevelSheetOpen] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      fullName: profile.data?.fullName ?? '',
      phone: profile.data?.phone ?? '',
      matricNumber: profile.data?.user?.matricNumber ?? '',
      departmentId: profile.data?.user?.departmentId ?? '',
      levelId: profile.data?.user?.levelId ?? '',
      interests: profile.data?.interests ?? [],
    },
  });

  const departmentId = watch('departmentId');
  const levelId = watch('levelId');
  const interests = watch('interests') ?? [];
  const selectedDepartment = departments.data?.find((d) => d.id === departmentId);
  const selectedLevel = levels.data?.find((l) => l.id === levelId);

  const isSubmitting = updateProfile.isPending || uploadAvatar.isPending;

  const pickAvatar = async () => {
    // 1. Check current permission status first (without prompting)
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (existing.status === 'denied' && !existing.canAskAgain) {
      // Permission was permanently denied — send user to device Settings
      Alert.alert(
        'Photo Access Required',
        'Curricula needs access to your photo library to upload your profile picture. Please enable it in your device Settings.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    // 2. Request permission (shows native dialog on first call)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      toast('Photo library access is needed to upload a profile picture', 'error');
      return;
    }

    // 3. Permission granted — open the image picker
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!picked.canceled) setAvatarUri(picked.assets[0].uri);
  };

  const toggleInterest = (interest: string) => {
    const next = interests.includes(interest) ? interests.filter((i) => i !== interest) : [...interests, interest];
    setValue('interests', next);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName,
        phone: values.phone || undefined,
        matricNumber: values.matricNumber || undefined,
        departmentId: values.departmentId || undefined,
        levelId: values.levelId || undefined,
        interests: values.interests,
      });
      if (avatarUri) {
        await uploadAvatar.mutateAsync(avatarUri);
      }
      toast('Profile updated');
      navigation.goBack();
    } catch (error) {
      toast(getErrorMessage(error, 'Could not save your profile'), 'error');
    }
  });

  if (profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md }}>
        <Skeleton height={300} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Title area with no top header name and arrow */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <AppText variant="title">Edit Profile</AppText>
          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
            Update your personal details & department affiliations
          </AppText>
        </View>

        <View style={{ alignItems: 'center', marginVertical: theme.spacing.sm }}>
          <AvatarPicker uri={avatarUri ?? profile.data?.avatarUrl} onPress={pickAvatar} />
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <Input label="Full Name" placeholder="Your full name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input label="Phone Number (optional)" placeholder="e.g. 0803 000 0000" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="matricNumber"
          render={({ field }) => (
            <Input
              label="Matric Number"
              placeholder="e.g. EEE/34/1234"
              autoCapitalize="characters"
              value={field.value}
              onChangeText={(text) => field.onChange(text.toUpperCase())}
              error={errors.matricNumber?.message}
              helperText="Must be unique to you — no two accounts can share a matric number."
            />
          )}
        />

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
            Department
          </AppText>
          <Pressable
            onPress={() => setDepartmentSheetOpen(true)}
            style={{
              height: 48,
              borderRadius: theme.radii.input,
              backgroundColor: theme.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <AppText variant="body" style={{ color: selectedDepartment ? theme.colors.textPrimary : theme.colors.textTertiary }}>
              {selectedDepartment?.name ?? 'Select your department'}
            </AppText>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
            Level
          </AppText>
          <Pressable
            onPress={() => setLevelSheetOpen(true)}
            style={{
              height: 48,
              borderRadius: theme.radii.input,
              backgroundColor: theme.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <AppText variant="body" style={{ color: selectedLevel ? theme.colors.textPrimary : theme.colors.textTertiary }}>
              {selectedLevel?.name ?? 'Select your level'}
            </AppText>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        </View>

        <SearchableBottomSheet
          visible={departmentSheetOpen}
          title="Select Department"
          items={departments.data ?? []}
          selectedId={departmentId}
          onSelect={(dept) => setValue('departmentId', dept.id)}
          onClose={() => setDepartmentSheetOpen(false)}
        />
        <SearchableBottomSheet
          visible={levelSheetOpen}
          title="Select Level"
          items={levels.data ?? []}
          selectedId={levelId}
          onSelect={(level) => setValue('levelId', level.id)}
          onClose={() => setLevelSheetOpen(false)}
          searchable={false}
        />

        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
          <AppText variant="sectionHeader">Academic Interests</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: 4 }}>
            {INTERESTS.map((interest) => (
              <Chip key={interest} label={interest} selected={interests.includes(interest)} onPress={() => toggleInterest(interest)} />
            ))}
          </View>
        </View>

        {/* Action Row - No plain text/arrow header layout */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Button
            style={{ flex: 1 }}
            label="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
          <Button
            style={{ flex: 2 }}
            label="Save Changes"
            isLoading={isSubmitting}
            loadingLabel="Saving…"
            onPress={onSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}
