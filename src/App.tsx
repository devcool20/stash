import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Inbox, Command, Info, Smartphone, Monitor, Wifi, Battery } from 'lucide-react';
import Lottie from 'lottie-react';
import birdyAnimation from './birdy.json';
import { db } from './database';
import { StashItem, ActiveCategory } from './types';
import BottomBar from './components/BottomBar';
import AddStashModal from './components/AddStashModal';
import FocusInspector from './components/FocusInspector';
import MasonryGrid from './components/MasonryGrid';
import CategoriesTab from './components/CategoriesTab';
import SettingsTab from './components/SettingsTab';
import CategorySlider from './components/CategorySlider';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'stash' | 'categories' | 'profile'>('stash');
  
  // Storage items state (re-loaded on database updates)
  const [items, setItems] = useState<StashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Category Lens (for Screen 3)
  const [selectedCategory, setSelectedCategory] = useState<ActiveCategory>('All');

  // Interactive sheet modals controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<StashItem | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Mobile App Simulator State
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isCharging, setIsCharging] = useState(true);
  const [connectionType, setConnectionType] = useState<'WiFi' | '5G' | 'LTE'>('WiFi');
  const [simTime, setSimTime] = useState('17:14');
  const [isSyncedOnline, setIsSyncedOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsSyncedOnline(true);
    const handleOffline = () => setIsSyncedOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial load & keyboard shortcuts helper
  useEffect(() => {
    setItems(db.getAll());
    
    const unsubscribe = db.onChange(() => {
      setItems(db.getAll());
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

  // Live clock generator for simulated device status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setSimTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 20); // Sync every 20 seconds
    return () => clearInterval(interval);
  }, []);

  // Sync / refresh from storage
  const refreshStorage = () => {
    setItems(db.getAll());
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
    if (confirm('Re-crystallize Sandbox database? This restores all 10 default aesthetic lookbook listings.')) {
      db.reset();
      refreshStorage();
      setSelectedCategory('All');
    }
  };

  // Helper method to render app screens to keep codebase modular
  const renderInteractiveAppScreens = (isInsideSimulator = false) => {
    return (
      <div className="flex flex-col h-full">
        {/* Brand header */}
        <header className="flex items-center justify-between mb-5 pt-1 shrink-0" id="main-app-header">
          <div className="flex flex-col">
            <h1 className="font-display font-medium text-lg tracking-tight text-white leading-none">STASH</h1>
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
        {activeTab !== 'profile' && (
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
                  <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl col-span-2">
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

            {/* Screen 2: Categorized Auto-Clustering Library */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Swipeable clusters tab */}
                <CategoriesTab 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={(cat) => setSelectedCategory(cat)} 
                />

                <div className="space-y-2.5">
                  <div className="px-1 flex items-center justify-between text-[9px] font-display text-gray-500 uppercase tracking-widest">
                    <span>Group cluster: {selectedCategory}</span>
                    <span>{filteredItems.length} elements</span>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-gray-500">
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                      <p className="font-display font-medium text-xs text-white">Cluster is Empty</p>
                      <p className="text-[9px] font-sans mt-0.5">Scanned resources are auto-indexed via local FTS pipelines.</p>
                    </div>
                  ) : (
                    <MasonryGrid 
                      items={filteredItems} 
                      onItemClick={(item) => setFocusedItem(item)} 
                    />
                  )}
                </div>
                {/* Bottom spacer */}
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
        />

        {/* CORE STAGING FLOATING DIALOGS (Contained inside transformed local context if insideSimulator) */}
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
    );
  };

  return (
    <div 
      className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black"
    >

      {/* FIXED PLATFORM UTILITY CONTROLLER HEADER (Figma / Arc layout look) */}
      <div className="relative z-30 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          
          <div className="flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <div className="font-mono text-gray-400 uppercase text-[10px] tracking-widest flex items-center gap-1.5">
              <span>SANDBOX ENGINE:</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-[9px]">ELEGANT DARK MOBILE STACK</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Monitor className="w-3.5 h-3.5" />
              <span>Shell Deck:</span>
            </div>
            
            <div className="flex bg-neutral-900 border border-white/10 rounded-full p-0.5">
              <button 
                id="toggle-web-layout-btn"
                onClick={() => setIsMobileMode(false)}
                className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center gap-1 ${!isMobileMode ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                <Monitor className="w-2.5 h-2.5" />
                <span>Web Client</span>
              </button>
              <button 
                id="toggle-sim-layout-btn"
                onClick={() => setIsMobileMode(true)}
                className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center gap-1 ${isMobileMode ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                <Smartphone className="w-2.5 h-2.5" />
                <span>Mobile App</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CORE WORKSPACE VIEW ROUTING LAYER */}
      {isMobileMode ? (
        /* VIRTUAL SMARTPHONE LIVE SIMULATION */
        <div className="relative z-10 w-full min-h-[calc(100vh-60px)] flex flex-col lg:flex-row items-center justify-center gap-10 py-10 px-4 max-w-5xl mx-auto">
          
          {/* Interactive virtual mobile phone container parameters controller pane */}
          <div className="w-full lg:w-72 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl relative self-start lg:sticky lg:top-24">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-white" />
              <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-white">App Simulator Rules</h4>
            </div>

            {/* Connection antenna mock switch */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-400 block">DOCK ANTENNA NETWORK</label>
              <div className="grid grid-cols-3 gap-1 bg-black/40 border border-white/5 rounded-xl p-1">
                {(['WiFi', '5G', 'LTE'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setConnectionType(t)}
                    className={`py-1.5 text-[9px] font-mono rounded-lg transition-colors cursor-pointer ${connectionType === t ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Level slide rule */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-mono uppercase text-gray-400">Mock Battery Index</span>
                <span className="text-white font-mono font-medium">{batteryLevel}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={batteryLevel} 
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
              />
              <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] text-gray-450 pt-0.5">
                <input 
                  type="checkbox" 
                  checked={isCharging} 
                  onChange={(e) => setIsCharging(e.target.checked)}
                  className="rounded border-white/15 bg-black text-white focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="font-mono">Simulate Power Supply</span>
              </label>
            </div>

            {/* Simulated Spec Index */}
            <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-3.5 space-y-1.5 font-mono text-[9px] text-[#8A8A93]">
              <div className="flex justify-between"><span className="text-gray-500">Device Platform</span><span className="text-white">iOS 19 Client UI</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rendering Frame</span><span className="text-white">OLED SuperRetina</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Clustering Mode</span><span className="text-white">FTS5 Auto-Index</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Local Sandbox</span><span className="text-white">Active (On-Device)</span></div>
            </div>

            {/* Dynamic shortcut tips */}
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-normal">
                Double tap cards inside smartphone simulator viewport to open on-device smart OCR scanner rules.
              </p>
            </div>
          </div>

          {/* Core high-fidelity structural outer glass bezel model smartphone */}
          <div className="shadow-2xl relative select-none shrink-0" style={{ perspective: '1200px' }}>
            {/* Edge Physical Hardware Button Details */}
            {/* Ring switcher */}
            <div className="absolute left-[-11px] top-28 w-[3px] h-6 bg-neutral-800 rounded-l border-l border-white/5" />
            {/* Volume Up */}
            <div className="absolute left-[-11px] top-40 w-[3px] h-12 bg-neutral-800 rounded-l border-l border-white/5" />
            {/* Volume Down */}
            <div className="absolute left-[-11px] top-56 w-[3px] h-12 bg-neutral-800 rounded-l border-l border-white/5" />
            {/* Power key */}
            <div className="absolute right-[-11px] top-48 w-[3px] h-16 bg-neutral-800 rounded-r border-r border-white/5" />

            {/* Chassis glass body */}
            <div className="w-[375px] h-[812px] bg-black rounded-[52px] border-[12px] border-neutral-900 ring-4 ring-white/10 ring-offset-2 ring-offset-black relative z-10 flex flex-col overflow-hidden shadow-[0_35px_80px_rgba(0,0,0,0.95)]">
              
              {/* Camera Dynamic Island capsule bar */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-45 flex items-center justify-center border border-white/5 shadow-inner">
                {/* Selfie lens */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d14] border border-white/10 mr-12 flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#05051a] rounded-full animate-pulse" />
                </div>
                {/* Proximity dot sensor */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a14]" />
              </div>

              {/* Status Indicator Panel */}
              <div className="h-12 bg-black/70 backdrop-blur-md flex items-end justify-between px-6 pb-2.5 select-none relative z-40 shrink-0 text-[10px] font-sans font-semibold tracking-tight text-white">
                <div>{simTime}</div>
                <div className="flex items-center space-x-1.5">
                  {/* Mock antennae bar */}
                  {connectionType === 'WiFi' ? (
                    <Wifi className="w-3.5 h-3.5 text-white/90" />
                  ) : (
                    <div className="flex items-end gap-[1px] h-2.5 w-3.5 border-b border-white/20 pb-[1.5px] mr-1">
                      <div className="w-[2px] h-[2px] bg-white rounded-t-[1px]" />
                      <div className="w-[2px] h-[4px] bg-white rounded-t-[1px]" />
                      <div className="w-[2px] h-[6px] bg-white rounded-t-[1px]" />
                      <div className="w-[2px] h-[8px] bg-white rounded-t-[1px]" />
                    </div>
                  )}
                  {connectionType !== 'WiFi' && <span className="text-[8px] uppercase font-mono mr-0.5">{connectionType}</span>}

                  {/* Battery representation */}
                  <div className="flex items-center space-x-1">
                    {isCharging && <span className="text-[7px] text-white font-mono animate-bounce">⚡</span>}
                    <span className="text-[9px] font-mono text-white/80">{batteryLevel}%</span>
                    <div className="w-5 h-2.5 border border-white/30 rounded-[3px] p-[1px] flex items-center">
                      <div 
                        className={`h-full rounded-[1px] transition-all duration-300 ${batteryLevel <= 20 ? 'bg-neutral-600' : isCharging ? 'bg-white animate-pulse' : 'bg-white'}`}
                        style={{ width: `${batteryLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Virtual Interface Screen Wrapper (TRANSFORM LOCKS DETAILED FIXED POPUPS) */}
              <div 
                className="flex-1 w-full relative overflow-hidden transform scale-100 translate-x-y-z"
                style={{
                  backgroundImage: 'radial-gradient(circle at 12% 82%, #0A0A0A 0%, transparent 45%), radial-gradient(circle at 88% 18%, #141414 0%, transparent 45%)'
                }}
              >
                {/* Interactive mobile contents */}
                <div className="w-full h-full px-4 pt-3 relative overflow-hidden flex flex-col">
                  {renderInteractiveAppScreens(true)}
                </div>

                {/* Bottom native home slider navigation bar gesture line representation */}
                <div className="h-4 bg-transparent absolute bottom-0 left-0 right-0 z-40 pointer-events-none flex items-center justify-center">
                  <div className="w-28 h-[4px] bg-white/30 rounded-full" />
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* STANDARD VIEW FOR WEB DESKTOP EXTENSION */
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 pb-16">
          {renderInteractiveAppScreens(false)}
        </div>
      )}

    </div>
  );
}
