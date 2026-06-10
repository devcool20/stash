import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Inbox, Info, X, Trash2 } from 'lucide-react';
import Lottie from 'lottie-react';
import birdyAnimation from './birdy.json';
import { db } from './database';
import { supabase } from './supabase';
import { StashItem, ActiveCategory } from './types';
import BottomBar from './components/BottomBar';
import AddStashModal from './components/AddStashModal';
import FocusInspector from './components/FocusInspector';
import MasonryGrid from './components/MasonryGrid';
import CategoriesScreen from './components/CategoriesScreen';
import SettingsTab from './components/SettingsTab';
import CategorySlider from './components/CategorySlider';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import OnboardingCarousel from './components/OnboardingCarousel';

const tabOrder = { stash: 0, categories: 1, profile: 2 };

const slideVariants = {
  initial: (customDirection: number) => ({
    x: customDirection * 40,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 220,
    },
  },
  exit: (customDirection: number) => ({
    x: -customDirection * 40,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  }),
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'stash' | 'categories' | 'profile'>('stash');
  const [prevTab, setPrevTab] = useState<'stash' | 'categories' | 'profile'>('stash');

  useEffect(() => {
    setPrevTab(activeTab);
  }, [activeTab]);
  
  // Storage items state (re-loaded on database updates)
  const [items, setItems] = useState<StashItem[]>([]);
  const [pendingItems, setPendingItems] = useState<StashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Selected Category Lens
  const [selectedCategory, setSelectedCategory] = useState<ActiveCategory>('All');

  // Interactive sheet modals controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<StashItem | null>(null);

  // Multi-select / Batch delete states (ported from mobile StashScreen)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection mode when active dataset changes
  useEffect(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, [items.length, searchQuery, selectedCategory]);

  // Boot Splash Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // listen to Auth State changes (from mobile flow)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      db.setUserId(currentSession?.user?.id || null).then(() => {
        setAuthLoading(false);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      db.setUserId(currentSession?.user?.id || null).then(() => {
        setAuthLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initial load & keyboard shortcuts helper
  useEffect(() => {
    setItems(db.getAll());
    setPendingItems(db.getPending());
    
    const unsubscribe = db.onChange(() => {
      setItems(db.getAll());
      setPendingItems(db.getPending());
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsAddOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync / refresh from storage
  const refreshStorage = () => {
    setItems(db.getAll());
    setPendingItems(db.getPending());
  };

  // Filtered dataset computed in real-time
  const getFilteredItems = () => {
    let dataset = searchQuery.trim() ? db.search(searchQuery) : items;
    
    if (selectedCategory !== 'All') {
      dataset = dataset.filter(item => item.category === selectedCategory);
    }
    
    return dataset.filter(item => item.status === 'ready' || item.status === 'processing');
  };

  const filteredItems = getFilteredItems();

  // Dialog Operations Actions
  const handleIngestSuccess = (newItem: StashItem) => {
    refreshStorage();
    if (newItem && newItem.status === 'ready') {
      setFocusedItem(newItem);
    }
  };

  const handleDeleteItem = (id: string) => {
    db.delete(id);
    refreshStorage();
    setFocusedItem(null);
  };

  const handleRegroupItem = (id: string, newCat: 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design') => {
    db.update(id, { category: newCat });
    refreshStorage();
    
    // Update focused panel state live
    const updated = db.getAll().find(i => i.id === id);
    if (updated) {
      setFocusedItem(updated);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<StashItem>) => {
    db.update(id, updates);
    refreshStorage();
    
    // Update focused panel state live
    const updated = db.getAll().find(i => i.id === id);
    if (updated) {
      setFocusedItem(updated);
    }
  };

  const handleResetDatabase = () => {
    if (confirm('Re-crystallize Sandbox database? This restores all default aesthetic lookbook listings.')) {
      db.reset();
      refreshStorage();
      setSelectedCategory('All');
    }
  };

  const handleProcessBatch = async (ids: string[]) => {
    await db.processBatch(ids);
    refreshStorage();
    setActiveTab('stash');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteBatch = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to permanently delete these ${selectedIds.size} items?`)) {
      db.deleteBatch(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      refreshStorage();
    }
  };

  // Render Splash Screen on Boot
  if (showSplash || authLoading) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  // Render Sign In Screen if no session exists (matching mobile auth gateway)
  if (!session) {
    return (
      <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden flex flex-col justify-center">
        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] aspect-square rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black flex flex-col max-w-md mx-auto px-4 pt-4 pb-28">
      
      {/* Background orbs (matching mobile background aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] aspect-square rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full flex-1">
        {/* Brand header */}
        <header className="flex items-center justify-between mb-4 pt-1.5 pb-1 shrink-0" id="main-app-header">
          <div className="flex flex-col text-left">
            {/* SVG Animated Wave logo */}
            <div className="h-8 flex items-center justify-start">
              <svg width="120" height="32" viewBox="0 0 120 32" className="select-none">
                <defs>
                  <clipPath id="text-clip">
                    <text
                      fontSize="24"
                      fontWeight="700"
                      fontFamily="Lato, sans-serif"
                      letterSpacing="-0.5px"
                      x="0"
                      y="24"
                    >
                      Stash
                    </text>
                  </clipPath>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>

                {/* Base background text */}
                <text
                  fill="rgba(255, 255, 255, 0.15)"
                  fontSize="24"
                  fontWeight="700"
                  fontFamily="Lato, sans-serif"
                  letterSpacing="-0.5px"
                  x="0"
                  y="24"
                >
                  Stash
                </text>

                <g clipPath="url(#text-clip)">
                  {/* Wave 1 */}
                  <path
                    className="wave-anim-1"
                    d="M 0 14 Q 25 9, 50 14 T 100 14 T 150 14 T 200 14 T 250 14 L 250 40 L 0 40 Z"
                    fill="url(#grad1)"
                    opacity="0.6"
                  />

                  {/* Wave 2 */}
                  <path
                    className="wave-anim-2"
                    d="M 0 16 Q 25 21, 50 16 T 100 16 T 150 16 T 200 16 T 250 16 L 250 40 L 0 40 Z"
                    fill="url(#grad2)"
                    opacity="0.85"
                  />
                </g>
              </svg>
            </div>
          </div>
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <Lottie 
              animationData={birdyAnimation} 
              loop={true} 
              className="w-12 h-12"
            />
          </div>
        </header>

        {/* Dynamic Search Box interceptor */}
        {activeTab === 'stash' && (
          <div className="mb-3.5 relative z-20 shrink-0" id="search-interceptor-box">
            <div className={`relative flex items-center h-11 px-3 bg-white/[0.04] border ${searchFocused ? 'border-white/35 shadow-[0_0_12px_rgba(255,255,255,0.05)]' : 'border-white/[0.06]'} rounded-2xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)]`}>
              
              {/* Highlight shimmer glow overlay */}
              <div className={`absolute inset-0 bg-white/[0.02] rounded-2xl transition-opacity duration-300 pointer-events-none ${searchFocused ? 'opacity-100' : 'opacity-0'}`} />

              {/* Glowing Icon Wrapper */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.08] text-white shrink-0 z-10 mr-2.5">
                <Search className="w-3.5 h-3.5" />
              </div>

              <input
                type="text"
                id="search-input"
                placeholder="Search your vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-[#6E6E76] z-10 h-full"
              />

              {/* Clear button matching mobile flow */}
              {searchQuery.length > 0 && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="z-10 p-1.5 mr-0.5 text-[#8A8A93] hover:text-white transition-colors outline-none cursor-pointer flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Match counter labeled matching mobile standard: ITEM / ITEMS */}
              <div className="z-10 ml-1.5 shrink-0">
                <span className="font-mono text-[8px] tracking-wider px-1.5 py-0.5 rounded-[7px] bg-white/[0.04] border border-white/[0.08] text-[#8A8A93] uppercase font-semibold">
                  {filteredItems.length} {filteredItems.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'stash' && (
          <div className="mb-3">
            <CategorySlider
              categories={db.getCategories()}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        )}

        {/* Scrollable Screens Port */}
        <div className="flex-1 overflow-y-auto pr-0.5" id="screens-content-scroller">
          {(() => {
            const direction = tabOrder[activeTab] >= tabOrder[prevTab] ? 1 : -1;
            return (
              <AnimatePresence mode="wait">
                {/* Screen 1: The Infinite Stash visual grid */}
                {activeTab === 'stash' && (
                  <motion.div
                    key="stash-screen"
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {items.length === 0 ? (
                      <div className="space-y-4">
                        <OnboardingCarousel />
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Inbox className="w-6 h-6 text-[#8A8A93] mb-2 shrink-0" strokeWidth={1.5} />
                          <h3 className="text-[11px] font-bold tracking-widest text-white uppercase font-sans">YOUR VAULT IS VACANT</h3>
                          <p className="text-[9.5px] text-[#8A8A93] font-sans mt-1">Tap the plus symbol below to stash your first item</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Header Controls mimicking mobile screen: Group labels + Multi-Select Trigger */}
                        <div className="flex justify-between items-center px-0.5 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9.5px] uppercase font-display tracking-widest text-white font-bold">ALL STASH</span>
                            {filteredItems.length > 0 && (
                              <button
                                onClick={() => {
                                  if (isSelectionMode) {
                                    setSelectedIds(new Set());
                                  }
                                  setIsSelectionMode(!isSelectionMode);
                                }}
                                className={`px-2 py-1 rounded-md border text-[8px] font-bold tracking-wider transition-all cursor-pointer active:scale-95 ${
                                  isSelectionMode 
                                    ? 'bg-red-500/10 border-red-500/20 text-[#EF4444]' 
                                    : 'bg-white/5 border-white/8 text-[#8A8A93]'
                                }`}
                              >
                                {isSelectionMode ? 'CANCEL' : 'SELECT'}
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 tracking-wider">
                            {filteredItems.length} {filteredItems.length === 1 ? 'ELEMENT' : 'ELEMENTS'}
                          </span>
                        </div>

                        {filteredItems.length === 0 ? (
                          <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
                            <Info className="w-5 h-5 mx-auto text-gray-650 mb-1.5" />
                            <p className="text-[10px] text-gray-400 font-mono">NO RESULTS KEY "{searchQuery.toUpperCase()}"</p>
                          </div>
                        ) : (
                          <MasonryGrid 
                            items={filteredItems} 
                            onItemClick={(item) => setFocusedItem(item)} 
                            isSelectionMode={isSelectionMode}
                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                          />
                        )}
                      </>
                    )}
                    {/* Visual grid bottom spacing padding */}
                    <div className="h-20" />
                  </motion.div>
                )}

                {/* Screen 2: Inbox Pending captures queue */}
                {activeTab === 'categories' && (
                  <motion.div
                    key="categories-screen"
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <CategoriesScreen
                      pendingItems={pendingItems}
                      onProcessBatch={handleProcessBatch}
                    />
                    <div className="h-20" />
                  </motion.div>
                )}

                {/* Screen 3: Settings & Database Reset Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile-screen"
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <SettingsTab onResetDatabase={handleResetDatabase} />
                    <div className="h-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })()}
        </div>

        {/* BOTTOM HUD MASTER BAR */}
        <BottomBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddClick={() => setIsAddOpen(true)}
          pendingCount={pendingItems.length}
        />

        {/* Floating Multi-Select Action Panel (mimicking mobile StashScreen float design) */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
              className="fixed bottom-[96px] left-4 right-4 z-40 max-w-md mx-auto"
            >
              <div className="flex items-center justify-between bg-[#141414]/92 border border-white/12 rounded-[20px] py-2.5 px-4 shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
                <span className="text-white text-[10px] font-bold font-mono tracking-widest uppercase">
                  {selectedIds.size} SELECTED
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedIds(new Set());
                      setIsSelectionMode(false);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-white/8 bg-white/5 text-[#8A8A93] hover:text-white text-[9.5px] font-bold tracking-widest transition-all cursor-pointer active:scale-95"
                  >
                    CANCEL
                  </button>

                  <button
                    onClick={handleDeleteBatch}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EF4444] text-white text-[9.5px] font-bold tracking-widest transition-all cursor-pointer active:scale-95 shadow-md shadow-red-500/25"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>DELETE</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CORE STAGING FLOATING DIALOGS */}
        <AnimatePresence>
          {isAddOpen && (
            <AddStashModal 
              isOpen={isAddOpen} 
              onClose={() => setIsAddOpen(false)} 
              onSuccess={handleIngestSuccess}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {focusedItem && (
            <FocusInspector 
              item={focusedItem} 
              onClose={() => setFocusedItem(null)} 
              onDelete={handleDeleteItem} 
              onRegroup={handleRegroupItem}
              onUpdate={handleUpdateItem}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
