import { supabase } from '@/lib/supabaseClient';
import type { Booking } from '@/types/booking';

export async function getBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      check_in,
      check_out,
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

  return data.map((booking: any) => ({
    id: booking.id,
    checkIn: new Date(booking.check_in),
    checkOut: new Date(booking.check_out),
    room: booking.rooms,
  }));
}

export async function addBooking(
  userId: string,
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      room_id: roomId,
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }
}
