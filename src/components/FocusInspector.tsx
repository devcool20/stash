import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ExternalLink, Trash2, FolderSync, Share2, ZoomIn, ChevronUp, ChevronDown, Check, Pencil } from 'lucide-react';
import { StashItem } from '../types';

interface FocusInspectorProps {
  item: StashItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRegroup: (id: string, newCategory: 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design') => void;
  onUpdate: (id: string, updates: Partial<StashItem>) => void;
}

export default function FocusInspector({ item, onClose, onDelete, onRegroup, onUpdate }: FocusInspectorProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRegroupMenu, setShowRegroupMenu] = useState(false);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescVal, setEditDescVal] = useState(item?.description || '');
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [editOcrVal, setEditOcrVal] = useState(item?.extractedText || '');

  // Sync edits when item changes
  useEffect(() => {
    setEditDescVal(item?.description || '');
    setIsEditingDesc(false);
    setEditOcrVal(item?.extractedText || '');
    setIsEditingOcr(false);
  }, [item?.id, item?.description, item?.extractedText]);

  if (!item) return null;

  // Handle clipboard copy
  const handleCopy = () => {
    try {
      const textToCopy = item.extractedText || '';
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    try {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.sourceUrl || window.location.href
      });
    } catch (_) {
      alert(`Simulated Share: Link copied for "${item.title}"`);
    }
  };

  const categories: Array<'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design'> = [
    'Shopping', 'Recipes', 'Travel', 'Articles', 'Design'
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        id="inspector-overlay"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[12px] overflow-hidden"
      >
        {/* Click outside to close */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 35, stiffness: 320, mass: 0.5 }}
          id="detail-inspector-sheet"
          // bg-black/50 changed to bg-[#0a0a0a]/95 to match rgba(10, 10, 10, 0.95)
          className="glass-panel-base glass-border-diagonal w-full max-w-xl h-[88%] rounded-t-[32px] overflow-hidden bg-[#0a0a0a]/95 flex flex-col z-10 border border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]"
        >
          {/* Grab Handle */}
          <div className="w-full flex justify-center py-3 shrink-0">
            <div className="w-12 h-1 bg-white/10 rounded-full" />
          </div>

          {/* Scrollable sheet content */}
          <div className="flex-1 overflow-y-auto px-6 pb-28 space-y-7">
            {/* Header Title Bar */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-semibold text-2xl tracking-tight text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-[#8A8A93] italic mt-2.5 uppercase font-mono tracking-wider">
                  VAULT • {item.category.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <button 
                id="close-inspector-btn"
                onClick={onClose} 
                className="p-1 px-4 border border-white/5 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer outline-none font-display font-bold text-[10px] tracking-widest active:scale-95"
              >
                CLOSE
              </button>
            </div>

            {/* Visual Section: Hero Zoomable Preview - Sizing fixed to contain-fit */}
            <div 
              id="media-viewer" 
              onClick={() => setShowFullScreen(true)}
              className="relative group rounded-[18px] overflow-hidden glass-panel-base border border-white/10 bg-black/45 h-[400px] flex items-center justify-center cursor-pointer shadow-xl"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                id="hero-inspector-img"
                className="w-full h-full object-contain pointer-events-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
                }}
              />
              {/* Float HUD */}
              <div
                className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.14] text-white flex items-center space-x-1 font-sans text-[8.5px] font-bold tracking-widest pointer-events-none select-none uppercase shadow-[0_0_12px_rgba(168,85,247,0.45)]"
              >
                <ZoomIn className="w-3 h-3 text-white mr-0.5" />
                <span>TAP TO EXPAND</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">ABOUT THIS IMAGE</span>
                {!isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="p-1 rounded bg-white/5 border border-white/5 text-[#8A8A93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={editDescVal}
                    onChange={(e) => setEditDescVal(e.target.value)}
                    placeholder="Add description..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-650 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all font-sans resize-none h-24"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsEditingDesc(false);
                        setEditDescVal(item.description || '');
                      }}
                      className="px-3 py-1.5 rounded-full border border-white/10 bg-transparent text-[#8A8A93] hover:text-white hover:bg-white/5 transition-all text-[10px] font-semibold uppercase tracking-wider cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(item.id, { description: editDescVal });
                        setIsEditingDesc(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer outline-none"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`glass-panel-base rounded-xl bg-black/40 border border-white/5 p-4 text-xs leading-relaxed ${!item.description ? 'text-[#8A8A93]/65 italic' : 'text-white'}`}>
                  {item.description || 'No description. Tap edit icon to add details.'}
                </div>
              )}
            </div>

            {/* Source Link indicator */}
            {item.sourceUrl && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold block">ORIGINAL WEBSITE LINK</span>
                <div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    id="origin-source-link"
                    className="inline-flex items-center space-x-2.5 py-2.5 px-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-white font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    <img 
                      src={item.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${item.sourceUrl.replace(/^https?:\/\//i, '').split('/')[0]}`} 
                      alt="Host icon" 
                      className="w-3.5 h-3.5 rounded shrink-0 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2500/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                      }}
                    />
                    <span className="truncate max-w-xs">{item.sourceUrl.replace(/^https?:\/\/(www\.)?/i, '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </a>
                </div>
              </div>
            )}

            {/* Extracted Text (OCR / OCR Mono Block) Accordion */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/5 py-1">
                <button
                  onClick={() => setIsOcrOpen(!isOcrOpen)}
                  id="toggle-ocr-accordion"
                  className="flex-1 flex items-center justify-between py-1 cursor-pointer outline-none"
                >
                  <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">SCANNED TEXT IN IMAGE</span>
                  {isOcrOpen ? <ChevronUp className="w-4 h-4 text-[#8A8A93] mr-2" /> : <ChevronDown className="w-4 h-4 text-[#8A8A93] mr-2" />}
                </button>
                {isOcrOpen && !isEditingOcr && (
                  <button
                    onClick={() => setIsEditingOcr(true)}
                    className="p-1 rounded bg-white/5 border border-white/5 text-[#8A8A93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isOcrOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {isEditingOcr ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editOcrVal}
                          onChange={(e) => setEditOcrVal(e.target.value)}
                          placeholder="Add scanned text..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-650 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all font-mono resize-none h-32"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setIsEditingOcr(false);
                              setEditOcrVal(item.extractedText || '');
                            }}
                            className="px-3 py-1.5 rounded-full border border-white/10 bg-transparent text-[#8A8A93] hover:text-white hover:bg-white/5 transition-all text-[10px] font-semibold uppercase tracking-wider cursor-pointer outline-none"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              onUpdate(item.id, { extractedText: editOcrVal });
                              setIsEditingOcr(false);
                            }}
                            className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer outline-none"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div id="ocr-monospace" className="glass-panel-base rounded-xl bg-black/40 border border-white/5 p-4 relative space-y-4">
                        <p className={`font-mono text-[10.5px] leading-relaxed tracking-wide select-text whitespace-pre-wrap max-h-48 overflow-y-auto pr-1 ${!item.extractedText ? 'text-[#8A8A93]/65 italic' : 'text-white'}`}>
                          {item.extractedText || 'No text scanned in this image. Tap edit icon to add text.'}
                        </p>

                        {item.extractedText ? (
                          <button
                            onClick={handleCopy}
                            id="ocr-copy-all"
                            className="inline-flex items-center space-x-1.5 py-1.5 px-3 bg-white/12 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 outline-none active:scale-95 transition-all cursor-pointer font-display text-[9.5px] tracking-wider select-none"
                          >
                            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'COPIED' : 'COPY ALL'}</span>
                          </button>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating Actions Strip Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/80 border-t border-white/5 backdrop-blur-md flex items-center justify-between space-x-3 z-20">
            <button
              onClick={() => onDelete(item.id)}
              id="delete-stash-btn"
              className="flex-1 py-3 px-4 rounded-full border border-white/10 hover:bg-white/5 text-[#EF4444] font-display uppercase tracking-widest text-[9.5px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            {/* Regrouping Dropdown trigger */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowRegroupMenu(!showRegroupMenu)}
                id="regroup-dropdown-trigger"
                className="w-full py-3 px-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9.5px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
              >
                <FolderSync className="w-3.5 h-3.5 text-white" />
                <span>Move</span>
              </button>

              <AnimatePresence>
                {showRegroupMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    id="regroup-menu-dropdown"
                    className="absolute bottom-full left-0 right-0 mb-3 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 z-30"
                  >
                    <span className="block text-[8px] tracking-widest font-display text-gray-500 uppercase px-3 py-1.5 font-bold">SELECT CATEGORY</span>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onRegroup(item.id, cat);
                          setShowRegroupMenu(false);
                        }}
                        id={`regroup-to-${cat}`}
                        className={`w-full text-left font-display text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer font-bold ${
                          item.category === cat 
                            ? 'bg-white text-black' 
                            : 'text-[#8A8A93] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleShare}
              id="share-stash-btn"
              className="flex-1 py-3 px-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9.5px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Full-Screen Zoomable Image Viewer Modal Overlay */}
      <AnimatePresence>
        {showFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none"
          >
            {/* Close button */}
            <button
              onClick={() => setShowFullScreen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-all outline-none cursor-pointer z-50 active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Click on background to close */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setShowFullScreen(false)} />

            {/* Image display */}
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto z-10 pointer-events-none">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-w-full max-h-full object-contain select-none pointer-events-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
