import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentTabParamList, StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { useBooks, useCategories } from '../../../hooks/useBooks';
import { useOrders, useSavingsSummary, useSyllabusProgress } from '../../../hooks/useOrders';
import { useProfile } from '../../../hooks/useProfile';
import { useRecentlyViewedBooks } from '../../../hooks/useRecentlyViewed';
import { useFavourites, useToggleFavourite } from '../../../hooks/useFavourites';
import { AppText } from '../../../components/AppText';
import { BookCard } from '../../../components/BookCard';
import { OrderCard } from '../../../components/OrderCard';
import { Card } from '../../../components/Card';
import { Avatar } from '../../../components/Avatar';
import { StudentHeaderActions } from '../../../components/StudentHeaderActions';
import { SearchBar } from '../../../components/SearchBar';
import { IconButton } from '../../../components/IconButton';
import { SearchableBottomSheet } from '../../../components/SearchableBottomSheet';
import { Skeleton } from '../../../components/Skeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabParamList, 'Home'>,
  NativeStackScreenProps<StudentStackParamList>
>;

const CATEGORY_ICON_KEYWORDS: Array<[string, keyof typeof Ionicons.glyphMap]> = [
  ['engineer', 'construct-outline'],
  ['comput', 'hardware-chip-outline'],
  ['math', 'calculator-outline'],
  ['scien', 'flask-outline'],
  ['agric', 'leaf-outline'],
  ['manage', 'briefcase-outline'],
  ['business', 'briefcase-outline'],
  ['environ', 'earth-outline'],
  ['medic', 'medkit-outline'],
  ['law', 'hammer-outline'],
  ['art', 'color-palette-outline'],
];

