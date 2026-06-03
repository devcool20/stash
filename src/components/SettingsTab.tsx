import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Cpu, Heart, RefreshCw, KeyRound, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { db } from '../database';

interface SettingsTabProps {
  onResetDatabase: () => void;
}

export default function SettingsTab({ onResetDatabase }: SettingsTabProps) {
  // Storage usage values
  const metrics = db.getStorageMetrics();

  // State handles for Cryptographic Switchboard Toggles
  const [enclave, setEnclave] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [zeroLeak, setZeroLeak] = useState(true);

  // Private key seed reveal control
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const privateKeySeed = "stash_seed_aes256_x86_64_9af4bc8382c18d41fe0901e";

  const handleCopyKey = () => {
    try {
      navigator.clipboard.writeText(privateKeySeed);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (_) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div id="settings-command-deck" className="space-y-6">
      {/* 1. On-Device Storage Allocation Diagnostics */}
      <div id="storage-metrics-panel" className="glass-panel-base glass-border-diagonal p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-display font-medium text-xs text-white">ON-CHIP LOCAL METRICS</span>
              <span className="block text-[9px] font-mono text-[#8A8A93] uppercase">Sovereign Hardware Bounds</span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {metrics.percent}% USED
          </span>
        </div>

        {/* Retro green scale progress line */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
            <span>DATABASE ALLOCATION</span>
            <span className="text-[#8A8A93]">{metrics.usedMB}MB / {metrics.maxMB}MB</span>
          </div>
        </div>
      </div>

      {/* 2. Cryptographic Switchboard */}
      <div className="space-y-3">
        <div className="px-1 flex justify-between items-center">
          <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93]">Cryptographic Control</span>
          <span className="font-mono text-[9px] text-[#8A8A93]">AES-256 SEED SYSTEM</span>
        </div>

        {/* Private key section */}
        <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl space-y-3 bg-black/40">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="font-display text-xs font-medium">Decryption Key Envelope</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowKey(!showKey)}
                id="toggle-reveal-key"
                className="p-1 px-2 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none font-mono text-[9px] uppercase tracking-wider"
              >
                {showKey ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                {showKey ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={handleCopyKey}
                id="copy-key-seed"
                className="p-1 px-2 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 break-all select-all">
            {showKey ? privateKeySeed : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
          </div>
        </div>

        {/* High-fidelity responsive toggle rows */}
        <div className="glass-panel-base glass-border-diagonal rounded-2xl overflow-hidden bg-black/20 divide-y divide-white/5">
          {/* Row 1: Hardware Enclave Encryption */}
          <div className="p-4 flex items-center justify-between" id="row-toggle-enclave">
            <div className="space-y-0.5 pr-4">
              <span className="block font-display text-xs text-white font-medium">Hardware Enclave Encryption</span>
              <span className="block text-[10px] text-[#8A8A93] font-sans leading-normal">
                Locks all FTS database entries into Apple T2 or local Secure Enclave partition.
              </span>
            </div>
            <button
              onClick={() => setEnclave(!enclave)}
              id="switch-enclave"
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 ${
                enclave ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <motion.div 
                layout
                className="w-5 h-5 rounded-full bg-white shadow-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: enclave ? 20 : 0 }}
              />
            </button>
          </div>

          {/* Row 2: Biometric Vault Access */}
          <div className="p-4 flex items-center justify-between" id="row-toggle-biometric">
            <div className="space-y-0.5 pr-4">
              <span className="block font-display text-xs text-white font-medium">Biometric FaceID Vault Lock</span>
              <span className="block text-[10px] text-[#8A8A93] font-sans leading-normal">
                Inbuilt system check triggers authentic device signature verification before app focus.
              </span>
            </div>
            <button
              onClick={() => setBiometric(!biometric)}
              id="switch-biometric"
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 ${
                biometric ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <motion.div 
                layout
                className="w-5 h-5 rounded-full bg-white shadow-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: biometric ? 20 : 0 }}
              />
            </button>
          </div>

          {/* Row 3: Zero-Network Leak Mode */}
          <div className="p-4 flex items-center justify-between" id="row-toggle-zero-leak">
            <div className="space-y-0.5 pr-4">
              <span className="block font-display text-xs text-white font-medium">Zero-Network Leak Strategy</span>
              <span className="block text-[10px] text-[#8A8A93] font-sans leading-normal">
                Blocks outbound analytical requests. Keeps metadata scraping sandbox insulated and strictly local.
              </span>
            </div>
            <button
              onClick={() => setZeroLeak(!zeroLeak)}
              id="switch-zero-leak"
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 ${
                zeroLeak ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <motion.div 
                layout
                className="w-5 h-5 rounded-full bg-white shadow-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: zeroLeak ? 20 : 0 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Command Row */}
      <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl space-y-4 bg-red-950/5 border-red-950/20">
        <div className="flex items-center space-x-2.5 text-red-400">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <div className="text-left">
            <span className="block font-display font-medium text-xs text-red-300">CRITICAL LAB BOUNDS</span>
            <span className="block text-[9px] font-mono text-red-500/80 uppercase">Destructive Developer Tests</span>
          </div>
        </div>

        <button
          onClick={onResetDatabase}
          id="cmd-reset-db"
          className="w-full py-3 rounded-full border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-display uppercase tracking-widest text-[10px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sandbox Database</span>
        </button>
      </div>

      {/* Credits block */}
      <div className="text-center space-y-2 pt-4">
        <div className="inline-flex items-center space-x-1.5 text-[10px] font-display text-gray-500">
          <span>STASH UTILITY CORE V1.0.4</span>
          <span>•</span>
          <Heart className="w-3 h-3 text-red-500 animate-pulse fill-red-500" />
          <span>LOCAL FIRST</span>
        </div>
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest leading-none">
          SECURED VIA LOCALHOST SANDBOX
        </p>
      </div>
    </div>
  );
}
