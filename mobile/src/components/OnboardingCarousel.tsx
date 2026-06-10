import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { colors, fonts } from '../theme/colors';

const { width: WIN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = WIN_WIDTH - 28; // Padding of 14 on each side

interface OnboardingSlide {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Welcome to Stash',
    desc: 'Your premium, private visual brain. Swipe to learn how to master it in seconds.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-2',
    title: 'Capture Everything',
    desc: 'Upload screenshots of clothes, recipes, travel spots, or articles to stash them.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-3',
    title: 'Local AI Analysis',
    desc: 'Our engine runs OCR, summarizes details, and classifies items into smart collections.',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-4',
    title: 'Aesthetic Collections',
    desc: 'Explore your items automatically cataloged under Shopping, Travel, Design, and Recipes.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-5',
    title: 'Textual Search',
    desc: 'Search for text contained inside your screenshots. Never lose a clipping again.',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=400',
  },
];

export function OnboardingCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>ONBOARDING GUIDE</Text>
      
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View key={slide.id} style={styles.card}>
            <ExpoImage
              source={{ uri: slide.imageUrl }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{slide.title}</Text>
              <Text style={styles.cardDesc}>{slide.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 9.5,
    color: colors.textPrimary,
    letterSpacing: 1.4,
    fontFamily: fonts.body,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 124,
    flexDirection: 'row',
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 110,
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    lineHeight: 14.5,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 14,
    backgroundColor: colors.accentCoral,
  },
});
