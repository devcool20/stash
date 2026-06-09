import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import {
  ShoppingBag,
  Utensils,
  Compass,
  BookOpen,
  Layers,
  Link as LinkIcon,
  Loader,
  Palette,
} from 'lucide-react-native';
import { Image as ExpoImage } from 'expo-image';
import { StashItem, CategoryKey } from '../types';
import { colors, fonts } from '../theme/colors';

interface MasonryGridProps {
  items: StashItem[];
  onItemClick: (item: StashItem) => void;
}

const CATEGORY_ICON: Record<CategoryKey, any> = {
  Shopping: ShoppingBag,
  Recipes: Utensils,
  Travel: Compass,
  Articles: BookOpen,
  Design: Palette,
};

const CATEGORY_COLOR: Record<CategoryKey, string> = {
  Shopping: colors.catOrange,
  Recipes: colors.catAmber,
  Travel: colors.catEmerald,
  Articles: colors.catViolet,
  Design: colors.catFuchsia,
};

function getRelativeTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / (3600 * 1000));
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}D AGO`;
    if (hrs > 0) return `${hrs}H AGO`;
    return 'JUST NOW';
  } catch {
    return '';
  }
}

function getCategoryIcon(category: string) {
  const Icon = CATEGORY_ICON[category as CategoryKey] || LinkIcon;
  return <Icon color="#FFFFFF" size={11} strokeWidth={2.4} />;
}

export function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.col}>
        {items
          .filter((_, i) => i % 2 === 0)
          .map((item, filterIndex) => (
            <GridCard
              key={item.id}
              item={item}
              index={filterIndex}
              onItemClick={onItemClick}
            />
          ))}
      </View>
      <View style={[styles.col, { paddingTop: 18 }]}>
        {items
          .filter((_, i) => i % 2 !== 0)
          .map((item, filterIndex) => (
            <GridCard
              key={item.id}
              item={item}
              index={filterIndex}
              onItemClick={onItemClick}
            />
          ))}
      </View>
    </View>
  );
}

function GridCard({
  item,
  index,
  onItemClick,
}: {
  item: StashItem;
  index: number;
  onItemClick: (item: StashItem) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (item.status === 'processing') {
    return <ShimmerCard id={item.id} />;
  }

  const catColor =
    CATEGORY_COLOR[item.category] || colors.accentBrown;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 60).duration(350)}
      style={{ marginBottom: 12 }}
    >
      <Pressable
        onPress={() => onItemClick(item)}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.card}>
            {item.imageUrl ? (
              <View style={styles.imgWrap}>
                <ExpoImage
                  source={{ uri: item.imageUrl }}
                  style={styles.img}
                  contentFit="cover"
                  transition={250}
                />
                <View style={styles.imgOverlay} />
              </View>
            ) : null}

            <View style={styles.catPill}>
              {getCategoryIcon(item.category)}
            </View>

            {item.sourceUrl ? (
              <View style={styles.faviconPill}>
                <Image
                  source={{
                    uri:
                      item.favicon ||
                      `https://www.google.com/s2/favicons?sz=64&domain=${
                        item.sourceUrl
                          .replace(/^https?:\/\//i, '')
                          .split('/')[0]
                      }`,
                  }}
                  style={styles.faviconImg}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function ShimmerCard({ id }: { id: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, {
          duration: 700,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.4, {
          duration: 700,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      true,
    );
  }, [id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.shimmerCard, animatedStyle, { marginBottom: 12 }]}
    >
      <View style={styles.shimmerTopRow}>
        <View style={[styles.shimmerBlock, { width: 64, height: 24 }]} />
        <Loader color={colors.textSecondary} size={12} />
      </View>
      <View style={{ marginTop: 16 }}>
        <View
          style={[styles.shimmerBlock, { width: '75%', height: 14 }]}
        />
        <View
          style={[
            styles.shimmerBlock,
            { width: '50%', height: 10, marginTop: 8 },
          ]}
        />
      </View>
      <View style={styles.shimmerFooter}>
        <View
          style={[styles.shimmerBlock, { width: 36, height: 8 }]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  imgWrap: {
    width: '100%',
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  catPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
    shadowColor: colors.shadowMed,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  faviconPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 999,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    zIndex: 10,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  faviconImg: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },

  // Shimmer
  shimmerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 14,
    minHeight: 200,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shimmerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shimmerBlock: {
    backgroundColor: colors.bgSoft,
    borderRadius: 4,
  },
  shimmerFooter: {
    alignItems: 'flex-end',
  },
});
