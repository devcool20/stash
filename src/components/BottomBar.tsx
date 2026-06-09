import { Inbox, FolderOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomBarProps {
  activeTab: 'stash' | 'categories' | 'profile';
  setActiveTab: (tab: 'stash' | 'categories' | 'profile') => void;
  onAddClick: () => void;
  pendingCount?: number;
}

export default function BottomBar({ activeTab, setActiveTab, onAddClick, pendingCount = 0 }: BottomBarProps) {
  const tabs = [
    { id: 'stash', label: 'Stash', icon: Inbox },
    { id: 'categories', label: 'Inbox', icon: FolderOpen },
    { id: 'profile', label: 'Profile', icon: ShieldCheck },
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40">
      <div 
        id="bottom-nav"
        className="glass-panel-base glass-border-diagonal px-3 py-2 flex items-center justify-between rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center space-x-1 justify-around w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center py-2 px-4 rounded-full transition-colors cursor-pointer select-none outline-none group text-xs text-center"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute inset-0 bg-white/8 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.06)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <div className="relative">
                  <Icon 
                    id={`tab-icon-${tab.id}`}
                    className={`w-5 h-5 mb-0.5 transition-all duration-300 relative z-10 ${
                      isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-400 group-hover:text-white group-hover:scale-105'
                    }`}
                  />
                  {tab.id === 'categories' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-white text-black font-mono text-[7.5px] font-bold flex items-center justify-center border border-black px-0.5 z-20">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>
                
                <span 
                  className={`text-[10px] uppercase font-display tracking-widest relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white font-medium' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          <div className="h-6 w-px bg-white/10 mx-1 relative z-10" />

          {/* Core premium 'Add' button triggers ingest sequence */}
          <button
            id="add-stash-trigger"
            onClick={onAddClick}
            className="flex items-center justify-center p-2.5 rounded-full bg-white/12 border border-white/20 text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all active:scale-90 duration-200 outline-none cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <svg 
                className="w-4 h-4 fill-current stroke-current" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  );
}
