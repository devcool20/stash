import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { db } from './src/database';
import { StashItem, TabKey, CategoryKey } from './src/types';
import { AppHeader } from './src/components/AppHeader';
import { SearchInterceptor } from './src/components/SearchInterceptor';

import { BottomBar } from './src/components/BottomBar';
import { BackgroundOrbs } from './src/components/BackgroundOrbs';
import { AddStashModal } from './src/components/AddStashModal';
import { FocusInspector } from './src/components/FocusInspector';
import { StashScreen } from './src/screens/StashScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('stash');
  const [items, setItems] = useState<StashItem[]>([]);
  const [pendingItems, setPendingItems] = useState<StashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<StashItem | null>(null);
  const [focusedVisible, setFocusedVisible] = useState(false);

  const refreshStorage = useCallback(async () => {
    const all = await db.getAll();
    const pending = await db.getPending();
    setItems(all);
    setPendingItems(pending);
  }, []);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  const filteredCount = (() => {
    if (!searchQuery.trim()) return items.length;
    const tokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    if (tokens.length === 0) return items.length;
    return items.filter((item) => {
      const s = `${item.title} ${item.description || ''} ${
        item.extractedText || ''
      } ${item.sourceUrl || ''} ${item.category}`.toLowerCase();
      return tokens.every((t) => s.includes(t));
    }).length;
  })();

  const handleIngestSuccess = (newItem: StashItem) => {
    refreshStorage();
    if (newItem && newItem.id && newItem.status === 'ready') {
      setFocusedItem(newItem);
      setFocusedVisible(true);
    }
  };

  const handleItemClick = (item: StashItem) => {
    setFocusedItem(item);
    setFocusedVisible(true);
  };

  const handleCloseInspector = () => {
    setFocusedVisible(false);
    setTimeout(() => setFocusedItem(null), 250);
  };

  const handleDeleteItem = async (id: string) => {
    await db.delete(id);
    refreshStorage();
    handleCloseInspector();
  };

  const handleRegroupItem = async (
    id: string,
    newCat: CategoryKey,
  ) => {
    await db.update(id, { category: newCat });
    refreshStorage();
    const updated = (await db.getAll()).find((i) => i.id === id);
    if (updated) setFocusedItem(updated);
  };

  const handleResetDatabase = async () => {
    await db.reset();
    refreshStorage();
  };

  const handleProcessBatch = useCallback(async (ids: string[]) => {
    await db.processBatch(ids);
    refreshStorage();
    if (activeTab !== 'stash') setActiveTab('stash');
  }, [refreshStorage, activeTab]);

  const showSearch = activeTab === 'stash';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.canvas}>
          <BackgroundOrbs />

          <SafeAreaView edges={['top']} style={styles.body}>
            <View style={styles.headerArea}>
              <AppHeader onIngestPress={() => setIsAddOpen(true)} />
              {showSearch && (
                <SearchInterceptor
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  matchCount={filteredCount}
                />
              )}
            </View>

            <View style={styles.screenContainer}>
              {activeTab === 'stash' && (
                <StashScreen
                  items={items}
                  searchQuery={searchQuery}
                  onItemClick={handleItemClick}
                  onItemsChanged={refreshStorage}
                />
              )}
              {activeTab === 'categories' && (
                <CategoriesScreen
                  pendingItems={pendingItems}
                  onProcessBatch={handleProcessBatch}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileScreen
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </View>
          </SafeAreaView>

          <BottomBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddClick={() => setIsAddOpen(true)}
            pendingCount={pendingItems.length}
          />

          <SafeAreaView
            edges={['bottom']}
            style={styles.homeIndicator}
            pointerEvents="none"
          >
            <View style={styles.homeBar} />
          </SafeAreaView>

          <AddStashModal
            visible={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSuccess={handleIngestSuccess}
          />

          <FocusInspector
            item={focusedItem}
            visible={focusedVisible}
            onClose={handleCloseInspector}
            onDelete={handleDeleteItem}
            onRegroup={handleRegroupItem}
          />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  headerArea: {
    paddingTop: 4,
  },
  screenContainer: {
    flex: 1,
    paddingTop: 4,
  },
  homeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBar: {
    width: 112,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
