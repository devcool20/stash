import { motion } from 'motion/react';

interface CategorySliderProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySliderProps) {
  const allCategories = ['All', ...categories];

  return (
    <div 
      id="category-slider-scroll" 
      className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x select-none"
      style={{ scrollbarWidth: 'none' }}
    >
      {allCategories.map((cat) => {
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            id={`cat-pill-${cat}`}
            onClick={() => onSelectCategory(cat)}
            className={`relative px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide uppercase transition-colors duration-200 outline-none cursor-pointer snap-start ${
              isActive 
                ? 'bg-transparent border border-transparent' 
                : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.08] hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-category-bg"
                className="absolute inset-0 bg-white/12 border border-white/20 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 font-mono transition-colors duration-200 ${
                isActive ? 'text-white font-bold' : 'text-gray-400'
              }`}
            >
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
