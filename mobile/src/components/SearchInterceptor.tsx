import React from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, fonts, radii } from '../theme/colors';

interface SearchInterceptorProps {
  value: string;
  onChangeText: (text: string) => void;
  matchCount: number;
}

export function SearchInterceptor({
  value,
  onChangeText,
  matchCount,
}: SearchInterceptorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.icon}>
          <Search color={colors.textSecondary} size={14} strokeWidth={2.2} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search your vault..."
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {matchCount} {matchCount === 1 ? 'ITEM' : 'ITEMS'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12.5,
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  countText: {
    fontSize: 8.5,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
