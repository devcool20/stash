import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { db } from '../database';
import { StashItem, ActiveCategory, CategoryKey } from '../types';
import { CategoriesTab } from '../components/CategoriesTab';
import { MasonryGrid } from '../components/MasonryGrid';
import { colors } from '../theme/colors';

interface CategoriesScreenProps {
  items: StashItem[];
  searchQuery: string;
  onItemClick: (item: StashItem) => void;
}

export function CategoriesScreen({
  items,
  searchQuery,
  onItemClick,
}: CategoriesScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ActiveCategory>('All');
  const [filtered, setFiltered] = useState<StashItem[]>([]);

  useEffect(() => {
    const run = async () => {
      let dataset = searchQuery.trim()
        ? await db.search(searchQuery)
        : items;

      if (selectedCategory !== 'All') {
        dataset = dataset.filter(
          (i) => i.category === (selectedCategory as CategoryKey),
        );
      }
      dataset = dataset.filter(
        (i) => i.status === 'ready' || i.status === 'processing',
      );
      setFiltered(dataset);
    };
    run();
  }, [selectedCategory, searchQuery, items]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <CategoriesTab
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* web: px-1 flex items-center justify-between text-[9px] font-display text-gray-500 uppercase tracking-widest */}
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderLabel}>
          Group cluster: {selectedCategory}
        </Text>
        <Text style={styles.groupHeaderCount}>
          {filtered.length} elements
        </Text>
      </View>

      {filtered.length === 0 ? (
        // web: text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-gray-500
        <View style={styles.empty}>
          <Sparkles
            color={colors.textMuted}
            size={20}
            strokeWidth={1.6}
            style={{ marginBottom: 4 }}
          />
          {/* web: font-display font-medium text-xs text-white */}
          <Text style={styles.emptyTitle}>Cluster is Empty</Text>
          {/* web: text-[9px] font-sans mt-0.5 */}
          <Text style={styles.emptyDesc}>
            Scanned resources are auto-indexed via local FTS pipelines.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 4 }}>
          <MasonryGrid items={filtered} onItemClick={onItemClick} />
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
  },
  // web: px-1 flex items-center justify-between text-[9px] font-display text-gray-500 uppercase tracking-widest
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  groupHeaderLabel: {
    fontSize: 9,
    color: '#6B7280', // text-gray-500
    letterSpacing: 2.5, // tracking-widest
    textTransform: 'uppercase',
  },
  groupHeaderCount: {
    fontSize: 9,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48, // py-12
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
  },
  // web: font-display font-medium text-xs text-white
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  // web: text-[9px] font-sans mt-0.5
  emptyDesc: {
    color: '#6B7280',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
