import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Utensils, Compass, BookOpen, Layers, Link as LinkIcon, Loader2, Circle, CheckCircle } from 'lucide-react';
import { StashItem } from '../types';

interface MasonryGridProps {
  items: StashItem[];
  onItemClick: (item: StashItem) => void;
  isSelectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export default function MasonryGrid({ 
  items, 
  onItemClick, 
  isSelectionMode = false, 
  selectedIds = new Set(), 
  onToggleSelect 
}: MasonryGridProps) {
  
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
    <div id="masonry-feed" className="grid grid-cols-2 gap-3">
      {/* Column 1 - Even indexing items */}
      <div className="flex flex-col space-y-3">
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
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
      </div>

      {/* Column 2 - Odd indexing items */}
      <div className="flex flex-col space-y-3 pt-[18px]">
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
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
      </div>
    </div>
  );
}

interface GridCardProps {
  key?: React.Key;
  item: StashItem;
  index: number;
  onItemClick: (item: StashItem) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  getRelativeTime: (isoString: string) => string;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect?: (id: string) => void;
}

function GridCard({ 
  item, 
  index, 
  onItemClick, 
  getCategoryIcon, 
  getRelativeTime, 
  isSelectionMode, 
  selectedIds, 
  onToggleSelect 
}: GridCardProps) {
  const isProcessing = item.status === 'processing';
  const isSelected = isSelectionMode && selectedIds.has(item.id);

  if (isProcessing) {
    return (
      <div 
        id={`skeleton-shimmer-${item.id}`}
        className="bg-white/[0.03] border border-white/[0.05] rounded-[18px] p-[14px] w-full min-h-[200px] animate-pulse flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <div className="h-6 w-16 rounded bg-neutral-900" />
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/50" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-3.5 w-3/4 rounded bg-neutral-900" />
          <div className="h-2.5 w-1/2 rounded bg-neutral-900" />
        </div>
        <div className="h-2 w-8 rounded bg-neutral-900 self-end mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      layoutId={`card-container-${item.id}`}
      onClick={() => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect(item.id);
        } else {
          onItemClick(item);
        }
      }}
      id={`stash-card-${item.id}`}
      className={`glass-panel-base glass-border-diagonal overflow-hidden rounded-[18px] cursor-pointer w-full aspect-[4/5] relative transition-all duration-300 ${
        isSelected ? 'border-white border-[1.5px] shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border border-white/6'
      }`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 180, 
        delay: Math.min(index * 0.06, 0.4) 
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Image Display */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover rounded-[18px]"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
          }}
        />
      )}

      {/* Floating Category Tag Icon Indicator */}
      <div className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-[#000000]/65 border border-white/20 z-10 flex items-center justify-center shadow-md">
        {getCategoryIcon(item.category)}
      </div>

      {/* Floating Select Indicator (if selection mode is active) */}
      {isSelectionMode ? (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className={`p-1 rounded-full bg-black/65 border border-white/20 flex items-center justify-center ${
            isSelected ? 'bg-emerald-950/20 border-emerald-500/30' : ''
          }`}>
            {isSelected ? (
              <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
            ) : (
              <Circle className="w-3 h-3 text-gray-500" strokeWidth={2.0} />
            )}
          </div>
        </div>
      ) : item.sourceUrl ? (
        /* Floating Domain Favicon indicator if URL exists and not in selection mode */
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="p-1 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <img 
              src={item.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${item.sourceUrl.replace(/^https?:\/\//i, '').split('/')[0]}`}
              alt="favicon"
              className="w-3 h-3 object-contain rounded"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
              }}
            />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
