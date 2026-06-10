import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (val) return val;
  }
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key];
    if (val) return val;
  }
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://taqdmkbkzqghcbemocfj.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_nbUKPl44fwWQ8wQaJra5tA_2B7_-J-4');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

