import { Archive, Inbox, User, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomBarProps {
  activeTab: 'stash' | 'categories' | 'profile';
  setActiveTab: (tab: 'stash' | 'categories' | 'profile') => void;
  onAddClick: () => void;
  pendingCount?: number;
}

export default function BottomBar({ activeTab, setActiveTab, onAddClick, pendingCount = 0 }: BottomBarProps) {
  const tabs = [
    { id: 'stash', icon: Archive },
    { id: 'categories', icon: Inbox },
    { id: 'profile', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 w-[88%] max-w-[320px] z-40">
      <div 
        id="bottom-nav"
        className="navbar-glassmorphism px-2.5 py-[8px] flex items-center justify-between rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.5)] h-[52px]"
      >
        <div className="flex items-center justify-between w-full relative">
          
          <div className="flex items-center justify-around flex-1 relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer select-none outline-none shrink-0"
                >
                  {/* Sliding active background indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-glow"
                      className="absolute inset-0 bg-white/12 border border-white/25 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.06)] -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-center w-9 h-9">
                    <Icon 
                      id={`tab-icon-${tab.id}`}
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive ? 'text-white scale-110' : 'text-white/45 hover:text-white'
                      }`}
                    />
                    {tab.id === 'categories' && pendingCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-white text-black font-mono text-[8px] font-bold flex items-center justify-center border border-black px-1 z-20 shadow-sm">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="h-[22px] w-px bg-white/10 mx-1.5 shrink-0" />

          {/* Core premium floating Add button */}
          <button
            id="add-stash-trigger"
            onClick={onAddClick}
            className="w-9 h-9 rounded-full bg-white/12 border border-white/25 text-white flex items-center justify-center shadow-md shadow-black/50 hover:bg-white/20 active:scale-90 transition-all outline-none cursor-pointer shrink-0"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex items-center justify-center"
            >
              <Plus className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </motion.div>
          </button>
          
        </div>
      </div>
    </div>
  );
}
