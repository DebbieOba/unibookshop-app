import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useBookRatings, useRateBook } from '../../../hooks/useRatings';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<StudentStackParamList, 'WriteReview'>;

const MAX_LENGTH = 500;

export function WriteReviewScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const toast = useToast();
  const { bookId, bookTitle } = route.params;
  const userId = useAuthStore((s) => s.user?.id);
  const ratings = useBookRatings(bookId);
  const rateBook = useRateBook(bookId);

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const existing = ratings.data?.find((r) => r.userId === userId);

  useEffect(() => {
    if (existing) {
      setScore(existing.score);
      setComment(existing.comment ?? '');
    }
  }, [existing]);

  const onSubmit = () => {
    if (score < 1) return;
    rateBook.mutate(
      { score, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast(existing ? 'Review updated' : 'Review submitted');
          navigation.goBack();
        },
        onError: () => toast('Could not submit your review', 'error'),
      },
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="label" style={{ color: theme.colors.textSecondary }}>
          {existing ? 'Update your review' : 'Write a review'}
        </AppText>
        <AppText variant="title" numberOfLines={2}>
          {bookTitle}
        </AppText>
      </View>

      <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setScore(n)} hitSlop={4} style={{ padding: theme.spacing.xs }}>
              <Ionicons name={n <= score ? 'star' : 'star-outline'} size={32} color={theme.colors.warning} />
            </Pressable>
          ))}
        </View>
        <AppText variant="label" style={{ color: theme.colors.textSecondary }}>
          {score > 0 ? `${score} out of 5` : 'Tap a star to rate'}
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textSecondary }}>
            Review (optional)
          </AppText>
          <AppText variant="caption">
            {comment.length}/{MAX_LENGTH}
          </AppText>
        </View>
        <TextInput
          value={comment}
          onChangeText={(text) => setComment(text.slice(0, MAX_LENGTH))}
          placeholder="What did you think of this book?"
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          maxLength={MAX_LENGTH}
          style={{
            minHeight: 120,
            borderRadius: theme.radii.input,
            backgroundColor: theme.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.md,
            color: theme.colors.textPrimary,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <Button
        label={existing ? 'Update review' : 'Submit review'}
        isLoading={rateBook.isPending}
        loadingLabel="Submitting…"
        disabled={score < 1}
        onPress={onSubmit}
      />
    </ScrollView>
  );
}
