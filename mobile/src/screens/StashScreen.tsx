import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { db } from '../database';
import { StashItem } from '../types';
import { MasonryGrid } from '../components/MasonryGrid';
import { OnboardingCarousel } from '../components/OnboardingCarousel';
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection mode when active dataset changes or tab is reloaded
  useEffect(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, [items.length, searchQuery, selectedCategory]);

  const handleDeleteBatch = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Delete items?',
      `This will permanently remove ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''} from this device and the server.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const targets = Array.from(selectedIds);
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            
            await db.deleteBatch(targets);
            onItemsChanged();
          },
        },
      ],
    );
  };
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cleanSlateScroll}
      >
        <OnboardingCarousel />
        
        <View style={styles.cleanSlateBox}>
          <Feather
            name="inbox"
            color={colors.textSecondary}
            size={24}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.emptyTitle}>YOUR VAULT IS VACANT</Text>
          <Text style={styles.emptyDesc}>
            Tap the plus symbol below to stash your first item
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.groupHeaderLabel}>
              ALL STASH
            </Text>
            {filtered.length > 0 && (
              <Pressable
                onPress={() => {
                  if (isSelectionMode) {
                    setSelectedIds(new Set());
                  }
                  setIsSelectionMode(!isSelectionMode);
                }}
                style={({ pressed }) => [
                  styles.selectModeBtn,
                  pressed && { opacity: 0.7 },
                  isSelectionMode && styles.selectModeBtnActive,
                ]}
              >
                <Text style={[
                  styles.selectModeText,
                  isSelectionMode && styles.selectModeTextActive,
                ]}>
                  {isSelectionMode ? 'CANCEL' : 'SELECT'}
                </Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.groupHeaderCount}>
            {filtered.length} {filtered.length === 1 ? 'ELEMENT' : 'ELEMENTS'}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="info"
              color={colors.textSecondary}
              size={18}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.noResults}>
              NO RESULTS KEY "{searchQuery.toUpperCase()}"
            </Text>
          </View>
        ) : (
          <MasonryGrid
            items={filtered}
            onItemClick={onItemClick}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelect={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
          />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Pill Panel */}
      {selectedIds.size > 0 && (
        <Animated.View
          entering={SlideInDown.springify().damping(25).stiffness(300).mass(0.5)}
          exiting={SlideOutDown.duration(180)}
          style={styles.floatingBar}
        >
          <View style={styles.floatingBarInner}>
            <Text style={styles.floatingCount}>
              {selectedIds.size} SELECTED
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  setSelectedIds(new Set());
                  setIsSelectionMode(false);
                }}
                style={({ pressed }) => [
                  styles.floatingCancelBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.floatingCancelText}>CANCEL</Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteBatch}
                style={({ pressed }) => [
                  styles.floatingDeleteBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Feather name="trash-2" color="#FFFFFF" size={13} />
                <Text style={styles.floatingDeleteText}>DELETE</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </>
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
  selectModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectModeBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  selectModeText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectModeTextActive: {
    color: '#EF4444',
  },
  floatingBar: {
    position: 'absolute',
    bottom: 96,
    left: 8,
    right: 8,
    zIndex: 1000,
  },
  floatingBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 20, 20, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingCount: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
  },
  floatingCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  floatingCancelText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  floatingDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingDeleteText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cleanSlateScroll: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  cleanSlateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 12,
  },
});
