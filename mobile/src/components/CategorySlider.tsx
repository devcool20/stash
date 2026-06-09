import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme/colors';

interface CategorySliderProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySliderProps) {
  const allCategories = ['All', ...categories];
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={isActive}
              onPress={() => onSelectCategory(cat)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function CategoryPill({ label, isActive, onPress }: CategoryPillProps) {
  const scale = useSharedValue(1);
  const activeOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeOpacity.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive, activeOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeBgStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <Animated.View style={[styles.pillContainer, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.pillPressable}
      >
        {/* Active Background layer that fades in/out */}
        <Animated.View style={[styles.activeBg, activeBgStyle]} />

        {/* Label Text */}
        <Text
          style={[
            styles.pillText,
            isActive ? styles.pillTextActive : styles.pillTextInactive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 22,
    gap: 8,
    alignItems: 'center',
    height: 40,
  },
  pillContainer: {
    height: 30,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pillPressable: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentCoral, // #34D399 (emerald active background)
  },
  pillText: {
    fontSize: 10,
    fontFamily: fonts.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: '#000000',
  },
  pillTextInactive: {
    color: colors.textSecondary,
  },
});
