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
  Easing,
} from 'react-native-reanimated';
import {
  ShoppingBag,
  Utensils,
  Compass,
  BookOpen,
  Layers,
  Link as LinkIcon,
  Loader,
} from 'lucide-react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StashItem, CategoryKey } from '../types';
import { colors, radii } from '../theme/colors';

interface MasonryGridProps {
  items: StashItem[];
  onItemClick: (item: StashItem) => void;
}

const CATEGORY_ICON: Record<CategoryKey, any> = {
  Shopping: ShoppingBag,
  Recipes: Utensils,
  Travel: Compass,
  Articles: BookOpen,
  Design: Layers,
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
  return <Icon color="#FFFFFF" size={14} strokeWidth={2} />;
}

export function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.col}>
        {items
          .filter((_, i) => i % 2 === 0)
          .map((item) => (
            <GridCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
      </View>
      <View style={[styles.col, { paddingTop: 24 }]}>
        {items
          .filter((_, i) => i % 2 !== 0)
          .map((item) => (
            <GridCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
      </View>
    </View>
  );
}

function GridCard({
  item,
  onItemClick,
}: {
  item: StashItem;
  onItemClick: (item: StashItem) => void;
}) {
  if (item.status === 'processing') {
    return <ShimmerCard id={item.id} />;
  }

  return (
    <Pressable
      onPress={() => onItemClick(item)}
      style={({ pressed }) => [
        { marginBottom: 16 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.card}>
        {/* Image with gradient overlay - matches web aspect-[4/5] */}
        {item.imageUrl ? (
          <View style={styles.imgWrap}>
            <ExpoImage
              source={{ uri: item.imageUrl }}
              style={styles.img}
              contentFit="cover"
              transition={250}
            />
            {/* Gradient overlay matching web: from-black/80 via-black/10 to-black/20 */}
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.20)',
                'rgba(0,0,0,0.10)',
                'rgba(0,0,0,0.80)',
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ) : null}

        {/* Floating category icon - matches web: p-1.5 rounded-full bg-black/60 */}
        <View style={styles.catPill}>
          {getCategoryIcon(item.category)}
        </View>

        {/* Floating favicon if sourceUrl exists */}
        {item.sourceUrl ? (
          <View style={styles.faviconPill}>
            <Image
              source={{
                uri: item.favicon ||
                  `https://www.google.com/s2/favicons?sz=64&domain=${
                    item.sourceUrl.replace(/^https?:\/\//i, '').split('/')[0]
                  }`,
              }}
              style={styles.faviconImg}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {/* Title & metadata strip - matches web: p-3.5 space-y-1 */}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={1}>
              {item.description}
            </Text>
          ) : item.sourceUrl ? (
            <Text style={styles.url} numberOfLines={1}>
              {item.sourceUrl.replace(/^https?:\/\/(www\.)?/i, '')}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {item.category.toUpperCase()}
            </Text>
            <Text style={styles.metaText}>
              {getRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ShimmerCard({ id }: { id: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.quad) }),
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
      style={[styles.shimmerCard, animatedStyle, { marginBottom: 16 }]}
    >
      <View style={styles.shimmerTopRow}>
        <View style={[styles.shimmerBlock, { width: 64, height: 24 }]} />
        <Loader color="rgba(255,255,255,0.5)" size={12} />
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
    gap: 16, // web: gap-4 = 16px
  },
  col: {
    flex: 1,
  },
  // Card matches web: glass-panel-interactive = rgba(255,255,255,0.06), rounded-2xl = 16px
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
    // Diagonal border effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Image wrapper: aspect-[4/5] with rounded-[14px]
  imgWrap: {
    width: '100%',
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    borderRadius: 14,
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  // Category pill: absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/60 border-white/10
  catPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 6, // p-1.5 = 6px
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  // Favicon: absolute top-2.5 right-2.5, p-1 rounded-full bg-black/60 border-white/15
  faviconPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4, // p-1 = 4px
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  faviconImg: {
    width: 14, // w-3.5 = 14px
    height: 14,
    borderRadius: 2,
  },
  // Body: p-3.5 space-y-1 (p-3.5 = 14px)
  body: {
    padding: 14,
    gap: 4, // space-y-1 = 4px
  },
  // Title: font-medium text-xs tracking-tight leading-snug
  title: {
    fontWeight: '500',
    fontSize: 12, // text-xs = 12px
    color: colors.textPrimary,
    letterSpacing: -0.5, // tracking-tight
    lineHeight: 16, // leading-snug
  },
  // Description: text-[10px] line-clamp-1
  desc: {
    fontSize: 10,
    color: '#9CA3AF', // text-gray-400
    lineHeight: 13,
  },
  url: {
    fontSize: 8,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  // Meta row: text-[8px] font-mono text-gray-500 pt-1 border-t border-white/5
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 4, // pt-1 = 4px
    marginTop: 2,
  },
  metaText: {
    fontSize: 8, // text-[8px]
    color: '#6B7280', // text-gray-500
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.3,
  },

  // Shimmer
  shimmerCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  shimmerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shimmerBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  shimmerFooter: {
    alignItems: 'flex-end',
  },
});
