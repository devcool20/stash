import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<StashItem | null>(null);
  const [focusedVisible, setFocusedVisible] = useState(false);

  const refreshStorage = useCallback(async () => {
    const all = await db.getAll();
    setItems(all);
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

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.canvas}>
          {/* Atmospheric background orbs */}
          <BackgroundOrbs />

          {/* Content with safe area */}
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Main content wrapper - matches web: px-4 pt-3 */}
            <View style={styles.body}>
              {/* Header area */}
              <View style={styles.headerArea}>
                <AppHeader onIngestPress={() => setIsAddOpen(true)} />
                {activeTab !== 'profile' && (
                  <SearchInterceptor
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    matchCount={filteredCount}
                  />
                )}
              </View>

              {/* Screen content */}
              <View style={styles.screenContainer}>
                {activeTab === 'stash' && (
                  <Animated.View
                    key="stash"
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={styles.screen}
                  >
                    <StashScreen
                      items={items}
                      searchQuery={searchQuery}
                      onItemClick={handleItemClick}
                      onItemsChanged={refreshStorage}
                    />
                  </Animated.View>
                )}
                {activeTab === 'categories' && (
                  <Animated.View
                    key="categories"
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={styles.screen}
                  >
                    <CategoriesScreen
                      items={items}
                      searchQuery={searchQuery}
                      onItemClick={handleItemClick}
                    />
                  </Animated.View>
                )}
                {activeTab === 'profile' && (
                  <Animated.View
                    key="profile"
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={styles.screen}
                  >
                    <ProfileScreen onResetDatabase={handleResetDatabase} />
                  </Animated.View>
                )}
              </View>
            </View>
          </SafeAreaView>

          {/* Bottom navigation */}
          <BottomBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddClick={() => setIsAddOpen(true)}
          />

          {/* Modals */}
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
    backgroundColor: '#000000',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Matches web simulator viewport: px-4 pt-3
  body: {
    flex: 1,
    paddingHorizontal: 16, // px-4
    paddingTop: 12,        // pt-3
  },
  headerArea: {
    // No extra padding needed — AppHeader already has mb-5 pt-1
  },
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
