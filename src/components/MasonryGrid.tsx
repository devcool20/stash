import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Utensils, Compass, BookOpen, Layers, Link as LinkIcon, Loader2 } from 'lucide-react';
import { StashItem } from '../types';

interface MasonryGridProps {
  items: StashItem[];
  onItemClick: (item: StashItem) => void;
}

export default function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
  
  // Category helper to get matching icon indicators
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Shopping': return <ShoppingBag className="w-3.5 h-3.5 text-white" />;
      case 'Recipes': return <Utensils className="w-3.5 h-3.5 text-white" />;
      case 'Travel': return <Compass className="w-3.5 h-3.5 text-white" />;
      case 'Articles': return <BookOpen className="w-3.5 h-3.5 text-white" />;
      case 'Design': return <Layers className="w-3.5 h-3.5 text-white" />;
      default: return <LinkIcon className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffHrs = Math.floor(diffMs / (3600 * 1000));
      const diffDays = Math.floor(diffHrs / 24);

      if (diffDays > 0) return `${diffDays}D AGO`;
      if (diffHrs > 0) return `${diffHrs}H AGO`;
      return 'JUST NOW';
    } catch (_) {
      return '';
    }
  };

  return (
    <div id="masonry-feed" className="grid grid-cols-2 gap-4">
      {/* Column 1 - Even indexing items */}
      <div className="flex flex-col space-y-4">
        {items
          .filter((_, idx) => idx % 2 === 0)
          .map((item, idx) => (
            <GridCard 
              key={item.id} 
              item={item} 
              index={idx * 2}
              onItemClick={onItemClick} 
              getCategoryIcon={getCategoryIcon}
              getRelativeTime={getRelativeTime}
            />
          ))}
      </div>

      {/* Column 2 - Odd indexing items */}
      <div className="flex flex-col space-y-4 pt-6">
        {items
          .filter((_, idx) => idx % 2 !== 0)
          .map((item, idx) => (
            <GridCard 
              key={item.id} 
              item={item} 
              index={idx * 2 + 1}
              onItemClick={onItemClick} 
              getCategoryIcon={getCategoryIcon}
              getRelativeTime={getRelativeTime}
            />
          ))}
      </div>
    </div>
  );
}

interface GridCardProps {
  key?: string;
  item: StashItem;
  index: number;
  onItemClick: (item: StashItem) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  getRelativeTime: (isoString: string) => string;
}

function GridCard({ item, index, onItemClick, getCategoryIcon, getRelativeTime }: GridCardProps) {
  const isProcessing = item.status === 'processing';

  if (isProcessing) {
    return (
      <div 
        id={`skeleton-shimmer-${item.id}`}
        className="glass-panel-base glass-border-diagonal p-4 rounded-2xl w-full min-h-[160px] animate-pulse flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <div className="h-6 w-16 rounded bg-white/10" />
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/50" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
        <div className="h-2 w-10 rounded bg-white/10 self-end mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      layoutId={`card-container-${item.id}`}
      onClick={() => onItemClick(item)}
      id={`stash-card-${item.id}`}
      className="glass-panel-interactive glass-border-diagonal overflow-hidden rounded-2xl cursor-pointer w-full group relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 180, 
        delay: Math.min(index * 0.04, 0.4) 
      }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Image Display */}
      {item.imageUrl && (
        <div className="relative overflow-hidden aspect-[4/5] rounded-[14px]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Hide image if broken link
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle gradient gradient overlay over image cards to keep titles legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" />
        </div>
      )}

      {/* Floating Category Tag Icon Indicator */}
      <div className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-[#000000]/60 backdrop-blur-md border border-white/10 z-10 flex items-center justify-center">
        {getCategoryIcon(item.category)}
      </div>

      {/* Floating Domain Favicon indicator if URL exists */}
      {item.sourceUrl && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
            <img 
              src={item.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${item.sourceUrl.replace(/^https?:\/\//i, '').split('/')[0]}`}
              alt="favicon"
              className="w-3.5 h-3.5 object-contain rounded"
              onError={(e) => {
                // Return fallback icon
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
              }}
            />
          </div>
        </div>
      )}

      {/* Title & Metadata Strip details */}
      <div className="p-3.5 space-y-1 relative z-10">
        <h4 id={`card-title-${item.id}`} className="font-display font-medium text-xs tracking-tight text-white leading-snug group-hover:text-emerald-300 transition-colors">
          {item.title}
        </h4>
        
        {item.description ? (
          <p id={`card-desc-${item.id}`} className="text-[10px] text-gray-400 line-clamp-1 font-sans">
            {item.description}
          </p>
        ) : item.sourceUrl ? (
          <p className="text-[8px] font-mono text-gray-500 truncate mt-0.5">
            {item.sourceUrl.replace(/^https?:\/\/(www\.)?/i, '')}
          </p>
        ) : null}

        <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 pt-1 border-t border-white/5">
          <span>{item.category.toUpperCase()}</span>
          <span>{getRelativeTime(item.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
