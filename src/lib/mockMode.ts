export function isMockModeEnabled(): boolean {
  // Keep mock mode opt-in only. This ensures Supabase is used for data services
  // while allowing mock login flow independently.
  return process.env.NEXT_PUBLIC_FORCE_MOCK_DATA === 'true';
}

export function isMockId(id?: string): boolean {
  return Boolean(id && id.startsWith('mock-'));
}
