import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for RentHub
 * Uses public anon key (safe for frontend)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
