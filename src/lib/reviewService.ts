import { isMockModeEnabled } from '@/lib/mockMode';
import { supabase } from '@/lib/supabaseClient';
import type { Review } from '@/types/room';

const REVIEW_STORAGE_KEY = 'renthub-mock-reviews';

type StoredReview = {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

function readStoredReviews(): StoredReview[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredReview[];
  } catch {
    return [];
  }
}

function writeStoredReviews(reviews: StoredReview[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

function shouldUseLocalReview(roomId: string): boolean {
  return isMockModeEnabled();
}

export async function getReviews(roomId: string): Promise<Review[]> {
  if (shouldUseLocalReview(roomId)) {
    return readStoredReviews()
      .filter(review => review.roomId === roomId)
      .map(review => ({
        id: review.id,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt),
      }));
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles (
        id,
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
    userId: review.profiles?.id || 'unknown',
    userName: review.profiles?.full_name || 'Anonymous',
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
  if (shouldUseLocalReview(roomId)) {
    const stored = readStoredReviews();
    stored.unshift({
      id: `mock-review-${Date.now()}`,
      roomId,
      userId,
      userName: 'You',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    writeStoredReviews(stored);
    return;
  }

  const { error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, room_id: roomId, rating, comment });

  if (error) {
    throw new Error(error.message);
  }
}
