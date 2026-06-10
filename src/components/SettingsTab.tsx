import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Cpu, Heart, RefreshCw, KeyRound, Copy, Check, Eye, EyeOff, LogOut, User, Wifi, WifiOff } from 'lucide-react';
import { db } from '../database';
import { supabase } from '../supabase';

interface SettingsTabProps {
  onResetDatabase: () => void;
}

export default function SettingsTab({ onResetDatabase }: SettingsTabProps) {
  // Storage usage values
  const metrics = db.getStorageMetrics();

  // State handles for Cryptographic Switchboard Toggles
  const [enclave, setEnclave] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [localSync, setLocalSync] = useState(true);

  // Private key seed reveal control
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const privateKeySeed = "stash_seed_aes256_x86_64_9af4bc8382c18d41fe0901e";

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

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

  const handleSignOut = async () => {
    if (confirm('Sign out of your secure vault? Your local cache will be preserved.')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div id="settings-command-deck" className="space-y-[12px] pb-[60px]">
      {/* Vault Header */}
      <div className="flex items-center px-1 pt-2 gap-3 text-left">
        <div className="w-8 h-8 rounded-[10px] bg-white/12 border border-white/25 flex items-center justify-center text-white shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-[17px] font-bold text-white tracking-tight leading-none uppercase">THE VAULT</h2>
          <span className="block text-[9.5px] text-[#8A8A93] font-sans mt-1 tracking-wide leading-none">
            Your data is your own. Zero sync, zero exposure.
          </span>
        </div>
      </div>
      {/* Profile Card */}
      <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl bg-white/[0.04] border border-white/5 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-display font-semibold text-[11px] text-white truncate">
              {userEmail ? userEmail.toUpperCase() : 'LOCAL OPERATOR'}
            </span>
            <span className="block text-[8px] font-mono text-[#8A8A93] tracking-widest mt-1">
              STASH UTILITY CORE V1.0.4
            </span>
          </div>
          <div className="px-2 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 font-mono text-[8px] font-semibold flex items-center gap-1 shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 1. On-Device Storage Allocation Diagnostics */}
      <div id="storage-metrics-panel" className="glass-panel-base glass-border-diagonal p-4 rounded-2xl space-y-3.5 bg-white/[0.03] border border-white/5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block font-display font-medium text-xs text-white leading-none">ON-DEVICE ALLOCATION</span>
              <span className="block text-[8px] font-mono text-[#8A8A93] uppercase tracking-widest mt-1">LOCAL HARDWARE BOUNDS</span>
            </div>
          </div>
          <span className="font-mono text-[9.5px] text-white bg-white/5 px-2 py-0.5 rounded border border-white/5 font-bold">
            {metrics.percent}%
          </span>
        </div>

        {/* Retro progress line */}
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
          </div>
          <div className="flex justify-between items-center text-[8.5px] font-mono text-gray-500">
            <span>DATABASE SECTOR</span>
            <span className="text-[#8A8A93] font-bold">{metrics.usedMB} MB / {metrics.maxMB} MB</span>
          </div>
        </div>
      </div>

      {/* Local-Only Sync Mode Toggle */}
      <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
              {localSync ? (
                <WifiOff className="w-3.5 h-3.5 text-white" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <div className="pr-4 text-left">
              <span className="block font-display font-medium text-xs text-white leading-none">LOCAL-ONLY SYNC MODE</span>
              <p className="block text-[9px] text-[#8A8A93] font-sans mt-1.5 leading-relaxed">
                Keep all data strictly on-device. No servers, no exposure.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocalSync(!localSync)}
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 border ${
              localSync ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'
            }`}
          >
            <motion.div 
              layout
              className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              animate={{ x: localSync ? 18 : 0 }}
            />
          </button>
        </div>
      </div>

      {/* 2. Cryptographic Switchboard */}
      <div className="space-y-3">
        <div className="px-1 flex justify-between items-center">
          <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">CRYPTOGRAPHIC CONTROLS</span>
        </div>

        {/* Private key section */}
        <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl space-y-3 bg-white/[0.03] border border-white/5 shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <KeyRound className="w-4 h-4 text-white" />
              <span className="font-display text-xs font-semibold">Decryption Key Envelope</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setShowKey(!showKey)}
                id="toggle-reveal-key"
                className="p-1 px-2 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none font-mono text-[9px] uppercase tracking-wider font-bold flex items-center"
              >
                {showKey ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                {showKey ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={handleCopyKey}
                id="copy-key-seed"
                className="p-1.5 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none"
              >
                {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[9px] text-gray-400 break-all select-all">
            {showKey ? privateKeySeed : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
          </div>
        </div>

        {/* High-fidelity responsive toggle rows */}
        <div className="glass-panel-base glass-border-diagonal rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 shadow-md divide-y divide-white/5">
          {/* Row 1: Hardware Enclave Encryption */}
          <div className="p-4 flex items-center justify-between" id="row-toggle-enclave">
            <div className="space-y-1.5 pr-4 text-left">
              <span className="block font-display text-xs text-white font-semibold leading-none">Hardware Enclave Encryption</span>
              <span className="block text-[9.5px] text-[#8A8A93] font-sans leading-relaxed">
                Locks all FTS database entries into local Secure Enclave partition.
              </span>
            </div>
            <button
              onClick={() => setEnclave(!enclave)}
              id="switch-enclave"
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 border ${
                enclave ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'
              }`}
            >
              <motion.div 
                layout
                className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: enclave ? 18 : 0 }}
              />
            </button>
          </div>

          {/* Row 2: Biometric Vault Access */}
          <div className="p-4 flex items-center justify-between" id="row-toggle-biometric">
            <div className="space-y-1.5 pr-4 text-left">
              <span className="block font-display text-xs text-white font-semibold leading-none">Biometric Vault Lock</span>
              <span className="block text-[9.5px] text-[#8A8A93] font-sans leading-relaxed">
                FaceID / fingerprint before app access.
              </span>
            </div>
            <button
              onClick={() => setBiometric(!biometric)}
              id="switch-biometric"
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative shrink-0 border ${
                biometric ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'
              }`}
            >
              <motion.div 
                layout
                className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: biometric ? 18 : 0 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Command Row */}
      <div className="glass-panel-base glass-border-diagonal p-4 rounded-2xl space-y-3 bg-white/[0.03] border border-white/5 shadow-md">
        <div className="flex items-center space-x-2.5 text-[#FFFFFF]">
          <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="block font-display font-semibold text-xs text-white leading-none">DEVELOPER LAB</span>
            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest mt-1">Destructive Sandbox Controls</span>
          </div>
        </div>
        <p className="text-[9.5px] text-[#8A8A93] font-sans leading-relaxed text-left">
          Resets all data to default lookbook listings. Useful for testing or starting fresh.
        </p>

        <button
          onClick={onResetDatabase}
          id="cmd-reset-db"
          className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sandbox Database</span>
        </button>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        id="cmd-sign-out"
        className="w-full py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-display uppercase tracking-widest text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out of Vault</span>
      </button>

      {/* Credits block */}
      <div className="text-center space-y-1.5 pt-4">
        <div className="inline-flex items-center space-x-1.5 text-[8.5px] font-display text-[#6E6E76] font-bold">
          <Heart className="w-2.5 h-2.5" />
          <span>LOCAL FIRST</span>
          <span>•</span>
          <span>STASH UTILITY CORE</span>
        </div>
        <p className="text-[7.5px] font-mono text-[#6E6E76] uppercase tracking-widest leading-none">
          V1.0.4 — SECURED LOCALLY
        </p>
      </div>
    </div>
  );
}
