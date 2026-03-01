import { isMockModeEnabled } from '@/lib/mockMode';
import { mockRooms } from '@/lib/mockRooms';
import { getPaymentScreenshotSignedUrl } from '@/lib/storageService';
import { supabase } from '@/lib/supabaseClient';
import type { Booking } from '@/types/booking';

const BOOKING_STORAGE_KEY = 'renthub-mock-bookings';

type StoredBooking = {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed';
  paymentScreenshotName?: string;
  paymentScreenshotPath?: string;
};

function readStoredBookings(): StoredBooking[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(BOOKING_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredBooking[];
  } catch {
    return [];
  }
}

function writeStoredBookings(bookings: StoredBooking[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
}

function shouldUseLocalBooking(userId: string, roomId?: string): boolean {
  return isMockModeEnabled();
}

export async function getBookings(userId: string): Promise<Booking[]> {
  if (shouldUseLocalBooking(userId)) {
    const stored = readStoredBookings().filter(booking => booking.userId === userId);
    return stored
      .map(booking => {
        const room = mockRooms.find(r => r.id === booking.roomId);
        if (!room) return null;
        return {
          id: booking.id,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          room,
          status: booking.status,
          paymentScreenshotName: booking.paymentScreenshotName,
          paymentScreenshotPath: booking.paymentScreenshotPath,
          paymentScreenshotUrl: booking.paymentScreenshotPath,
        } satisfies Booking;
      })
      .filter(Boolean) as Booking[];
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      check_in,
      check_out,
      status,
      payment_screenshot_name,
      payment_screenshot_path,
      rooms (
        id,
        title,
        location,
        rent,
        property_type,
        tenant_preference,
        contact_number,
        owner_id,
        created_at,
        room_images (
          id,
          image_url
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name
          )
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const mapped = data.map((booking: any) => ({
    id: booking.id,
    checkIn: new Date(booking.check_in),
    checkOut: new Date(booking.check_out),
    room: booking.rooms,
    status: booking.status || 'confirmed',
    paymentScreenshotName: booking.payment_screenshot_name || '',
    paymentScreenshotPath: booking.payment_screenshot_path || '',
  })) as Booking[];

  return Promise.all(
    mapped.map(async booking => ({
      ...booking,
      paymentScreenshotUrl: booking.paymentScreenshotPath
        ? (await getPaymentScreenshotSignedUrl(booking.paymentScreenshotPath)) || undefined
        : undefined,
    }))
  );
}

export async function addBooking(
  userId: string,
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  paymentScreenshotName?: string,
  paymentScreenshotPath?: string
): Promise<void> {
  if (shouldUseLocalBooking(userId, roomId)) {
    const stored = readStoredBookings();
    stored.unshift({
      id: `mock-booking-${Date.now()}`,
      userId,
      roomId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      status: 'pending',
      paymentScreenshotName,
      paymentScreenshotPath,
    });
    writeStoredBookings(stored);
    return;
  }

  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      room_id: roomId,
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
      status: 'pending',
      payment_screenshot_name: paymentScreenshotName || null,
      payment_screenshot_path: paymentScreenshotPath || null,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getRoomBookingStatus(
  userId: string,
  roomId: string
): Promise<'none' | 'pending' | 'confirmed'> {
  if (shouldUseLocalBooking(userId, roomId)) {
    const booking = readStoredBookings().find(
      item => item.userId === userId && item.roomId === roomId
    );
    return booking?.status || 'none';
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('status')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return 'none';
  }

  if (!data) {
    return 'none';
  }

  return data.status === 'pending' ? 'pending' : 'confirmed';
}

export interface PendingBookingReview {
  id: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  status: 'pending' | 'confirmed' | 'rejected';
  paymentScreenshotName?: string;
  paymentScreenshotPath?: string;
  paymentScreenshotUrl?: string;
  room: {
    id: string;
    title: string;
    ownerId: string;
  };
}

export async function getPendingBookingsForAdmin(adminUserId: string): Promise<PendingBookingReview[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      user_id,
      check_in,
      check_out,
      status,
      payment_screenshot_name,
      payment_screenshot_path,
      rooms (
        id,
        title,
        owner_id
      )
    `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const adminRows = (data || []).filter((item: any) => item.rooms?.owner_id === adminUserId);
  const mapped: PendingBookingReview[] = adminRows.map((booking: any) => ({
    id: booking.id,
    userId: booking.user_id,
    checkIn: new Date(booking.check_in),
    checkOut: new Date(booking.check_out),
    status: booking.status || 'pending',
    paymentScreenshotName: booking.payment_screenshot_name || '',
    paymentScreenshotPath: booking.payment_screenshot_path || '',
    room: {
      id: booking.rooms?.id || '',
      title: booking.rooms?.title || 'Unknown Room',
      ownerId: booking.rooms?.owner_id || '',
    },
  }));

  return Promise.all(
    mapped.map(async booking => ({
      ...booking,
      paymentScreenshotUrl: booking.paymentScreenshotPath
        ? (await getPaymentScreenshotSignedUrl(booking.paymentScreenshotPath)) || undefined
        : undefined,
    }))
  );
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'rejected',
  reviewNote?: string
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      review_note: reviewNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (error) {
    throw new Error(error.message);
  }
}
