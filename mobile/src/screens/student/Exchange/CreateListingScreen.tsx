import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useCreateListing } from '../../../hooks/useExchange';
import { useToast } from '../../../hooks/useToast';
import { ListingCondition } from '../../../types/exchange';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Input } from '../../../components/Input';

type Props = NativeStackScreenProps<StudentStackParamList, 'CreateListing'>;

const CONDITIONS: Array<{ value: ListingCondition; label: string }> = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const MAX_IMAGES = 3;

export function CreateListingScreen({ navigation }: Props) {
  const theme = useTheme();
  const toast = useToast();
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('GOOD');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - imageUris.length,
    });
    if (!result.canceled) {
      setImageUris((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_IMAGES));
    }
  };

  const isValid = title.trim().length > 0 && Number(price) > 0;

  const onSubmit = () => {
    if (!isValid) return;
    createListing.mutate(
      {
        title: title.trim(),
        author: author.trim() || undefined,
        courseCode: courseCode.trim() || undefined,
        condition,
        price: Number(price),
        description: description.trim() || undefined,
        imageUris,
      },
      {
        onSuccess: () => {
          toast('Listing published');
          navigation.goBack();
        },
        onError: () => toast('Could not publish your listing', 'error'),
      },
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
    >
      <AppText variant="title">List a used book</AppText>
      <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
        Other students will see your name and phone number to arrange the exchange.
      </AppText>

      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
          Photos ({imageUris.length}/{MAX_IMAGES})
        </AppText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {imageUris.map((uri) => (
            <View key={uri} style={{ width: 72, height: 72 }}>
              <Image source={{ uri }} style={{ width: 72, height: 72, borderRadius: 12 }} contentFit="cover" />
              <Pressable
                onPress={() => setImageUris((prev) => prev.filter((u) => u !== uri))}
                style={{ position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.error, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          {imageUris.length < MAX_IMAGES ? (
            <Pressable
              onPress={pickImages}
              style={{ width: 72, height: 72, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}
            >
              <Ionicons name="camera-outline" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Input label="Title" placeholder="e.g. Principles of Electrical Engineering" value={title} onChangeText={setTitle} />
      <Input label="Author (optional)" placeholder="Author name" value={author} onChangeText={setAuthor} />
      <Input label="Course code (optional)" placeholder="e.g. EEE 311" value={courseCode} onChangeText={setCourseCode} autoCapitalize="characters" />
      <Input label="Price (₦)" placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />

      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
          Condition
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {CONDITIONS.map((c) => (
            <Chip key={c.value} label={c.label} selected={condition === c.value} onPress={() => setCondition(c.value)} />
          ))}
        </View>
      </View>

      <Input
        label="Description (optional)"
        placeholder="Any notes on condition, edition, highlights, etc."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button
        label="Publish listing"
        isLoading={createListing.isPending}
        loadingLabel="Publishing…"
        disabled={!isValid}
        onPress={onSubmit}
      />
    </ScrollView>
  );
}
