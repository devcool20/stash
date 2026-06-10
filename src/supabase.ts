import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env.VITE_SUPABASE_URL
  : (process.env.VITE_SUPABASE_URL || 'https://taqdmkbkzqghcbemocfj.supabase.co');
const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY
  : (process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nbUKPl44fwWQ8wQaJra5tA_2B7_-J-4');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
