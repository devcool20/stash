import { motion } from 'motion/react';
import { ShoppingBag, Utensils, Compass, BookOpen, Layers } from 'lucide-react';
import { db } from '../database';

interface CategoriesTabProps {
  selectedCategory: string;
  onSelectCategory: (category: 'All' | 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design') => void;
}

export default function CategoriesTab({ selectedCategory, onSelectCategory }: CategoriesTabProps) {
  const counts = db.getCounts();

  const categories = [
    { id: 'All', label: 'All STASH', icon: Layers, glow: 'rgba(255, 255, 255, 0.1)', color: 'text-white', bg: 'bg-white' },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingBag, glow: 'rgba(244, 63, 94, 0.25)', color: 'text-rose-400', bg: 'bg-rose-500' },
    { id: 'Recipes', label: 'Recipes', icon: Utensils, glow: 'rgba(245, 158, 11, 0.25)', color: 'text-amber-400', bg: 'bg-amber-500' },
    { id: 'Travel', label: 'Travel', icon: Compass, glow: 'rgba(16, 185, 129, 0.25)', color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { id: 'Articles', label: 'Articles', icon: BookOpen, glow: 'rgba(139, 92, 246, 0.25)', color: 'text-violet-400', bg: 'bg-violet-500' },
    { id: 'Design', label: 'Design', icon: Layers, glow: 'rgba(217, 70, 239, 0.25)', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500' }
  ] as const;

  return (
    <div id="smart-library-explorer" className="space-y-4 py-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">Smart Library Lenses</span>
        <span className="font-mono text-[9px] text-[#8A8A93]">5 AUTO-CLUSTERING CORES</span>
      </div>

      {/* Horizontal horizontal lens viewer layout */}
      <div 
        id="categories-horizontal-scroller" 
        className="flex items-center space-x-3 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'All' 
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[cat.id as Exclude<typeof cat.id, 'All'>];

          return (
            <button
              key={cat.id}
              id={`category-tile-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className="snap-start shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-2xl outline-none cursor-pointer"
            >
              <div 
                className={`w-[110px] h-[110px] flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-300 transform border select-none ${
                  isSelected 
                    ? 'scale-[1.03]' 
                    : 'bg-white/3 border-white/5 opacity-70 hover:opacity-100 hover:bg-white/5'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 25px 0 ${cat.glow}, inset 0 2px 4px rgba(255,255,255,0.15)` : 'none',
                  borderColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'
                }}
              >
                {/* Active selection color drop dot in upper right corner */}
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl bg-white/5 border border-white/10 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <motion.div 
                      layoutId="category-selection-dot"
                      className={`w-2 h-2 rounded-full ${cat.bg} shadow-[0_0_10px_rgba(255,255,255,0.8)]`}
                    />
                  )}
                </div>

                <div className="text-left">
                  <span className="block font-display font-medium text-xs tracking-tight text-white mb-0.5">
                    {cat.id === 'All' ? 'Vault (All)' : cat.id}
                  </span>
                  <span className="block font-mono text-[8px] text-gray-500 uppercase tracking-wider">
                    {count} {count === 1 ? 'asset' : 'assets'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
