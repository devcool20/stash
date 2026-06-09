import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { Inbox, Info } from 'lucide-react-native';
import { db } from '../database';
import { StashItem } from '../types';
import { MasonryGrid } from '../components/MasonryGrid';
import { colors, fonts } from '../theme/colors';

interface StashScreenProps {
  items: StashItem[];
  searchQuery: string;
  selectedCategory: string;
  onItemClick: (item: StashItem) => void;
  onItemsChanged: () => void;
}

export function StashScreen({
  items,
  searchQuery,
  selectedCategory,
  onItemClick,
  onItemsChanged,
}: StashScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [filtered, setFiltered] = useState<StashItem[]>([]);
  useEffect(() => {
    const run = async () => {
      let dataset = searchQuery.trim()
        ? await db.search(searchQuery)
        : items;
      dataset = dataset.filter(
        (i) => i.status === 'ready' || i.status === 'processing',
      );
      if (selectedCategory !== 'All') {
        dataset = dataset.filter(
          (i) => i.category.toLowerCase() === selectedCategory.toLowerCase(),
        );
      }
      setFiltered(dataset);
    };
    run();
  }, [searchQuery, items, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await onItemsChanged();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Inbox
          color={colors.textSecondary}
          size={28}
          strokeWidth={1.4}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.emptyTitle}>INBOX IS VACANT</Text>
        <Text style={styles.emptyDesc}>
          Tap the plus symbol to scan resources
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.textSecondary}
        />
      }
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderLabel}>
          ALL STASH
        </Text>
        <Text style={styles.groupHeaderCount}>
          {filtered.length} {filtered.length === 1 ? 'ELEMENT' : 'ELEMENTS'}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Info
            color={colors.textSecondary}
            size={18}
            strokeWidth={1.6}
            style={{ marginBottom: 6 }}
          />
          <Text style={styles.noResults}>
            NO RESULTS KEY "{searchQuery.toUpperCase()}"
          </Text>
        </View>
      ) : (
        <MasonryGrid items={filtered} onItemClick={onItemClick} />
      )}

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  groupHeaderLabel: {
    fontSize: 9.5,
    color: colors.textPrimary,
    letterSpacing: 1.4,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  groupHeaderCount: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 4,
  },
  noResults: {
    color: colors.textSecondary,
    fontSize: 9,
    fontFamily: fonts.mono,
  },
});
