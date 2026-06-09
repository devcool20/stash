import React, { useRef, useEffect, useState } from 'react';
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

  // Keep track of laid-out coordinates for each pill
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    const layout = layouts[selectedCategory];
    if (layout) {
      indicatorX.value = withSpring(layout.x, { damping: 22, stiffness: 180 });
      indicatorWidth.value = withSpring(layout.width, { damping: 22, stiffness: 180 });
      indicatorOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [selectedCategory, layouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 0,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
    opacity: indicatorOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shared sliding active background pill */}
        <Animated.View style={[styles.activeBg, indicatorStyle]} />

        {allCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={isActive}
              onPress={() => onSelectCategory(cat)}
              onLayout={(x, width) => {
                setLayouts((prev) => ({ ...prev, [cat]: { x, width } }));
              }}
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
  onLayout: (x: number, width: number) => void;
}

function CategoryPill({ label, isActive, onPress, onLayout }: CategoryPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <Animated.View
      style={[
        styles.pillContainer,
        isActive && styles.pillActive,
        animatedStyle,
      ]}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        onLayout(x, width);
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.pillPressable}
      >
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
    position: 'relative',
  },
  activeBg: {
    position: 'absolute',
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 15,
    zIndex: 1,
  },
  pillContainer: {
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 2,
  },
  pillActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pillPressable: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 10.5,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: colors.textSecondary,
  },
});
