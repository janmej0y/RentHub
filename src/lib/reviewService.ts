import { supabase } from '@/lib/supabaseClient';
import type { Review } from '@/types/room';

export async function getReviews(roomId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles (
        full_name
      )
    `
    )
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((review: any) => ({
    id: review.id,
    userId: review.profiles.id,
    userName: review.profiles.full_name,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
  }));
}

export async function addReview(
  userId: string,
  roomId: string,
  rating: number,
  comment: string
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, room_id: roomId, rating, comment });

  if (error) {
    throw new Error(error.message);
  }
}
