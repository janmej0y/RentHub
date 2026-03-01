import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for RentHub
 * Uses public anon key (safe for frontend)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_REQUEST_TIMEOUT_MS = 3500;
const SUPABASE_BACKOFF_MS = 30000;
let supabaseBlockedUntil = 0;

const timeoutFetch: typeof fetch = async (input, init) => {
  if (Date.now() < supabaseBlockedUntil) {
    throw new Error('Supabase temporarily unavailable. Using local fallback.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok && response.status >= 500) {
      supabaseBlockedUntil = Date.now() + SUPABASE_BACKOFF_MS;
    }

    return response;
  } catch (error) {
    supabaseBlockedUntil = Date.now() + SUPABASE_BACKOFF_MS;
    throw error;
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
