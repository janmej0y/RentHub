import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for RentHub
 * Uses public anon key (safe for frontend)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_REQUEST_TIMEOUT_MS = 3500;

const timeoutFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: timeoutFetch,
  },
});
