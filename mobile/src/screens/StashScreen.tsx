import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Inbox, Info } from 'lucide-react-native';
import { db } from '../database';
import { StashItem } from '../types';
import { MasonryGrid } from '../components/MasonryGrid';
import { colors } from '../theme/colors';

interface StashScreenProps {
  items: StashItem[];
  searchQuery: string;
  onItemClick: (item: StashItem) => void;
  onItemsChanged: () => void;
}

export function StashScreen({
  items,
  searchQuery,
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
      setFiltered(dataset);
    };
    run();
  }, [searchQuery, items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await onItemsChanged();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (items.length === 0) {
    return (
      // web: text-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl p-6
      <View style={styles.empty}>
        <Inbox
          color={colors.textMuted}
          size={32}
          strokeWidth={1.4}
          style={{ marginBottom: 8 }}
        />
        {/* web: font-display font-medium text-xs text-white */}
        <Text style={styles.emptyTitle}>Inbox is Vacant</Text>
        {/* web: text-[10px] text-gray-500 font-sans mt-0.5 */}
        <Text style={styles.emptyDesc}>
          Tap the plus symbol to scan resources
        </Text>
      </View>
    );
  }

  if (filtered.length === 0) {
    return (
      <View style={styles.empty}>
        <Info
          color={colors.textMuted}
          size={20}
          strokeWidth={1.6}
          style={{ marginBottom: 6 }}
        />
        <Text style={styles.noResults}>
          NO RESULTS KEY "{searchQuery.toUpperCase()}"
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
        <MasonryGrid items={filtered} onItemClick={onItemClick} />
        {/* Visual grid bottom spacing padding */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Fade Mask: matches web linear-gradient(to top, #000000, rgba(0,0,0,0)) */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.95)']}
        locations={[0, 1]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64, // py-16
    backgroundColor: 'rgba(255,255,255,0.01)', // bg-white/[0.01]
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 24,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 12, // text-xs
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  emptyDesc: {
    color: '#6B7280', // text-gray-500
    fontSize: 10, // text-[10px]
    marginTop: 2,
  },
  noResults: {
    color: '#9CA3AF', // text-gray-400
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Bottom gradient fade mask overlay
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
});
