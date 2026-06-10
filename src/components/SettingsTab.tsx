import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Copy, Check, Eye, EyeOff, LogOut } from 'lucide-react';
import { db } from '../database';
import { supabase } from '../supabase';

interface SettingsTabProps {
  onResetDatabase: () => void;
}

export default function SettingsTab({ onResetDatabase }: SettingsTabProps) {
  // Storage usage values
  const metrics = db.getStorageMetrics();

  // State handles for switch controls
  const [enclave, setEnclave] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [localSync, setLocalSync] = useState(true);

  // Private key reveal control
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
      {/* Header */}
      <div className="flex items-center justify-between px-1 pt-2">
        <h2 className="font-display text-[18px] font-bold text-white tracking-tight uppercase">Vault Settings</h2>
        <div className="px-2 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 font-mono text-[8px] font-semibold flex items-center gap-1 shrink-0">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span>CONNECTED</span>
        </div>
      </div>

      {/* 1. Storage & Cloud Sync */}
      <div className="glass-panel-base p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-md space-y-4 text-left">
        <h3 className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">Storage & Sync</h3>
        
        {/* Storage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-white">Device Storage</span>
            <span className="font-mono text-[10px] text-[#8A8A93]">{metrics.usedMB} MB / {metrics.maxMB} MB ({metrics.percent}%)</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <span className="block font-medium text-xs text-white">Offline Mode</span>
            <p className="block text-[10px] text-[#8A8A93] mt-1 leading-relaxed">
              Save items only on this device. Disables cloud sync.
            </p>
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

      {/* 2. Security & Encryption */}
      <div className="glass-panel-base p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-md space-y-4 text-left">
        <h3 className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">Security</h3>

        {/* Secure Hardware Toggle */}
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <span className="block font-medium text-xs text-white">On-Device Encryption</span>
            <p className="block text-[10px] text-[#8A8A93] mt-1 leading-relaxed">
              Encrypt local database items using your device's secure hardware.
            </p>
          </div>
          <button
            onClick={() => setEnclave(!enclave)}
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

        <div className="h-px bg-white/5" />

        {/* Biometric Toggle */}
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <span className="block font-medium text-xs text-white">Biometric Vault Lock</span>
            <p className="block text-[10px] text-[#8A8A93] mt-1 leading-relaxed">
              Require Face ID or fingerprint validation before opening the vault.
            </p>
          </div>
          <button
            onClick={() => setBiometric(!biometric)}
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

        <div className="h-px bg-white/5" />

        {/* Backup Recovery Key */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="font-medium text-xs text-white">Vault Recovery Key</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1 px-2 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none font-mono text-[9px] uppercase tracking-wider font-bold flex items-center"
              >
                {showKey ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                {showKey ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={handleCopyKey}
                className="p-1.5 border border-white/5 rounded-md hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer outline-none"
              >
                {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 break-all select-all">
            {showKey ? privateKeySeed : "•••• •••• •••• •••• •••• ••••"}
          </div>
          <p className="block text-[9.5px] text-[#8A8A93] leading-relaxed">
            Use this key to recover or sync your vault on another device. Keep it secret.
          </p>
        </div>
      </div>

      {/* 3. Account & System Info */}
      <div className="glass-panel-base p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-md space-y-4 text-left">
        <h3 className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold">Account & System</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="block font-medium text-xs text-white">Vault Profile</span>
            <span className="block text-[10px] text-[#8A8A93] mt-0.5">{userEmail || 'Local Guest'}</span>
          </div>
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Stash v1.0.4</span>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-2">
          {/* Sign Out Button */}
          {userEmail && (
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-display uppercase tracking-widest text-[9px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Vault</span>
            </button>
          )}

          {/* Reset Database Button */}
          <button
            onClick={onResetDatabase}
            className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-display uppercase tracking-widest text-[9px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 select-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Vault Data</span>
          </button>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="text-center pt-2">
        <p className="text-[8.5px] font-mono text-[#6E6E76] uppercase tracking-widest">
          Secured Locally • Local First
        </p>
      </div>
    </div>
  );
}