function iconForCategory(name: string): keyof typeof Ionicons.glyphMap {
  const lower = name.toLowerCase();
  const match = CATEGORY_ICON_KEYWORDS.find(([keyword]) => lower.includes(keyword));
  return match?.[1] ?? 'book-outline';
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const books = useBooks({ page: 1 });
  const onSaleBooks = useBooks({ page: 1, limit: 20, onSale: true });
  const categories = useCategories();
  const orders = useOrders();
  const recentlyViewed = useRecentlyViewedBooks();
  const favourites = useFavourites();
  const toggleFavourite = useToggleFavourite();
  const savings = useSavingsSummary();
  const syllabus = useSyllabusProgress();

  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [syllabusSheetOpen, setSyllabusSheetOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef<ScrollView>(null);
  const BANNER_ITEM_WIDTH = Dimensions.get('window').width - 32 - 16; // screen width - horizontal padding - gap

  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  const handleApplyFilters = () => {
    setCategorySheetOpen(false);
    navigation.navigate('StudentTabs', {
      screen: 'Store',
      params: {
        categoryId: selectedCatId,
        inStockOnly: filterInStock,
        minPrice: filterMinPrice ? Number(filterMinPrice) : undefined,
        maxPrice: filterMaxPrice ? Number(filterMaxPrice) : undefined,
      },
    });
  };

  const handleResetFilters = () => {
    setSelectedCatId(undefined);
    setFilterInStock(false);
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const totalRequired = useMemo(() => {
    return syllabus.data ? syllabus.data.reduce((acc, curr) => acc + curr.requiredBookCount, 0) : 0;
  }, [syllabus.data]);

  const totalOwned = useMemo(() => {
    return syllabus.data ? syllabus.data.reduce((acc, curr) => acc + curr.ownedBookCount, 0) : 0;
  }, [syllabus.data]);

  const completionPercentage = useMemo(() => {
    return totalRequired > 0 ? Math.round((totalOwned / totalRequired) * 100) : 0;
  }, [totalRequired, totalOwned]);

  const maxSaleDiscountPercent = useMemo(() => {
    const onSale = onSaleBooks.data?.data ?? [];
    if (onSale.length === 0) return null;
    const percents = onSale
      .filter((b) => b.compareAtPrice)
      .map((b) => Math.round(((b.compareAtPrice! - b.price) / b.compareAtPrice!) * 100));
    return percents.length ? Math.max(...percents) : null;
  }, [onSaleBooks.data]);

  const BANNERS = [
    {
      title: maxSaleDiscountPercent ? `Academic Discount: Up to ${maxSaleDiscountPercent}% OFF` : 'Save on select textbooks',
      desc: 'Save on verified campus textbooks currently on sale this semester.',
      colors: ['#FF007A', '#7928CA'] as const,
      icon: 'sparkles' as const,
      buttonLabel: 'Shop Sale',
      onPress: () => navigation.navigate('StudentTabs', { screen: 'Store', params: { onSale: true } }),
    },
    {
      title: 'New Syllabus Arrivals',
      desc: 'Explore fresh textbooks added for your courses.',
      colors: ['#FF4D4D', '#F9CB28'] as const,
      icon: 'book' as const,
      buttonLabel: 'Explore Now',
      onPress: () => navigation.navigate('StudentTabs', { screen: 'Store', params: { sort: 'newest' } }),
    },
    {
      title: 'Free Campus Pickup',
      desc: 'Collect your textbooks at the school collection point, or choose delivery at checkout.',
      colors: ['#00DFD8', '#0070F3'] as const,
      icon: 'rocket' as const,
      buttonLabel: 'Learn More',
      onPress: () => navigation.navigate('HelpCentre'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % BANNERS.length;
      setActiveBannerIndex(nextIndex);
      bannerRef.current?.scrollTo({ x: nextIndex * (BANNER_ITEM_WIDTH + 16), animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBannerIndex]);

  const firstName = useMemo(() => profile.data?.fullName?.trim().split(/\s+/)[0], [profile.data?.fullName]);
  const activeOrder = orders.data?.find((o) => o.status === 'PROCESSING');

  const recommendedForLevel = useMemo(() => {
    const list = books.data?.data ?? [];
    const userLevel = profile.data?.user?.level?.name;
    const userDeptId = profile.data?.user?.departmentId;
    if (!userLevel && !userDeptId) {
      return list.slice(0, 5);
    }
    const matches = list.filter((book) => {
      const bookLevel = book.attributes?.level;
      const bookDeptId = book.attributes?.departmentId;
      return (userLevel && bookLevel === userLevel) || (userDeptId && bookDeptId === userDeptId);
    });
    return matches.slice(0, 5);
  }, [books.data, profile.data]);

  const newArrivals = useMemo(() => {
    return (books.data?.data ?? []).slice(0, 5);
  }, [books.data]);

  const popularInDept = useMemo(() => {
    const list = books.data?.data ?? [];
    const userDeptId = profile.data?.user?.departmentId;
    if (!userDeptId) return [];
    return list.filter((book) => book.attributes?.departmentId === userDeptId).slice(0, 5);
  }, [books.data, profile.data]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xs,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
          <Pressable
            onPress={() => {
              void profile.refetch();
              void books.refetch();
              void orders.refetch();
            }}
            style={({ pressed }) => ({
              backgroundColor: '#FFFFFF',
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Image
              source={require('../../../../assets/logo.png')}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
          </Pressable>
          <Avatar url={profile.data?.avatarUrl} fullName={profile.data?.fullName ?? ''} size={38} />
          <View style={{ gap: 1, flex: 1 }}>
            <AppText variant="body" weight="bold" style={{ color: theme.colors.textPrimary }}>
              Curricula Hub
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 10 }} numberOfLines={1}>
              {greeting()}, {firstName ?? 'Student'}
            </AppText>
          </View>
        </View>
        <StudentHeaderActions
          onCartPress={() => navigation.navigate('Cart')}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg }}>
        {books.isLoading ? (
          <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.md }}>
            {/* Search bar + filter button skeleton row */}
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <Skeleton height={48} style={{ flex: 1, borderRadius: 999 }} />
              <Skeleton height={48} width={48} style={{ borderRadius: 999 }} />
            </View>
            {/* Banner card skeleton */}
            <Skeleton height={130} style={{ borderRadius: 16 }} />
            {/* Academic Hub card skeleton */}
            <Skeleton height={72} style={{ borderRadius: 12 }} />
            {/* Section label + horizontal strip */}
            <View style={{ gap: theme.spacing.xs }}>
              <Skeleton height={16} width={140} style={{ borderRadius: 8 }} />
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
              </View>
            </View>
            {/* Second section label + horizontal strip */}
            <View style={{ gap: theme.spacing.xs }}>
              <Skeleton height={16} width={110} style={{ borderRadius: 8 }} />
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
                <Skeleton height={170} width={110} style={{ borderRadius: 12 }} />
              </View>
            </View>
          </View>
        ) : books.isError ? (
          <ErrorState onRetry={() => books.refetch()} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: theme.spacing.md }}
            refreshControl={
              <RefreshControl
                refreshing={books.isFetching && !books.isLoading}
                onRefresh={() => {
                  void books.refetch();
                  void orders.refetch();
                }}
                tintColor={theme.colors.primary}
              />
            }
          >
              <View style={{ gap: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
                {/* Section 2: Search & Filter Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
                  <Pressable
                    onPress={() => navigation.navigate('StudentTabs', { screen: 'Store' })}
                    style={({ pressed }) => ({
                      flex: 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.92 : 1,
                    })}
                  >
                    <View pointerEvents="none">
                      <SearchBar
                        value=""
                        onChangeText={() => {}}
                        placeholder="Search books, authors or courses"
                      />
                    </View>
                  </Pressable>
                  <IconButton
                    name="options-outline"
                    size={22}
                    color="#FFFFFF"
                    style={{
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                      minHeight: 48,
                      minWidth: 48,
                    }}
                    onPress={() => setCategorySheetOpen(true)}
                  />
                </View>

                {/* Section 3: Paging Promo Banners */}
                <View style={{ height: 140 }}>
                  <ScrollView
                    ref={bannerRef}
                    horizontal
                    pagingEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: theme.spacing.md }}
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_ITEM_WIDTH + 16));
                      setActiveBannerIndex(index);
                    }}
                  >
                    {BANNERS.map((item) => (
                      <Pressable key={item.title} onPress={item.onPress} style={{ width: BANNER_ITEM_WIDTH }}>
                        <LinearGradient
                          colors={item.colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: BANNER_ITEM_WIDTH,
                            padding: theme.spacing.md,
                            borderRadius: 16,
                            height: 130,
                            justifyContent: 'space-between',
                            shadowColor: item.colors[0],
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.12,
                            shadowRadius: 10,
                            elevation: 4,
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                              <View>
                                <AppText variant="bodyMedium" weight="bold" style={{ color: '#FFFFFF', fontSize: 16 }}>
                                  {item.title}
                                </AppText>
                                <AppText variant="caption" style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 2 }} numberOfLines={2}>
                                  {item.desc}
                                </AppText>
                              </View>
                              <Pressable
                                onPress={item.onPress}
                                hitSlop={8}
                                style={({ pressed }) => ({
                                  backgroundColor: '#FFFFFF',
                                  paddingHorizontal: theme.spacing.lg,
                                  paddingVertical: theme.spacing.sm,
                                  borderRadius: 999,
                                  alignSelf: 'flex-start',
                                  opacity: pressed ? 0.85 : 1,
                                  transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}
                              >
                                <AppText variant="bodyMedium" weight="bold" style={{ color: item.colors[0], fontSize: 13 }}>
                                  {item.buttonLabel}
                                </AppText>
                              </Pressable>
                            </View>
                            <View style={{ justifyContent: 'center', marginLeft: theme.spacing.sm }}>
                              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Section 4: Academic Hub Card */}
                <Card style={{ padding: theme.spacing.md, gap: theme.spacing.xs, borderColor: theme.colors.border, borderWidth: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                      <View style={{ backgroundColor: theme.colors.surfaceAlt, width: 36, height: 36, borderRadius: theme.radii.pill, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Academic Hub</AppText>
                        <AppText variant="bodyMedium" weight="semiBold" numberOfLines={1}>
                          {profile.data?.user?.department?.name ?? 'No Department set'}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                          {profile.data?.user?.level?.name ?? 'Level not set'}
                        </AppText>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => navigation.navigate('EditProfile')}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        paddingVertical: theme.spacing.xs,
                        paddingHorizontal: theme.spacing.sm,
                        borderRadius: theme.radii.pill,
                        backgroundColor: theme.colors.surfaceAlt,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      })}
                    >
                      <AppText variant="caption" weight="semiBold" style={{ color: theme.colors.primary }}>
                        Update
                      </AppText>
                    </Pressable>
                  </View>
                </Card>

                {/* Section 5: Active Order Card */}
                {activeOrder ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">Your active order</AppText>
                    <OrderCard order={activeOrder} onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })} />
                  </View>
                ) : null}

                {/* Bookstore Savings Tracker — real, from completed orders' compareAtPrice vs unitPrice */}
                {savings.data && savings.data.orderCount > 0 ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">My Bookstore Savings</AppText>
                    <Card style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AppText variant="bodyMedium" weight="bold">Total Savings</AppText>
                        <AppText variant="bodyMedium" weight="bold" style={{ color: theme.colors.primary }}>
                          ₦{savings.data.totalSaved.toLocaleString()}
                        </AppText>
                      </View>
                      <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                        You saved {savings.data.percentageSaved}% compared to purchasing brand new retail textbooks.
                      </AppText>
                      <View style={{ width: '100%', height: 6, backgroundColor: theme.colors.surfaceAlt, borderRadius: 3, marginTop: theme.spacing.sm, overflow: 'hidden' }}>
                        <View style={{ width: `${Math.min(100, savings.data.percentageSaved)}%`, height: '100%', backgroundColor: theme.colors.primary }} />
                      </View>
                    </Card>
                  </View>
                ) : null}

                {/* Redesigned Syllabus Tracker Card */}
                {syllabus.data && syllabus.data.length > 0 ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">My Required Syllabus</AppText>
                    <Pressable onPress={() => setSyllabusSheetOpen(true)}>
                      <Card style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1, gap: 4 }}>
                            <AppText variant="bodyMedium" weight="bold">Syllabus Progress</AppText>
                            <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                              {totalOwned} of {totalRequired} required textbooks acquired
                            </AppText>
                          </View>
                          <AppText variant="title" style={{ color: completionPercentage === 100 ? theme.colors.primary : theme.colors.gold }}>
                            {completionPercentage}%
                          </AppText>
                        </View>

                        {/* Progress Bar */}
                        <View style={{ width: '100%', height: 8, backgroundColor: theme.colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                          <View
                            style={{
                              width: `${completionPercentage}%`,
                              height: '100%',
                              backgroundColor: completionPercentage === 100 ? theme.colors.primary : theme.colors.gold,
                              borderRadius: 4,
                            }}
                          />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.xs }}>
                          <AppText variant="caption" weight="semiBold" style={{ color: theme.colors.primary }}>
                            View details per course
                          </AppText>
                          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                        </View>
                      </Card>
                    </Pressable>
                  </View>
                ) : null}

                {/* Book Exchange & Sell Back */}
                <View style={{ gap: theme.spacing.sm }}>
                  <AppText variant="sectionHeader">Used Textbook Exchange</AppText>
                  <Pressable onPress={() => navigation.navigate('ExchangeListings')}>
                    <Card style={{ padding: theme.spacing.md, gap: theme.spacing.sm, borderColor: theme.colors.border }}>
                      <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.gold + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="cash-outline" size={24} color={theme.colors.gold} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <AppText variant="bodyMedium" weight="bold">Buy or Sell Used Books</AppText>
                          <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                            List your old course books, or browse what other students are selling.
                          </AppText>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => navigation.navigate('CreateListing')}
                        style={({ pressed }) => ({
                          backgroundColor: theme.colors.primary,
                          paddingVertical: theme.spacing.sm,
                          borderRadius: theme.radii.button,
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                          opacity: pressed ? 0.9 : 1,
                        })}
                      >
                        <AppText variant="bodyMedium" weight="bold" style={{ color: '#FFFFFF' }}>
                          Start Listing
                        </AppText>
                      </Pressable>
                    </Card>
                  </Pressable>
                </View>

                {/* Section 6: Recommended for your level */}
                {recommendedForLevel.length > 0 ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">Recommended for your level</AppText>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={recommendedForLevel}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{ gap: theme.spacing.md }}
                      renderItem={({ item }) => {
                        const isFav = (favourites.data ?? []).some((f) => f.book.id === item.id);
                        return (
                          <BookCard
                            book={item}
                            isFavourited={isFav}
                            onFavouritePress={() => toggleFavourite.mutate({ bookId: item.id, isFavourited: isFav })}
                            onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
                          />
                        );
                      }}
                    />
                  </View>
                ) : null}

                {/* Section 7: New arrivals */}
                {newArrivals.length > 0 ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">New arrivals</AppText>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={newArrivals}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{ gap: theme.spacing.md }}
                      renderItem={({ item }) => {
                        const isFav = (favourites.data ?? []).some((f) => f.book.id === item.id);
                        return (
                          <BookCard
                            book={item}
                            isFavourited={isFav}
                            onFavouritePress={() => toggleFavourite.mutate({ bookId: item.id, isFavourited: isFav })}
                            onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
                          />
                        );
                      }}
                    />
                  </View>
                ) : null}

                {/* New Section: Campus Library Picks */}
                {newArrivals.length > 0 ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    <AppText variant="sectionHeader">Campus Library Picks</AppText>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={newArrivals}
                      keyExtractor={(item) => 'lib-' + item.id}
                      contentContainerStyle={{ gap: theme.spacing.md }}
                      renderItem={({ item }) => {
                        const isFav = (favourites.data ?? []).some((f) => f.book.id === item.id);
                        return (
                          <BookCard
                            book={item}
                            isFavourited={isFav}
                            onFavouritePress={() => toggleFavourite.mutate({ bookId: item.id, isFavourited: isFav })}
                            onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
                          />
                        );
                      }}
                    />
                  </View>
                ) : null}
              </View>
          </ScrollView>
        )}
      </View>

      <Modal
        visible={categorySheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorySheetOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}
          onPress={() => setCategorySheetOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              maxHeight: '85%',
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.md,
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <AppText variant="sectionHeader">Filter & Sort Books</AppText>
              <Pressable onPress={() => setCategorySheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
              {/* Category selector */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Select Category
                </AppText>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories.data ?? []}
                  keyExtractor={(cat) => cat.id}
                  contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                  renderItem={({ item }) => {
                    const isSelected = selectedCatId === item.id;
                    return (
                      <Pressable
                        onPress={() => setSelectedCatId(isSelected ? undefined : item.id)}
                        style={{
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceAlt,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <AppText variant="caption" weight="bold" style={{ color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }}>
                          {item.name}
                        </AppText>
                      </Pressable>
                    );
                  }}
                />
              </View>

              {/* Price Range */}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="label" weight="bold" style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Price Range (₦)
                </AppText>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  <TextInput
                    placeholder="Min Price"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={filterMinPrice}
                    onChangeText={setFilterMinPrice}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 16,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                      fontSize: 14,
                    }}
                  />
                  <TextInput
                    placeholder="Max Price"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={filterMaxPrice}
                    onChangeText={setFilterMaxPrice}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 16,
                      color: theme.colors.textPrimary,
                      backgroundColor: theme.colors.surfaceAlt,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>

              {/* In Stock toggle */}
              <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: theme.spacing.sm }}>
                <Pressable
                  onPress={() => setFilterInStock(!filterInStock)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <AppText variant="bodyMedium" weight="bold">In Stock Only</AppText>
                    <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>Hide books that are sold out.</AppText>
                  </View>
                  <Ionicons
                    name={filterInStock ? "checkbox" : "square-outline"}
                    size={24}
                    color={filterInStock ? theme.colors.primary : theme.colors.textTertiary}
                  />
                </Pressable>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                <Pressable
                  onPress={handleResetFilters}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 48,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.surfaceAlt,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <AppText variant="body" weight="bold">Reset</AppText>
                </Pressable>
                <Pressable
                  onPress={handleApplyFilters}
                  style={({ pressed }) => ({
                    flex: 2,
                    height: 48,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <AppText variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
                    Apply Filters
                  </AppText>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Syllabus Details Floating Bottomsheet */}
      {syllabus.data ? (
        <Modal
          visible={syllabusSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setSyllabusSheetOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            onPress={() => setSyllabusSheetOpen(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                maxHeight: '85%',
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: theme.radii.card,
                borderTopRightRadius: theme.radii.card,
                paddingTop: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
                paddingBottom: insets.bottom + theme.spacing.xl,
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  width: 40,
                  height: 4,
                  borderRadius: theme.radii.pill,
                  backgroundColor: theme.colors.border,
                  marginBottom: theme.spacing.md,
                }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <View>
                  <AppText variant="sectionHeader">Syllabus Requirements</AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textSecondary }}>
                    Acquisition tracking for your department courses
                  </AppText>
                </View>
                <Pressable onPress={() => setSyllabusSheetOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </Pressable>
              </View>

              {/* Course list */}
              <FlatList
                data={syllabus.data}
                keyExtractor={(item) => item.courseCode}
                contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.xl }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isComplete = item.ownedBookCount >= item.requiredBookCount;
                  const itemColor = isComplete ? theme.colors.primary : theme.colors.gold;
                  return (
                    <Card style={{ padding: theme.spacing.md, gap: theme.spacing.sm, borderColor: theme.colors.border, borderWidth: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm }}>
                        <View style={{ flex: 1 }}>
                          <AppText variant="bodyMedium" weight="bold">
                            {item.courseCode}
                          </AppText>
                          {item.courseTitle ? (
                            <AppText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                              {item.courseTitle}
                            </AppText>
                          ) : null}
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: itemColor + '10',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}
                        >
                          <Ionicons
                            name={isComplete ? 'checkmark-circle' : 'time-outline'}
                            size={14}
                            color={itemColor}
                          />
                          <AppText variant="caption" weight="bold" style={{ color: itemColor, fontSize: 11 }}>
                            {item.ownedBookCount}/{item.requiredBookCount}
                          </AppText>
                        </View>
                      </View>

                      {/* Small Course Progress Bar */}
                      <View style={{ width: '100%', height: 4, backgroundColor: theme.colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                        <View
                          style={{
                            width: `${(item.ownedBookCount / item.requiredBookCount) * 100}%`,
                            height: '100%',
                            backgroundColor: itemColor,
                            borderRadius: 2,
                          }}
                        />
                      </View>
                    </Card>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
