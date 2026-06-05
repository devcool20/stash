import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ShoppingBag,
  Utensils,
  Compass,
  BookOpen,
  Layers,
  Folder,
} from 'lucide-react-native';
import { ActiveCategory } from '../types';
import { db } from '../database';
import { colors } from '../theme/colors';

interface CategoriesTabProps {
  selectedCategory: ActiveCategory;
  onSelectCategory: (cat: ActiveCategory) => void;
}

const getCategoryMeta = (catId: string) => {
  const PRESETS: Record<
    string,
    { label: string; icon: any; glow: string; color: string; bg: string }
  > = {
    All: {
      label: 'All STASH',
      icon: Layers,
      glow: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      bg: '#FFFFFF',
    },
    Shopping: {
      label: 'Shopping',
      icon: ShoppingBag,
      glow: 'rgba(244, 63, 94, 0.25)',
      color: '#FB7185',
      bg: '#F43F5E',
    },
    Recipes: {
      label: 'Recipes',
      icon: Utensils,
      glow: 'rgba(245, 158, 11, 0.25)',
      color: '#FBBF24',
      bg: '#F59E0B',
    },
    Travel: {
      label: 'Travel',
      icon: Compass,
      glow: 'rgba(16, 185, 129, 0.25)',
      color: '#34D399',
      bg: '#10B981',
    },
    Articles: {
      label: 'Articles',
      icon: BookOpen,
      glow: 'rgba(139, 92, 246, 0.25)',
      color: '#A78BFA',
      bg: '#8B5CF6',
    },
    Design: {
      label: 'Design',
      icon: Layers,
      glow: 'rgba(217, 70, 239, 0.25)',
      color: '#E879F9',
      bg: '#D946EF',
    },
  };

  return (
    PRESETS[catId] || {
      label: catId,
      icon: Folder,
      glow: 'rgba(6, 182, 212, 0.25)',
      color: '#22D3EE',
      bg: '#06B6D4',
    }
  );
};

export function CategoriesTab({
  selectedCategory,
  onSelectCategory,
}: CategoriesTabProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      const cats = await db.getCategories();
      const cnts = await db.getCounts();
      setCategories(['All', ...cats]);
      setCounts(cnts);
    };
    loadData();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>SMART LIBRARY LENSES</Text>
        <Text style={styles.headerSub}>
          {categories.length - 1} AUTO-CLUSTERING CORES
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={TILE_SIZE + 12}
        decelerationRate="fast"
      >
        {categories.map((catId) => {
          const meta = getCategoryMeta(catId);
          const Icon = meta.icon;
          const isSelected = selectedCategory === catId;
          const count =
            catId === 'All'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : counts[catId] || 0;

          return (
            <Pressable
              key={catId}
              onPress={() => onSelectCategory(catId)}
              style={({ pressed }) => [
                { marginRight: 12 },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <View
                style={[
                  styles.tile,
                  isSelected && {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.25)',
                    transform: [{ scale: 1.03 }],
                    shadowColor: meta.glow,
                    shadowOpacity: 1,
                    shadowRadius: 25,
                    shadowOffset: { width: 0, height: 0 },
                  },
                  !isSelected && {
                    opacity: 0.7,
                  },
                ]}
              >
                <View style={styles.tileTop}>
                  <View style={styles.iconBox}>
                    <Icon color={meta.color} size={16} strokeWidth={2} />
                  </View>
                  {isSelected && (
                    <View
                      style={[
                        styles.selDot,
                        { backgroundColor: meta.bg },
                      ]}
                    />
                  )}
                </View>

                <View>
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {catId === 'All' ? 'Vault (All)' : meta.label}
                  </Text>
                  <Text style={styles.tileCount}>
                    {count} {count === 1 ? 'ASSET' : 'ASSETS'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const TILE_SIZE = 110; // web: w-[110px] h-[110px]

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4, // py-1
    gap: 16, // space-y-4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4, // px-1
  },
  // web: text-[10px] uppercase font-display tracking-widest text-[#8A8A93]
  headerLabel: {
    fontSize: 10,
    color: '#8A8A93',
    letterSpacing: 2.5, // tracking-widest
  },
  // web: font-mono text-[9px] text-[#8A8A93]
  headerSub: {
    fontSize: 9,
    color: '#8A8A93',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // web: pb-4 pt-1 px-1
  scrollContent: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 16,
    paddingRight: 4,
  },
  // web: w-[110px] h-[110px] p-3.5 rounded-2xl border bg-white/3 border-white/5
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14, // p-3.5 = 14px
    justifyContent: 'space-between',
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // web: p-1.5 rounded-xl bg-white/5 border border-white/10
  iconBox: {
    padding: 6, // p-1.5
    borderRadius: 12, // rounded-xl
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  // web: w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]
  selDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  // web: font-display font-medium text-xs tracking-tight mb-0.5
  tileLabel: {
    fontSize: 12, // text-xs
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: -0.5, // tracking-tight
    marginBottom: 2,
  },
  // web: font-mono text-[8px] text-gray-500 uppercase tracking-wider
  tileCount: {
    fontSize: 8,
    color: '#6B7280', // text-gray-500
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.0, // tracking-wider
    textTransform: 'uppercase',
  },
});
