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
      className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 px-5 scrollbar-none snap-x select-none h-10 relative"
      style={{ scrollbarWidth: 'none' }}
    >
      {allCategories.map((cat) => {
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            id={`cat-pill-${cat}`}
            onClick={() => onSelectCategory(cat)}
            className={`relative h-[30px] px-3.5 rounded-[15px] text-[10.5px] font-bold tracking-wide transition-all duration-200 outline-none cursor-pointer snap-start shrink-0 flex items-center justify-center border ${
              isActive 
                ? 'bg-transparent border-transparent text-white' 
                : 'bg-white/[0.04] border-white/[0.06] text-[#8A8A93] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.08]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-category-bg"
                className="absolute inset-0 bg-white/12 border border-white/25 rounded-[15px] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-sans">
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
