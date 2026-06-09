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
  const [isZoomed, setIsZoomed] = useState(false);
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
        transition={{ type: 'spring', damping: 28, stiffness: 180, mass: 0.8 }}
        id="detail-inspector-sheet"
        className="glass-panel-base glass-border-diagonal w-full max-w-xl h-[88%] rounded-t-[32px] overflow-hidden bg-black/50 backdrop-blur-[35px] flex flex-col z-10"
      >
        {/* Grab Handle */}
        <div className="w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Scrollable sheet content */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
          {/* Header Title Bar */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-semibold text-2xl tracking-tight text-white leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-[#8A8A93] italic mt-1 uppercase font-mono tracking-wider">
                VAULT • {item.category} • {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <button 
              id="close-inspector-btn"
              onClick={onClose} 
              className="p-1 px-3 border border-white/5 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer outline-none font-display font-medium text-xs tracking-wider"
            >
              CLOSE
            </button>
          </div>

          {/* Visual Section: Hero Zoomable Preview */}
          <div id="media-viewer" className="relative group rounded-2xl overflow-hidden glass-panel-base border border-white/10 bg-black/20 aspect-video flex items-center justify-center">
            <motion.img
              src={item.imageUrl}
              alt={item.title}
              onClick={() => setIsZoomed(!isZoomed)}
              id="hero-inspector-img"
              className={`w-full h-full object-cover transition-transform duration-300 pointer-events-auto cursor-zoom-in ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
              }`}
            />
            {/* Ambient Dark Overlay inside card */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Float HUD */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              id="zoom-lens-btn"
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 transition-all text-white flex items-center space-x-1.5 font-display text-[9px] uppercase tracking-widest cursor-pointer select-none"
            >
              <ZoomIn className="w-3 h-3 text-white" />
              <span>{isZoomed ? 'ZOOM OUT' : 'PINCH TO ZOOM'}</span>
            </button>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">ABOUT THIS IMAGE</span>
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all font-sans resize-none h-24"
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
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">ORIGINAL WEBSITE LINK</span>
              <div>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  id="origin-source-link"
                  className="inline-flex items-center space-x-2 py-2 px-4 rounded-full bg-white/5 border border-white/8 hover:bg-white/10 text-white font-mono text-xs transition-colors cursor-pointer select-none"
                >
                  <img 
                    src={item.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${item.sourceUrl.replace(/^https?:\/\//i, '').split('/')[0]}`} 
                    alt="Host icon" 
                    className="w-3.5 h-3.5 rounded shrink-0 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                    }}
                  />
                  <span className="truncate max-w-xs">{item.sourceUrl.replace(/^https?:\/\/(www\.)?/i, '')}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Extracted Text (OCR / OCR Mono Block) Accordion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 py-1">
              <button
                onClick={() => setIsOcrOpen(!isOcrOpen)}
                id="toggle-ocr-accordion"
                className="flex-1 flex items-center justify-between py-1 cursor-pointer outline-none"
              >
                <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">SCANNED TEXT IN IMAGE</span>
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
                      <p className={`font-mono text-xs leading-relaxed tracking-wide select-text whitespace-pre-wrap max-h-48 overflow-y-auto pr-1 ${!item.extractedText ? 'text-[#8A8A93]/65 italic' : 'text-white'}`}>
                        {item.extractedText || 'No text scanned in this image. Tap edit icon to add text.'}
                      </p>

                      {item.extractedText ? (
                        <button
                          onClick={handleCopy}
                          id="ocr-copy-all"
                          className="inline-flex items-center space-x-1.5 py-1 px-3 mt-1.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 outline-none active:scale-95 transition-all cursor-pointer font-display text-[10px] select-none"
                        >
                          {copied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY ALL'}</span>
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
            className="flex-1 py-3 px-4 rounded-full border border-red-500/30 bg-red-950/10 hover:bg-red-950/30 text-red-400 font-display uppercase tracking-widest text-[9px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Regrouping Dropdown trigger */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowRegroupMenu(!showRegroupMenu)}
              id="regroup-dropdown-trigger"
              className="w-full py-3 px-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <FolderSync className="w-3.5 h-3.5 text-white animate-pulse" />
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
                  <span className="block text-[8px] tracking-widest font-display text-gray-500 uppercase px-3 py-1.5">SELECT CATEGORY</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onRegroup(item.id, cat);
                        setShowRegroupMenu(false);
                      }}
                      id={`regroup-to-${cat}`}
                      className={`w-full text-left font-display text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        item.category === cat 
                          ? 'bg-white text-black font-semibold' 
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
            className="flex-1 py-3 px-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
