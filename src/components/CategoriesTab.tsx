import { motion } from 'motion/react';
import { ShoppingBag, Utensils, Compass, BookOpen, Layers } from 'lucide-react';
import { db } from '../database';

interface CategoriesTabProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoriesTab({ selectedCategory, onSelectCategory }: CategoriesTabProps) {
  const counts = db.getCounts();
  const dbCategories = db.getCategories();

  const getCategoryConfig = (id: string) => {
    switch (id) {
      case 'All':
        return { label: 'All STASH', icon: Layers, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'Shopping':
        return { label: 'Shopping', icon: ShoppingBag, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'Recipes':
        return { label: 'Recipes', icon: Utensils, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'Travel':
        return { label: 'Travel', icon: Compass, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'Articles':
        return { label: 'Articles', icon: BookOpen, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'Design':
        return { label: 'Design', icon: Layers, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      case 'People':
        return { label: 'People', icon: Layers, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
      default:
        return { label: id, icon: Layers, glow: 'rgba(255, 255, 255, 0.15)', color: 'text-white', bg: 'bg-white' };
    }
  };

  const categories = ['All', ...dbCategories].map(id => ({
    id,
    ...getCategoryConfig(id)
  }));

  return (
    <div id="smart-library-explorer" className="space-y-4 py-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">Smart Library Lenses</span>
        <span className="font-mono text-[9px] text-[#8A8A93]">{categories.length - 1} AUTO-CLUSTERING CORES</span>
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
            : counts[cat.id] || 0;

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
                    {cat.id === 'All' ? 'Vault (All)' : cat.label}
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
