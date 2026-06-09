import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Inbox, Info } from 'lucide-react';
import Lottie from 'lottie-react';
import birdyAnimation from './birdy.json';
import { db } from './database';
import { StashItem, ActiveCategory } from './types';
import BottomBar from './components/BottomBar';
import AddStashModal from './components/AddStashModal';
import FocusInspector from './components/FocusInspector';
import MasonryGrid from './components/MasonryGrid';
import CategoriesScreen from './components/CategoriesScreen';
import SettingsTab from './components/SettingsTab';
import CategorySlider from './components/CategorySlider';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'stash' | 'categories' | 'profile'>('stash');
  
  // Storage items state (re-loaded on database updates)
  const [items, setItems] = useState<StashItem[]>([]);
  const [pendingItems, setPendingItems] = useState<StashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Category Lens
  const [selectedCategory, setSelectedCategory] = useState<ActiveCategory>('All');

  // Interactive sheet modals controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<StashItem | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black flex flex-col max-w-md mx-auto px-4 pt-4 pb-28">
      
      {/* Background orbs (matching mobile background aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] aspect-square rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full flex-1">
        {/* Brand header */}
        <header className="flex items-center justify-between mb-5 pt-1 shrink-0" id="main-app-header">
          <div className="flex flex-col">
            {/* SVG Animated Wave logo */}
            <div className="h-8 flex items-center justify-start">
              <svg width="120" height="32" viewBox="0 0 120 32" className="select-none">
                <defs>
                  <clipPath id="text-clip">
                    <text
                      fontSize="24"
                      fontWeight="700"
                      fontFamily="Georgia, serif"
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
                  fontFamily="Georgia, serif"
                  letterSpacing="-0.5px"
                  x="0"
                  y="24"
                >
                  Stash
                </text>

                {/* Wave 1 */}
                <path
                  className="wave-anim-1"
                  d="M 0 14 Q 25 9, 50 14 T 100 14 T 150 14 T 200 14 T 250 14 T 300 14 L 300 40 L 0 40 Z"
                  fill="url(#grad1)"
                  opacity="0.6"
                  clipPath="url(#text-clip)"
                />

                {/* Wave 2 */}
                <path
                  className="wave-anim-2"
                  d="M 0 16 Q 25 21, 50 16 T 100 16 T 150 16 T 200 16 T 250 16 T 300 16 L 300 40 L 0 40 Z"
                  fill="url(#grad2)"
                  opacity="0.85"
                  clipPath="url(#text-clip)"
                />
              </svg>
            </div>
            <span className="text-[8px] font-mono tracking-widest text-[#8A8A93] uppercase mt-1">LOCAL-FIRST INBOX</span>
          </div>

          <div className="w-11 h-11 flex items-center justify-center shrink-0">
            <Lottie 
              animationData={birdyAnimation} 
              loop={true} 
              className="w-11 h-11"
            />
          </div>
        </header>

        {/* Dynamic Search Box interceptor */}
        {activeTab === 'stash' && (
          <div className="mb-3.5 relative z-20 shrink-0" id="search-interceptor-box">
            <div className={`relative flex items-center h-11 px-3 bg-white/[0.04] border ${searchFocused ? 'border-white/30 ring-1 ring-white/10' : 'border-white/[0.06]'} rounded-2xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)]`}>
              
              {/* Highlight shimmer glow overlay */}
              <div className={`absolute inset-0 bg-white/[0.01] rounded-2xl transition-opacity duration-300 pointer-events-none ${searchFocused ? 'opacity-100' : 'opacity-0'}`} />

              {/* Glowing Icon Wrapper */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white shrink-0 z-10 mr-2.5">
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
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 z-10"
              />

              <div className="z-10 ml-2">
                <span className="font-mono text-[8px] tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-400 uppercase font-bold">
                  {filteredItems.length} {filteredItems.length === 1 ? 'Match' : 'Matches'}
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
          <AnimatePresence mode="wait">
            {/* Screen 1: The Infinite Stash visual grid */}
            {activeTab === 'stash' && (
              <motion.div
                key="stash-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {items.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                    <Inbox className="w-8 h-8 mx-auto text-gray-650 mb-2 animate-bounce" />
                    <h3 className="font-display font-medium text-xs text-white">Inbox is Vacant</h3>
                    <p className="text-[10px] text-gray-500 font-sans mt-0.5">Click the plus symbol or press ⌘K to scan resources</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <Info className="w-5 h-5 mx-auto text-gray-650 mb-1.5" />
                    <p className="text-[10px] text-gray-400 font-mono">NO RESULTS KEY "{searchQuery.toUpperCase()}"</p>
                  </div>
                ) : (
                  <MasonryGrid 
                    items={filteredItems} 
                    onItemClick={(item) => setFocusedItem(item)} 
                  />
                )}
                {/* Visual grid bottom spacing padding */}
                <div className="h-20" />
              </motion.div>
            )}

            {/* Screen 2: Inbox Pending captures queue */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsTab onResetDatabase={handleResetDatabase} />
                <div className="h-20" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM HUD MASTER BAR */}
        <BottomBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddClick={() => setIsAddOpen(true)}
          pendingCount={pendingItems.length}
        />

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
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
