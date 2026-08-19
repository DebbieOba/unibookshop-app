import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { SearchBar } from '../../../components/SearchBar';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<StudentStackParamList, 'HelpCentre'>;

const CATEGORIES: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'Account', icon: 'person-outline' },
  { label: 'Orders', icon: 'receipt-outline' },
  { label: 'Payments', icon: 'card-outline' },
  { label: 'Delivery', icon: 'bicycle-outline' },
  { label: 'Returns', icon: 'return-down-back-outline' },
  { label: 'Security', icon: 'lock-closed-outline' },
];

export function HelpCentreScreen({ navigation }: Props) {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => (search.trim() ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(search.trim().toLowerCase())) : CATEGORIES),
    [search],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.lg }}>
      <AppText variant="title">Help Centre</AppText>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search help topics" debounceMs={0} />

      <View style={{ gap: theme.spacing.sm }}>
        {filtered.map((category) => (
          <Pressable key={category.label} onPress={() => navigation.navigate('ContactSupport', { category: category.label })}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <Ionicons name={category.icon} size={20} color={theme.colors.primary} />
              <AppText variant="bodyMedium" style={{ flex: 1 }}>
                {category.label}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Card>
          </Pressable>
        ))}
      </View>

      <Button label="Contact support" icon="mail-outline" onPress={() => navigation.navigate('ContactSupport')} />
    </View>
  );
}
