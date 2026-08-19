import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import {
  ONBOARDING_ORDER_SVG,
  ONBOARDING_SAVE_SVG,
  ONBOARDING_SEARCH_SVG,
} from '../../../assets/illustrations/onboarding';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';

const { width } = Dimensions.get('window');

interface Slide {
  illustration: string;
  heading: string;
  subtitle: string;
}

// Slide copy matches CurriculaMobileDesignSystem.md §10.2 verbatim.
const SLIDES: Slide[] = [
  {
    illustration: ONBOARDING_SEARCH_SVG,
    heading: 'Find textbooks for your course',
    subtitle: 'Browse books selected for your department, level and academic needs.',
  },
  {
    illustration: ONBOARDING_SAVE_SVG,
    heading: 'Buy with confidence',
    subtitle: 'See current prices, availability and clear order information before paying.',
  },
  {
    illustration: ONBOARDING_ORDER_SVG,
    heading: 'Track every order',
    subtitle: 'Receive updates from payment confirmation until your books arrive.',
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          alignItems: 'flex-end',
          paddingHorizontal: theme.spacing.xl,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        <Pressable onPress={onDone} hitSlop={8}>
          <AppText variant="label" weight="semiBold" style={{ color: theme.colors.textTertiary }}>
            Skip
          </AppText>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.heading}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: theme.spacing.xl, alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                height: 260,
                borderRadius: theme.radii.card,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.xxl,
                overflow: 'hidden',
              }}
            >
              <SvgXml xml={item.illustration} width="82%" height="82%" />
            </View>
            <AppText variant="title" style={{ textAlign: 'center' }}>
              {item.heading}
            </AppText>
            <AppText
              variant="body"
              style={{
                textAlign: 'center',
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
              }}
            >
              {item.subtitle}
            </AppText>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        {SLIDES.map((slide, i) => (
          <View
            key={slide.heading}
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.primary,
              opacity: i === index ? 1 : 0.3,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: insets.bottom + theme.spacing.lg }}>
        <Button label={isLast ? 'Get Started' : 'Continue'} onPress={goNext} />
      </View>
    </View>
  );
}
