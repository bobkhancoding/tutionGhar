import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  throw new Error('Missing or invalid EXPO_PUBLIC_SUPABASE_URL environment variable. Please check your .env file and replace the placeholder with your actual Supabase project URL.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  throw new Error('Missing or invalid EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env file and replace the placeholder with your actual Supabase anon key.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});