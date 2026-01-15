import { supabase } from '@/lib/supabaseClient';
import type { Room, PropertyType, TenantPreference } from '@/types/room';

/**
 * Filters used by search
 */
export interface RoomFilter {
  location: string;
  priceRange: [number, number];
  propertyType: PropertyType[];
  tenantPreference: TenantPreference[];
}

/**
 * Fetch rooms with filters (PUBLIC)
 */
export async function getRooms(filters: RoomFilter): Promise<Room[]> {
  let query = supabase
    .from('rooms')
    .select(
      `
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
      )
    `
    )
    .order('created_at', { ascending: false });

  // 🔎 Location filter
  if (filters.location.trim()) {
    query = query.ilike('location', `%${filters.location.trim()}%`);
  }

  // 💰 Price range filter
  query = query
    .gte('rent', filters.priceRange[0])
    .lte('rent', filters.priceRange[1]);

  // 🏠 Property type filter
  if (filters.propertyType.length > 0) {
    query = query.in('property_type', filters.propertyType);
  }

  // 👥 Tenant preference filter
  if (filters.tenantPreference.length > 0) {
    query = query.in('tenant_preference', filters.tenantPreference);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapRoomFromDB);
}

/**
 * Fetch rooms created by logged-in owner
 */
export async function getMyRooms(userId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(
      `
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
      )
    `
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapRoomFromDB);
}

/**
 * Fetch single room by ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(
      `
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
      )
    `
    )
    .eq('id', roomId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRoomFromDB(data);
}

/**
 * Create new room
 */
export async function addRoom(input: {
  title: string;
  location: string;
  rent: number;
  propertyType: PropertyType;
  tenantPreference: TenantPreference;
  contactNumber: string;
  imageUrls: string[];
}): Promise<Room> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // 1️⃣ Insert room
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      title: input.title,
      location: input.location,
      rent: input.rent,
      property_type: input.propertyType,
      tenant_preference: input.tenantPreference,
      contact_number: input.contactNumber,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // 2️⃣ Insert images
  if (input.imageUrls.length > 0) {
    const imageRows = input.imageUrls.map(url => ({
      room_id: room.id,
      image_url: url,
    }));

    const { error: imageError } = await supabase
      .from('room_images')
      .insert(imageRows);

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  return getRoomById(room.id) as Promise<Room>;
}

/**
 * Update room
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<{
    title: string;
    location: string;
    rent: number;
    propertyType: PropertyType;
    tenantPreference: TenantPreference;
    contactNumber: string;
  }>
): Promise<Room> {
  const { error } = await supabase
    .from('rooms')
    .update({
      title: updates.title,
      location: updates.location,
      rent: updates.rent,
      property_type: updates.propertyType,
      tenant_preference: updates.tenantPreference,
      contact_number: updates.contactNumber,
    })
    .eq('id', roomId);

  if (error) {
    throw new Error(error.message);
  }

  return getRoomById(roomId) as Promise<Room>;
}

/**
 * Delete room
 */
export async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Map DB → App Room type
 */
function mapRoomFromDB(row: any): Room {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    rent: row.rent,
    propertyType: row.property_type,
    tenantPreference: row.tenant_preference,
    ownerContact: row.contact_number,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at),
    images:
      row.room_images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
      })) || [],
  };
}
