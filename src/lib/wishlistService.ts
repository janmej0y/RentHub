import { mockRooms } from '@/lib/mockRooms';
import { isMockModeEnabled } from '@/lib/mockMode';
import { supabase } from '@/lib/supabaseClient';
import type { Room } from '@/types/room';

const WISHLIST_STORAGE_KEY = 'renthub-mock-wishlist';

type WishlistStore = Record<string, string[]>;

function readWishlistStore(): WishlistStore {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as WishlistStore;
  } catch {
    return {};
  }
}

function writeWishlistStore(store: WishlistStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(store));
}

function getLocalWishlistIds(userId: string): string[] {
  const store = readWishlistStore();
  return store[userId] || [];
}

function setLocalWishlistIds(userId: string, ids: string[]): void {
  const store = readWishlistStore();
  store[userId] = Array.from(new Set(ids));
  writeWishlistStore(store);
}

function shouldUseLocalWishlist(userId: string, roomId?: string): boolean {
  return isMockModeEnabled();
}

export async function getWishlist(userId: string): Promise<Room[]> {
  if (shouldUseLocalWishlist(userId)) {
    const ids = getLocalWishlistIds(userId);
    return mockRooms.filter(room => ids.includes(room.id));
  }

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('rooms(*)')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => item.rooms);
  } catch {
    const ids = getLocalWishlistIds(userId);
    return mockRooms.filter(room => ids.includes(room.id));
  }
}

export async function addToWishlist(userId: string, roomId: string): Promise<void> {
  if (shouldUseLocalWishlist(userId, roomId)) {
    const ids = getLocalWishlistIds(userId);
    setLocalWishlistIds(userId, [...ids, roomId]);
    return;
  }

  try {
    const { error } = await supabase.from('wishlists').insert({ user_id: userId, room_id: roomId });
    if (error) {
      throw error;
    }
  } catch {
    const ids = getLocalWishlistIds(userId);
    setLocalWishlistIds(userId, [...ids, roomId]);
  }
}

export async function removeFromWishlist(userId: string, roomId: string): Promise<void> {
  if (shouldUseLocalWishlist(userId, roomId)) {
    const ids = getLocalWishlistIds(userId).filter(id => id !== roomId);
    setLocalWishlistIds(userId, ids);
    return;
  }

  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', roomId);

    if (error) {
      throw error;
    }
  } catch {
    const ids = getLocalWishlistIds(userId).filter(id => id !== roomId);
    setLocalWishlistIds(userId, ids);
  }
}

export async function isInWishlist(userId: string, roomId: string): Promise<boolean> {
  if (shouldUseLocalWishlist(userId, roomId)) {
    return getLocalWishlistIds(userId).includes(roomId);
  }

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(data);
  } catch {
    return getLocalWishlistIds(userId).includes(roomId);
  }
}
