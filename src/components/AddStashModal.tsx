import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link2, CheckCircle, Search, Image as ImageIcon } from 'lucide-react';
import { db } from '../database';
import { StashItem } from '../types';
import { MultiStepLoader } from './ui/multi-step-loader';

const loadingStates = [
  { text: 'Reading your screenshot' },
  { text: 'Finding links and details' },
  { text: 'Extracting text and highlights' },
  { text: 'Analyzing what is inside' },
  { text: 'Naming and summarizing' },
  { text: 'Choosing the best category' },
  { text: 'Saving safely to your stash' }
];

interface AddStashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: StashItem) => void;
}

// Aesthetic Screenshot Presets for frictionless testing
const PRESETS = [
  {
    name: 'Minimal Living Room',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    title: 'Soma Interior Layout',
    description: 'Clean mid-century modular shelving screenshot',
    keyword: 'Design'
  },
  {
    name: 'Artisanal Brunch Table',
    url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=600',
    title: 'Slow Breakfast Spread',
    description: 'Poached avocado eggs on sourdough flatlay recipe',
    keyword: 'Recipes'
  },
  {
    name: 'Yosemite Misty Valley',
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=600',
    title: 'Yosemite Travel Card',
    description: 'Breathtaking peaks and fog trail hiking guide map screenshot',
    keyword: 'Travel'
  }
];

