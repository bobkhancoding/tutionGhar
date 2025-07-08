import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bbpqyzxxolikbbnkmoyf.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicHF5enh4b2xpa2Jibmttb3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODExODQsImV4cCI6MjA2NzQ1NzE4NH0.19oIIBpBjcg85sghXVR5tI7BkrUTuPzqHOBXeHCMINQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});