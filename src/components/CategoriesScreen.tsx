import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, Circle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { StashItem } from '../types';

interface CategoriesScreenProps {
  pendingItems: StashItem[];
  onProcessBatch: (ids: string[]) => Promise<void>;
}

export default function CategoriesScreen({
  pendingItems,
  onProcessBatch,
}: CategoriesScreenProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pendingItems.length]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === pendingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map((i) => i.id)));
    }
  };

  const handleProcess = async () => {
    if (selectedIds.size === 0) return;
    setProcessing(true);
    await onProcessBatch(Array.from(selectedIds));
    setSelectedIds(new Set());
    setProcessing(false);
  };

  const allSelected = pendingItems.length > 0 && selectedIds.size === pendingItems.length;

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-0.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/12 border border-white/25 flex items-center justify-center">
            <Inbox className="text-white" size={14} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-white leading-none">Inbox</h2>
            <span className="text-[9px] text-[#8A8A93] font-sans mt-1 block">
              {pendingItems.length} pending capture{pendingItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {pendingItems.length > 0 && (
          <button
            onClick={toggleAll}
            className="px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-[9px] font-mono font-bold tracking-wider text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {allSelected ? 'DESELECT' : 'SELECT ALL'}
          </button>
        )}
      </div>

      {/* Items List */}
      {pendingItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
            <Sparkles className="text-gray-500" size={20} strokeWidth={1.6} />
          </div>
          <h3 className="font-display font-medium text-xs text-white">Inbox is empty</h3>
          <p className="text-[10px] text-gray-500 font-sans px-8 leading-normal">
            Captured screenshots from the S overlay appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-0.5">
          {pendingItems.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 p-3 bg-white/[0.06] border rounded-2xl cursor-pointer hover:bg-white/[0.08] active:opacity-95 transition-all select-none ${
                    isSelected ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/6'
                  }`}
                >
                  <div className="flex items-center justify-center shrink-0">
                    {isSelected ? (
                      <CheckCircle className="text-emerald-400" size={18} strokeWidth={2.4} />
                    ) : (
                      <Circle className="text-gray-550" size={18} strokeWidth={1.5} />
                    )}
                  </div>

                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg bg-neutral-900 object-cover shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <h4 className="text-[11px] font-bold text-white truncate">{item.title}</h4>
                    <p className="text-[9px] text-[#8A8A93] line-clamp-2 leading-normal">
                      {item.description || 'No description'}
                    </p>
                    <span className="text-[8px] font-mono text-gray-500 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="px-1.5 py-0.5 rounded border border-emerald-400/20 bg-emerald-400/10 shrink-0">
                    <span className="text-[7px] font-mono font-bold tracking-wider text-emerald-400">RAW</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div className="h-28" />
        </div>
      )}

      {/* Floating Action Button */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 z-30"
          >
            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-white/12 border border-white/25 text-[#FFFFFF] hover:bg-white/20 active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.8)] font-bold text-xs"
            >
              {processing ? (
                <Loader2 className="animate-spin text-white" size={14} strokeWidth={2.4} />
              ) : (
                <Sparkles className="text-white" size={14} strokeWidth={2.4} />
              )}
              <span>
                {processing
                  ? 'Processing...'
                  : `Process ${selectedIds.size} capture${selectedIds.size !== 1 ? 's' : ''}`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
