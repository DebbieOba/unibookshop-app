import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Debounce delay in ms before `onChangeText` fires — keeps typing from
   * firing a network request on every keystroke (CurriculaMobileDesignSystem.md
   * §8.4: "Search must be debounced. Do not request on every keystroke."). */
  debounceMs?: number;
  /** Shows a small spinner in place of the search icon while a request from
   * this debounced value is in flight. */
  isSearching?: boolean;
}

/** Single reusable search input — debounced, with a clear button once text is
 * present and a highlighted focus border, used everywhere search appears. */
export function SearchBar({ value, onChangeText, placeholder = 'Search', debounceMs = 350, isSearching }: SearchBarProps) {
  const theme = useTheme();
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep in sync when the parent resets the value externally (e.g. "Clear
  // filters"), without fighting local keystrokes in between.
  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChangeText = (next: string) => {
    setText(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChangeText(next), debounceMs);
  };

  const handleClear = () => {
    setText('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChangeText('');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 999,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: focused ? theme.colors.primary : theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {isSearching ? (
        <ActivityIndicator size="small" color={theme.colors.textTertiary} />
      ) : (
        <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} />
      )}
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 14 }}
      />
      {text.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}
