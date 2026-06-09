import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link2, CheckCircle, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { db } from '../database';
import { StashItem } from '../types';

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
    url: 'https://images.unsplash.com/photo-1496041870309-6748e0b0e525?auto=format&fit=crop&q=80&w=600',
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
  const [ingestType, setIngestType] = useState<'link' | 'image'>('link');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pipeline Visual States
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  // Handles consecutive 4-step pipeline simulation with actual API interaction
  const executePipeline = async (
    type: 'link' | 'image', 
    sourceData: { url?: string; imageBase64?: string; title?: string; desc?: string }
  ) => {
    setLoading(true);
    setError(null);
    setPipelineStep(0);
    setPipelineProgress('OS INTENT CAPTURED (15ms)... Saving temporary cache envelope');

    await new Promise(r => setTimeout(r, 400));
    setPipelineStep(1);
    setPipelineProgress('DATABASE ENTRY STAGED (35ms)... status="processing" shimmering placeholder added');

    // Create immediate temporary processing item to trigger Grid Shimmer
    const tempItem = db.add({
      type,
      title: type === 'link' ? (sourceData.url || 'Web Node').replace(/^https?:\/\//i, '').split('/')[0] : (sourceData.title || 'Screen Capture'),
      description: type === 'link' ? 'Intercepting metadata coordinates...' : 'Engaging Gemini OCR scan...',
      imageUrl: type === 'link' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600' : sourceData.imageBase64,
      sourceUrl: sourceData.url,
      status: 'processing',
      category: type === 'link' ? 'Articles' : 'Design'
    });
    
    // Notify home view to re-render grid instantly with the shimmering entry
    onSuccess(tempItem);

    try {
      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(2);
      
      let finalTitle = tempItem.title;
      let finalDesc = tempItem.description || '';
      let finalImg = tempItem.imageUrl || '';
      let finalSource = tempItem.sourceUrl || '';
      let finalFavicon = '';
      let finalOcr = '';
      let ocrData: any = null;

      if (type === 'link') {
        setPipelineProgress('METADATA HYDRATION PARSER (400ms)... Gathering OpenGraph tags from site');
        
        // Fetch metadata via Express proxy
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(sourceData.url || '')}`);
        if (!res.ok) throw new Error('Unresponsive domain node.');
        const meta = await res.json();

        finalTitle = meta.title || finalTitle;
        finalDesc = meta.description || finalDesc;
        finalImg = meta.imageUrl || finalImg;
        finalSource = meta.sourceUrl || finalSource;
        finalFavicon = meta.favicon || '';
      } else {
        setPipelineProgress('ON-DEVICE HYBRID OCR PIPELINE (1200ms)... invoker invoking local Neural Core');
        
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
        
        finalOcr = ocrData.text || '';
        finalTitle = sourceData.title || 'Extracted Screenshot';
        finalDesc = ocrData.summary || (finalOcr ? finalOcr.substring(0, 100) + '...' : 'Extracted screenshot visual elements');
        finalImg = ocrData.imageUrl || sourceData.imageBase64 || '';
      }

      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(3);
      setPipelineProgress('FTS5 TOKEN INDEXING (220ms)... tokenizing keywords, status="ready" on-device sync completed');

      // Smart auto-categorize using indexed dictionary rules
      let autoCategory: 'Shopping' | 'Recipes' | 'Travel' | 'Articles' | 'Design' = 'Design';
      
      if (ocrData?.category && ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'].includes(ocrData.category)) {
        autoCategory = ocrData.category;
      } else {
        const combinedText = `${finalTitle} ${finalDesc} ${finalOcr}`.toLowerCase();
        if (combinedText.includes('poached') || combinedText.includes('egg') || combinedText.includes('brunch') || combinedText.includes('recipe') || combinedText.includes('food')) {
          autoCategory = 'Recipes';
        } else if (combinedText.includes('mount') || combinedText.includes('valley') || combinedText.includes('travel') || combinedText.includes('trip') || combinedText.includes('hiking')) {
          autoCategory = 'Travel';
        } else if (combinedText.includes('cotton') || combinedText.includes('cotton') || combinedText.includes('shirting') || combinedText.includes('wear') || combinedText.includes('price') || combinedText.includes('buy') || combinedText.includes('watch') || combinedText.includes('luxur')) {
          autoCategory = 'Shopping';
        } else if (combinedText.includes('theory') || combinedText.includes('sovereignty') || combinedText.includes('read') || combinedText.includes('article')) {
          autoCategory = 'Articles';
        } else if (type === 'image') {
          autoCategory = 'Design';
        }
      }

      // Update the indexed temporary asset in localStorage database
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
      // Clean up failed staging
      onSuccess({} as any);
    } finally {
      setLoading(false);
    }
  };

  // Process Link Submit
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    executePipeline('link', { url: url.trim() });
  };

  // Convert files to base64
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

  // Drag and drop mechanics
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

  // Run Preset Screenshot Simulation
  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setSelectedImageFile(new File([], 'preset.png', { type: 'image/png' }));
    setSelectedImageBase64(preset.url);
    executePipeline('image', {
      imageBase64: preset.url,
      title: preset.title,
      desc: preset.description
    });
  };

  return (
    <div id="add-stash-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        id="add-stash-modal-box"
        className="glass-panel-base glass-border-diagonal w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-black/40 text-white"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="font-display font-medium text-lg tracking-tight text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5 animate-pulse" />
            INGESTION CHANNEL
          </h2>
          <button 
            id="close-stash-modal"
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors cursor-pointer outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main simulation selection toggles */}
          {!pipelineStep && (
            <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
              <button
                id="type-link-toggle"
                onClick={() => setIngestType('link')}
                className={`flex-1 py-1.5 rounded-full font-display text-xs tracking-wider uppercase font-medium transition-all ${
                  ingestType === 'link' 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Paste URL Connection</span>
                </div>
              </button>
              <button
                id="type-image-toggle"
                onClick={() => setIngestType('image')}
                className={`flex-1 py-1.5 rounded-full font-display text-xs tracking-wider uppercase font-medium transition-all ${
                  ingestType === 'image' 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Scan Screenshot</span>
                </div>
              </button>
            </div>
          )}

          {/* Form and pipeline areas */}
          {error && (
            <div id="pipeline-error" className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-300 text-xs">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {pipelineStep !== null ? (
              /* High-fidelity 4-step pipeline progress indicator */
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                id="pipeline-progress"
                className="space-y-6 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">EXECUTION LIFECYCLE PIPELINE</span>
                  <div className="flex items-center space-x-1 text-xs text-white">
                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                    <span className="font-mono text-xs">{pipelineStep + 1}/4</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    '1. INTENT CAPTURED & TEMP STAGED',
                    '2. LOCAL SECTOR INSTANT RE-RENDER',
                    '3. CLIENT CLOUD ANALYSIS/OCR OCR',
                    '4. INDEX TO ENCRYPTED FTS DATABASE'
                  ].map((stepLabel, idx) => {
                    const isDone = pipelineStep > idx;
                    const isActive = pipelineStep === idx;
                    return (
                      <div 
                        key={idx} 
                        id={`pipeline-step-${idx}`}
                        className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all duration-300 ${
                          isDone 
                            ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400' 
                            : isActive 
                            ? 'bg-white/[0.05] border-white/20 text-white scale-[1.01] shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                            : 'bg-transparent border-transparent text-[#8A8A93]'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 shrink-0 animate-spin text-white" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#8A8A93] flex items-center justify-center text-[9px] font-mono">
                            {idx + 1}
                          </div>
                        )}
                        <span className="font-mono text-xs tracking-tight font-medium">{stepLabel}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center font-mono text-[10px] text-[#8A8A93]">
                  {pipelineProgress}
                </div>
              </motion.div>
            ) : ingestType === 'link' ? (
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
                  <label htmlFor="url-input" className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">SOURCE ADDRESS LINK</label>
                  <div className="relative">
                    <input
                      id="url-input"
                      type="text"
                      placeholder="e.g. bonappetit.com/recipe or dribbble.com/shots"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-white/30 text-white font-mono placeholder:text-gray-600 transition-all"
                      required
                    />
                    <button
                      type="submit"
                      id="link-submit-btn"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white text-black hover:bg-gray-200 active:scale-95 transition-all outline-none cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans leading-normal">
                    Dropping are simulated silently in the background. The server acts as a CORS scraper to gather high-contrast image pointers and structural tags instantly.
                  </p>
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
                className="space-y-5"
              >
                {/* Drag and Drop Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  id="drop-target-area"
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-white bg-white/[0.05]' 
                      : selectedImageBase64 
                      ? 'border-emerald-500/50 bg-emerald-950/5' 
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
                      <span className="text-xs text-emerald-400 flex items-center justify-center font-mono">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Capture Ready ({selectedImageFile ? (selectedImageFile.size/1024).toFixed(0) : 'Preset'} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center text-gray-400">
                      <div className="mx-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-white">Drag screenshot here or click to browse</p>
                      <p className="text-[11px] text-gray-500 font-sans">Supports Apple Vision or Gemini OCR scanning</p>
                    </div>
                  )}
                </div>

                {/* Preset Fast Selector (Highly Interactive) */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">AESTHETIC TESTING INBOX PRESETS</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        id={`screenshot-preset-${idx}`}
                        disabled={loading}
                        onClick={() => handlePresetSelect(p)}
                        className="text-left group glass-panel-interactive glass-border-diagonal p-1.5 rounded-xl block cursor-pointer"
                      >
                        <div className="relative overflow-hidden rounded-lg aspect-video mb-1.5">
                          <img 
                            src={p.url} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                        </div>
                        <span className="block text-[10px] font-sans font-medium text-white truncate">{p.name}</span>
                        <span className="block text-[8px] font-mono text-gray-500 truncate uppercase mt-0.5">{p.keyword}</span>
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
                    ENGAGE HYBRID OCR ENGINE
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
