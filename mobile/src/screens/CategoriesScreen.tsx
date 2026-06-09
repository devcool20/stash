import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import {
  Inbox,
  Circle,
  CheckCircle2,
  Sparkles,
  Loader,
} from 'lucide-react-native';
import { db } from '../database';
import { StashItem } from '../types';
import { colors, fonts } from '../theme/colors';

interface CategoriesScreenProps {
  pendingItems: StashItem[];
  onProcessBatch: (ids: string[]) => Promise<void>;
}

export function CategoriesScreen({
  pendingItems,
  onProcessBatch,
}: CategoriesScreenProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pendingItems.length]);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === pendingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map((i) => i.id)));
    }
  }, [pendingItems, selectedIds]);

  const handleProcess = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setProcessing(true);
    await onProcessBatch(Array.from(selectedIds));
    setSelectedIds(new Set());
    setProcessing(false);
  }, [selectedIds, onProcessBatch]);

  const allSelected = pendingItems.length > 0 && selectedIds.size === pendingItems.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <Inbox color={colors.bg} size={14} strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Inbox</Text>
            <Text style={styles.headerSub}>
              {pendingItems.length} pending capture{pendingItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        {pendingItems.length > 0 && (
          <Pressable
            onPress={toggleAll}
            style={({ pressed }) => [
              styles.selectAllBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.selectAllText}>
              {allSelected ? 'DESELECT' : 'SELECT ALL'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Items */}
      {pendingItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Sparkles color={colors.textTertiary} size={20} strokeWidth={1.6} />
          </View>
          <Text style={styles.emptyTitle}>Inbox is empty</Text>
          <Text style={styles.emptyDesc}>
            Captured screenshots from the S overlay appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {pendingItems.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.duration(250).delay(idx * 60)}
            >
              <Pressable
                onPress={() => toggleItem(item.id)}
                style={({ pressed }) => [
                  styles.itemCard,
                  selectedIds.has(item.id) && styles.itemCardSelected,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.itemCheckbox}>
                  {selectedIds.has(item.id) ? (
                    <CheckCircle2 color={colors.accentCoral} size={18} strokeWidth={2} />
                  ) : (
                    <Circle color={colors.textTertiary} size={18} strokeWidth={1.5} />
                  )}
                </View>

                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemThumb}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>RAW</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Process button */}
      {selectedIds.size > 0 && (
        <Animated.View
          entering={SlideInUp.springify().damping(20)}
          style={styles.processBar}
        >
          <Pressable
            onPress={handleProcess}
            disabled={processing}
            style={({ pressed }) => [
              styles.processBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            {processing ? (
              <Loader color={colors.bg} size={14} strokeWidth={2.4} />
            ) : (
              <Sparkles color={colors.bg} size={14} strokeWidth={2.4} />
            )}
            <Text style={styles.processText}>
              {processing
                ? 'Processing...'
                : `Process ${selectedIds.size} capture${selectedIds.size !== 1 ? 's' : ''}`}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  selectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  selectAllText: {
    fontSize: 8.5,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 10,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCardSelected: {
    borderColor: colors.accentCoral,
    backgroundColor: colors.accentCoralSoft,
  },
  itemCheckbox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 11,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    lineHeight: 12,
  },
  itemMeta: {
    fontSize: 8,
    color: colors.textTertiary,
    fontFamily: fonts.mono,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.accentCoralSoft,
    borderWidth: 1,
    borderColor: colors.accentCoral,
  },
  statusText: {
    fontSize: 7,
    color: colors.accentCoral,
    fontFamily: fonts.mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontWeight: '600',
  },
  emptyDesc: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  processBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 22,
  },
  processBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.textPrimary,
    gap: 8,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  processText: {
    fontSize: 11,
    color: colors.bg,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
