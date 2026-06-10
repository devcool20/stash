import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Unlock, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import Lottie from 'lottie-react';
import birdyAnimation from '../birdy.json';
import { supabase } from '../supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        setSuccessMsg('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 160 }}
        className="glass-panel-base glass-border-diagonal p-6 bg-black/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/8 rounded-[28px] z-10 w-full"
      >
        {/* Animated Branding */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-6">
          <div className="w-16 h-16 flex items-center justify-center">
            <Lottie 
              animationData={birdyAnimation} 
              loop={true} 
              className="w-16 h-16"
            />
          </div>
          
          <div className="h-12 flex items-center justify-center">
            <svg width="200" height="50" viewBox="0 0 200 50" className="select-none">
              <defs>
                <clipPath id="text-clip-medium">
                  <text
                    fontSize="38"
                    fontWeight="700"
                    fontFamily="Lato, sans-serif"
                    letterSpacing="-0.5px"
                    x="100"
                    y="38"
                    textAnchor="middle"
                  >
                    Stash
                  </text>
                </clipPath>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>

              {/* Base Background Text */}
              <text
                fill="rgba(255, 255, 255, 0.15)"
                fontSize="38"
                fontWeight="700"
                fontFamily="Lato, sans-serif"
                letterSpacing="-0.5px"
                x="100"
                y="38"
                textAnchor="middle"
              >
                Stash
              </text>

              <g clipPath="url(#text-clip-medium)">
                {/* Wave 1 */}
                <path
                  className="wave-anim-1"
                  d="M 0 20 Q 25 12, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 L 250 80 L 0 80 Z"
                  fill="url(#grad1)"
                  opacity="0.6"
                />

                {/* Wave 2 */}
                <path
                  className="wave-anim-2"
                  d="M 0 24 Q 25 32, 50 24 T 100 24 T 150 24 T 200 24 T 250 24 L 250 80 L 0 80 Z"
                  fill="url(#grad2)"
                  opacity="0.85"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] p-0.5 mb-5 relative">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg text-[10px] font-bold tracking-wider font-mono transition-colors relative z-10 ${
              mode === 'signin' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {mode === 'signin' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg text-[10px] font-bold tracking-wider font-mono transition-colors relative z-10 ${
              mode === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            SIGN UP
          </button>
        </div>

        {/* Error / Success Banners */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-500 font-mono text-[9px] font-bold leading-normal uppercase"
            >
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-white font-sans text-[10px] font-semibold leading-normal"
            >
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-white" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs */}
        <form onSubmit={handleAuth} className="space-y-3">
          <div className="flex items-center h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/10 transition-all">
            <Mail className="w-4 h-4 text-gray-500 mr-2.5" />
            <input
              type="email"
              placeholder="Email address..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg(null);
              }}
              autoCapitalize="none"
              autoComplete="email"
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 h-full"
              required
            />
          </div>

          <div className="flex items-center h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/10 transition-all">
            <Lock className="w-4 h-4 text-gray-500 mr-2.5" />
            <input
              type="password"
              placeholder="Secure password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg(null);
              }}
              autoCapitalize="none"
              autoComplete="current-password"
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 h-full"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-black hover:bg-gray-200 shadow-md font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] duration-150 outline-none cursor-pointer mt-4"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : mode === 'signin' ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>AUTHENTICATE VAULT</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>CREATE VAULT</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
