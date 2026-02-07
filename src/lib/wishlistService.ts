import { supabase } from '@/lib/supabaseClient';
import type { Room } from '@/types/room';

export async function getWishlist(userId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('rooms(*)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => item.rooms);
}

export async function addToWishlist(userId: string, roomId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, room_id: roomId });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeFromWishlist(userId: string, roomId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('room_id', roomId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function isInWishlist(userId: string, roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw new Error(error.message);
  }

  return !!data;
}
