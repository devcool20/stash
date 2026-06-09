import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme/colors';

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
  const [isFocused, setIsFocused] = useState(false);
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      shimmerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      shimmerOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isFocused, shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.box,
          isFocused && styles.boxFocused,
        ]}
      >
        {/* Shimmer glow overlay */}
        <Animated.View
          style={[styles.shimmerOverlay, shimmerStyle]}
          pointerEvents="none"
        />

        {/* Search icon with accent glow */}
        <View style={styles.iconContainer}>
          <Search color={colors.accentCoral} size={14} strokeWidth={2.2} />
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
    marginBottom: 14,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    overflow: 'hidden',
    // Outer shadow for depth
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 2,
  },
  boxFocused: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.body,
    paddingVertical: 0,
    ...Platform.select({
      android: { paddingTop: 0, paddingBottom: 0 },
    }),
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 6,
  },
  countText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
