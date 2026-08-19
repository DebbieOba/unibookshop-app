import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useBookRatings } from '../../../hooks/useRatings';
import { Rating } from '../../../types/rating';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Chip } from '../../../components/Chip';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Skeleton } from '../../../components/Skeleton';

type Props = NativeStackScreenProps<StudentStackParamList, 'Reviews'>;

type FilterValue = 'all' | '5' | '4' | '3' | 'comments';
const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: 'All', value: 'all' },
  { label: '5 stars', value: '5' },
  { label: '4 stars', value: '4' },
  { label: '3 stars', value: '3' },
  { label: 'With comments', value: 'comments' },
];

type SortValue = 'recent' | 'highest' | 'lowest';
const SORTS: Array<{ label: string; value: SortValue }> = [
  { label: 'Most recent', value: 'recent' },
  { label: 'Highest rated', value: 'highest' },
  { label: 'Lowest rated', value: 'lowest' },
];

function StarRow({ score, size = 14 }: { score: number; size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= score ? 'star' : 'star-outline'} size={size} color={theme.colors.warning} />
      ))}
    </View>
  );
}

export function ReviewsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { bookId, bookTitle } = route.params;
  const ratings = useBookRatings(bookId);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sort, setSort] = useState<SortValue>('recent');

  const all = ratings.data ?? [];
  const average = all.length ? all.reduce((sum, r) => sum + r.score, 0) / all.length : 0;
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    all.forEach((r) => {
      if (r.score >= 1 && r.score <= 5) counts[r.score - 1] += 1;
    });
    return counts;
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (filter === 'comments') list = list.filter((r) => !!r.comment?.trim());
    else if (filter !== 'all') list = list.filter((r) => r.score === Number(filter));

    return [...list].sort((a, b) => {
      if (sort === 'highest') return b.score - a.score;
      if (sort === 'lowest') return a.score - b.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [all, filter, sort]);

  if (ratings.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Skeleton height={120} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </View>
    );
  }
  if (ratings.isError) return <ErrorState onRetry={() => ratings.refetch()} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.md }}>
            <AppText variant="title" numberOfLines={1}>
              {bookTitle}
            </AppText>

            <Card style={{ flexDirection: 'row', gap: theme.spacing.lg, alignItems: 'center' }}>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <AppText variant="display">{average.toFixed(1)}</AppText>
                <StarRow score={Math.round(average)} size={16} />
                <AppText variant="caption">{all.length} {all.length === 1 ? 'review' : 'reviews'}</AppText>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star - 1];
                  const pct = all.length ? count / all.length : 0;
                  return (
                    <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                      <AppText variant="caption" style={{ width: 10 }}>
                        {star}
                      </AppText>
                      <View style={{ flex: 1, height: 6, borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceAlt }}>
                        <View
                          style={{
                            width: `${pct * 100}%`,
                            height: 6,
                            borderRadius: theme.radii.pill,
                            backgroundColor: theme.colors.warning,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            <Button
              label="Write a review"
              variant="outline"
              icon="create-outline"
              onPress={() => navigation.navigate('WriteReview', { bookId, bookTitle })}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {FILTERS.map((f) => (
                <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {SORTS.map((s) => (
                <Chip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            message="No reviews yet"
            subtext="Be the first to share what you think of this book."
          />
        }
        renderItem={({ item }: { item: Rating }) => (
          <Card style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="bodyMedium">Student</AppText>
              <AppText variant="caption">{new Date(item.createdAt).toLocaleDateString()}</AppText>
            </View>
            <StarRow score={item.score} />
            {item.comment ? (
              <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
                {item.comment}
              </AppText>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}