export default function AddStashModal({ isOpen, onClose, onSuccess }: AddStashModalProps) {
  // Screenshot mode is the primary default tab on mobile/web port
  const [ingestType, setIngestType] = useState<'link' | 'image'>('image');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pipeline Visual States
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const executePipeline = async (
    type: 'link' | 'image', 
    sourceData: { url?: string; imageBase64?: string; title?: string; desc?: string }
  ) => {
    setLoading(true);
    setError(null);
    setPipelineStep(0);

    await new Promise(r => setTimeout(r, 450));
    setPipelineStep(1);

    // Create immediate temporary processing item to trigger Grid Shimmer
    const tempItem = db.addPending({
      type,
      title: type === 'link' 
        ? (sourceData.url || 'Web Node').replace(/^https?:\/\//i, '').split('/')[0] 
        : (sourceData.title || 'Screen Capture'),
      description: type === 'link' 
        ? 'Intercepting metadata coordinates...' 
        : 'Engaging Gemini OCR scan...',
      imageUrl: type === 'link' 
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600' 
        : sourceData.imageBase64,
      category: type === 'link' ? 'Articles' : 'Design'
    });
    
    // Notify home view to re-render grid instantly with the shimmering entry
    onSuccess(tempItem);

    try {
      await new Promise(r => setTimeout(r, 300));
      setPipelineStep(2);
      
      let finalTitle = tempItem.title;
      let finalDesc = tempItem.description || '';
      let finalImg = tempItem.imageUrl || '';
      let finalSource = tempItem.sourceUrl || '';
      let finalFavicon = '';
      let finalOcr = '';
      let finalCategory = '';
      let ocrData: any = null;

      if (type === 'link') {
        setPipelineStep(3);
        let resolvedUrl = sourceData.url || '';
        if (!/^https?:\/\//i.test(resolvedUrl)) {
          resolvedUrl = 'https://' + resolvedUrl;
        }
        
        try {
          const res = await fetch(`/api/metadata?url=${encodeURIComponent(resolvedUrl)}`);
          if (!res.ok) throw new Error('Unresponsive domain node.');
          const meta = await res.json();

          setPipelineStep(4);
          finalTitle = meta.title || 'Web Note';
          finalDesc = meta.description || '';
          finalImg = meta.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
          finalSource = meta.sourceUrl || resolvedUrl;
          
          let domain = 'stashed-node.net';
          try { domain = new URL(finalSource).hostname; } catch {}
          finalFavicon = meta.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) {
          let domain = 'stashed-node.net';
          try { domain = new URL(resolvedUrl).hostname; } catch {}
          setPipelineStep(4);
          finalTitle = domain.replace('www.', '').split('.')[0].toUpperCase() + ' Link Note';
          finalDesc = `Ingested from ${domain} (Offline Fallback)`;
          finalImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
          finalSource = resolvedUrl;
          finalFavicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        }
      } else {
        setPipelineStep(3);
        // Send base64 to Gemini OCR API
        const ocrPayload = {
          base64: sourceData.imageBase64,
          mimeType: selectedImageFile?.type || 'image/png'
        };

        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ocrPayload)
        });
        
        if (!res.ok) throw new Error('OCR core timeout.');
        ocrData = await res.json();
        
        setPipelineStep(4);
        finalOcr = ocrData.text || '';
        finalTitle = sourceData.title || 'Extracted Screenshot';
        finalDesc = ocrData.description || ocrData.summary || 'Extracted screenshot visual elements';
        finalImg = sourceData.imageBase64 || '';
        finalCategory = ocrData.category || '';
      }

      await new Promise(r => setTimeout(r, 300));
      setPipelineStep(5);

      // Smart auto-categorize using indexed dictionary rules
      let autoCategory = finalCategory && finalCategory.trim()
        ? finalCategory.trim()
        : autoCategorize(finalOcr || finalDesc || '', finalTitle, finalSource);

      setPipelineStep(6);
      // Update the indexed temporary asset in database
      const readyItem = db.update(tempItem.id, {
        title: finalTitle,
        description: finalDesc,
        imageUrl: finalImg,
        sourceUrl: finalSource,
        favicon: finalFavicon,
        category: autoCategory,
        extractedText: finalOcr || `METADATA HYDRATION: Link established with ${finalSource}. Saved tags: ${finalTitle}.`,
        summary: ocrData?.summary || '',
        status: 'ready'
      });

      await new Promise(r => setTimeout(r, 400));
      
      if (readyItem) {
        onSuccess(readyItem);
      }
      
      // Reset staging variables
      setUrl('');
      setSelectedImageBase64(null);
      setSelectedImageFile(null);
      setPipelineStep(null);
      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Pipeline failed during processing.');
      db.delete(tempItem.id);
      onSuccess({} as any);
    } finally {
      setLoading(false);
      setPipelineStep(null);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    executePipeline('link', { url: url.trim() });
  };

  const processImageFile = (file: File) => {
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageSubmit = () => {
    if (!selectedImageBase64) return;
    executePipeline('image', { 
      imageBase64: selectedImageBase64,
      title: selectedImageFile ? selectedImageFile.name.split('.')[0] : 'Scanned Screenshot'
    });
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setSelectedImageFile(new File([], 'preset.png', { type: 'image/png' }));
    setSelectedImageBase64(preset.url);
    executePipeline('image', {
      imageBase64: preset.url,
      title: preset.title,
      desc: preset.description
    });
  };

  function autoCategorize(text: string, title: string, url?: string): string {
    const combined = `${text} ${title} ${url || ''}`.toLowerCase();
    const dict: Record<string, string[]> = {
      Shopping: ['buy','price','shop','sneaker','shoe','dress','watch','sale','amazon','etsy','linen','clothing'],
      Recipes: ['cook','ingredient','food','recipe','bake','kitchen','eat','restaurant','brunch','eggs','benedict'],
      Travel: ['trip','flight','travel','hotel','mountain','vacation','beach','booking','airbnb','fuji','japan'],
      Articles: ['read','blog','news','medium','article','theory','essay','newsletter','cryptographic','sovereignty'],
      Design: ['design','gradient','ui','ux','art','portfolio','3d','creative','aesthetic','furniture','interior','chair'],
    };

    let best = 'Design';
    let max = 0;
    for (const [cat, keywords] of Object.entries(dict)) {
      const weight = keywords.reduce((sum, kw) => sum + (combined.includes(kw) ? 1 : 0), 0);
      if (weight > max) { max = weight; best = cat; }
    }
    return best;
  }

  return (
    <>
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        value={pipelineStep !== null ? pipelineStep : 0}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        id="add-stash-overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md"
      >
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: '100%' }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: '100%' }}
          transition={{ type: 'spring', damping: 35, stiffness: 320, mass: 0.5 }}
          id="add-stash-modal-box"
          className="glass-panel-base glass-border-diagonal w-full max-w-lg overflow-hidden rounded-t-[32px] sm:rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-[#0a0a0a]/95 text-white z-10 border border-white/10"
        >
          {/* Grab Handle */}
          <div className="w-full flex justify-center py-3 shrink-0">
            <div className="w-12 h-1 bg-white/10 rounded-full" />
          </div>

          {/* Header bar */}
          <div className="flex items-center justify-between px-6 pb-5 border-b border-white/5 bg-transparent">
            <div className="text-left">
              <h2 className="font-display font-bold text-lg tracking-tight text-white leading-none">
                Add to Stash
              </h2>
              <span className="block text-[10px] text-[#8A8A93] font-sans mt-1.5 leading-none">
                Import a link or screenshot into your vault
              </span>
            </div>
            <button 
              id="close-stash-modal"
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer outline-none active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Redesigned Glassy Segmented Tab Control */}
            <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] relative h-10">
              <button
                type="button"
                id="type-image-toggle"
                onClick={() => setIngestType('image')}
                className={`flex-1 rounded-lg text-[10px] font-bold tracking-wider font-mono transition-colors relative z-10 ${
                  ingestType === 'image' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {ingestType === 'image' && (
                  <motion.div
                    layoutId="ingest-tab-pill"
                    className="absolute inset-0 bg-white rounded-lg -z-10 shadow-md"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center justify-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>SCREENSHOT</span>
                </div>
              </button>

              <button
                type="button"
                id="type-link-toggle"
                onClick={() => setIngestType('link')}
                className={`flex-1 rounded-lg text-[10px] font-bold tracking-wider font-mono transition-colors relative z-10 ${
                  ingestType === 'link' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {ingestType === 'link' && (
                  <motion.div
                    layoutId="ingest-tab-pill"
                    className="absolute inset-0 bg-white rounded-lg -z-10 shadow-md"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center justify-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>WEB LINK</span>
                </div>
              </button>
            </div>

            {/* Form and pipeline areas */}
            {error && (
              <div id="pipeline-error" className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-300 text-xs">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {ingestType === 'link' ? (
                /* Link Submission Form */
                <motion.form
                  key="link-form"
                  onSubmit={handleLinkSubmit}
                  id="link-ingest-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="url-input" className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold block">SOURCE ADDRESS LINK</label>
                    <div className="relative">
                      <input
                        id="url-input"
                        type="text"
                        placeholder="e.g. bonappetit.com/recipe or dribbble.com/shots"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs outline-none focus:border-white/30 text-white font-mono placeholder:text-gray-600 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        id="link-submit-btn"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white text-black hover:bg-gray-200 active:scale-95 transition-all outline-none cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.form>
              ) : (
                /* Image Upload and Preset Scanner */
                <motion.div
                  key="image-upload"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  id="image-ingest-area"
                  className="space-y-4"
                >
                  {/* Drag and Drop Box */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    id="drop-target-area"
                    className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      dragActive 
                        ? 'border-white bg-white/[0.05]' 
                        : selectedImageBase64 
                        ? 'border-white/30 bg-white/5' 
                        : 'border-white/10 hover:border-white/30 bg-[#000000]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedImageBase64 ? (
                      <div className="space-y-3 flex flex-col items-center">
                        <img 
                          src={selectedImageBase64} 
                          alt="Preview" 
                          className="h-28 object-contain rounded-lg border border-white/10"
                        />
                        <span className="text-xs text-white flex items-center justify-center font-mono">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Capture Ready ({selectedImageFile ? (selectedImageFile.size/1024).toFixed(0) : 'Preset'} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center text-gray-450">
                        <div className="mx-auto w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs font-bold text-white">Choose a screenshot</p>
                        <p className="text-[10px] text-gray-500 font-sans leading-normal">
                          Cloud OCR will extract text automatically
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Preset Fast Selector (Highly Interactive) */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold block">AESTHETIC TESTING INBOX PRESETS</span>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          id={`screenshot-preset-${idx}`}
                          disabled={loading}
                          onClick={() => handlePresetSelect(p)}
                          className="text-left group glass-panel-interactive glass-border-diagonal p-1.5 rounded-xl block cursor-pointer bg-white/[0.02] border border-white/5"
                        >
                          <div className="relative overflow-hidden rounded-lg aspect-video mb-1.5">
                            <img 
                              src={p.url} 
                              alt={p.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                          </div>
                          <span className="block text-[10px] font-sans font-bold text-white truncate leading-none">{p.name}</span>
                          <span className="block text-[8px] font-mono text-gray-500 truncate uppercase mt-1 leading-none">{p.keyword}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedImageBase64 && (
                    <button
                      onClick={handleImageSubmit}
                      disabled={loading}
                      id="trigger-ocr-submit"
                      className="w-full font-display uppercase tracking-widest text-[#000000] font-semibold text-xs py-3 rounded-full bg-[#FFFFFF] shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-97 cursor-pointer text-center select-none"
                    >
                      Process image
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
