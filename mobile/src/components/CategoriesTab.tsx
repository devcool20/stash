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
  Layers,
  ShoppingBag,
  Utensils,
  Compass,
  BookOpen,
  Palette,
} from 'lucide-react-native';
import { ActiveCategory, CategoryKey } from '../types';
import { db } from '../database';
import { colors, fonts, radii } from '../theme/colors';

interface CategoriesTabProps {
  selectedCategory: ActiveCategory;
  onSelectCategory: (cat: ActiveCategory) => void;
}

interface CategoryDef {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const getCategoryDef = (id: string): CategoryDef => {
  switch (id) {
    case 'All':
      return { id: 'All', label: 'Vault (All)', icon: Layers, color: colors.textPrimary };
    case 'Shopping':
      return { id: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: colors.textPrimary };
    case 'Recipes':
      return { id: 'Recipes', label: 'Recipes', icon: Utensils, color: colors.textPrimary };
    case 'Travel':
      return { id: 'Travel', label: 'Travel', icon: Compass, color: colors.textPrimary };
    case 'Articles':
      return { id: 'Articles', label: 'Articles', icon: BookOpen, color: colors.textPrimary };
    case 'Design':
      return { id: 'Design', label: 'Design', icon: Palette, color: colors.textPrimary };
    case 'People':
      return { id: 'People', label: 'People', icon: Layers, color: colors.textPrimary };
    default:
      return { id, label: id, icon: Layers, color: colors.textPrimary };
  }
};

export function CategoriesTab({
  selectedCategory,
  onSelectCategory,
}: CategoriesTabProps) {
  const [counts, setCounts] = useState<Record<CategoryKey, number>>({});
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  useEffect(() => {
    db.getCounts().then(setCounts);
    db.getCategories().then(setCategoriesList);
  }, []);

  const categories = ['All', ...categoriesList].map(getCategoryDef);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>COLLECTIONS</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={108}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'All'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : counts[cat.id as CategoryKey] || 0;

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              style={({ pressed }) => [
                styles.cardWrap,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View
                style={[
                  styles.tile,
                  isSelected && styles.tileActive,
                ]}
              >
                <View style={styles.tileTop}>
                  <View
                    style={[
                      styles.iconBox,
                      isSelected && styles.iconBoxActive,
                    ]}
                  >
                    <Icon
                      color="#FFFFFF"
                      size={16}
                      strokeWidth={2}
                    />
                  </View>
                  {isSelected && <View style={styles.selDot} />}
                </View>

                <View style={{ marginTop: 'auto' }}>
                  <Text
                    style={styles.tileLabel}
                    numberOfLines={1}
                  >
                    {cat.label}
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

const TILE_WIDTH = 100;
const TILE_HEIGHT = 104;

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  headerLabel: {
    fontSize: 10,
    color: colors.textPrimary,
    letterSpacing: 1.8,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  scrollContent: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  cardWrap: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    marginRight: 8,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  tileActive: {
    borderColor: colors.borderActive,
    shadowColor: colors.accentCoral,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
  },
  tileLabel: {
    fontSize: 10.5,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  tileCount: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.6,
    marginTop: 1,
  },
});
