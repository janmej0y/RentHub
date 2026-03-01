import { supabase } from '@/lib/supabaseClient';
import { mockRooms } from '@/lib/mockRooms';
import { isMockId, isMockModeEnabled } from '@/lib/mockMode';
import type { PropertyType, Room, TenantPreference } from '@/types/room';

export type Amenity = 'WiFi' | 'AC' | 'Parking' | 'Kitchen';
export const Amenities: readonly Amenity[] = ['WiFi', 'AC', 'Parking', 'Kitchen'];

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export const FurnishingStatuses: readonly FurnishingStatus[] = [
  'Furnished',
  'Semi-Furnished',
  'Unfurnished',
];

export type SortBy = 'best_match' | 'rent_asc' | 'rent_desc' | 'rating_desc' | 'date_desc';

export interface RoomFilter {
  location: string;
  priceRange: [number, number];
  propertyType: PropertyType[];
  tenantPreference: TenantPreference[];
  amenities: Amenity[];
  furnishingStatus: FurnishingStatus[];
  sortBy: SortBy;
}

type ProfilePrefs = {
  preferredCity?: string;
  budget?: string;
};

function readProfilePrefs(): ProfilePrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('renthub-profile-prefs');
    if (!raw) return {};
    return JSON.parse(raw) as ProfilePrefs;
  } catch {
    return {};
  }
}

function getBestMatchScore(room: Room): number {
  const prefs = readProfilePrefs();
  let score = room.averageRating * 10;

  if (prefs.preferredCity) {
    const city = prefs.preferredCity.toLowerCase().trim();
    if (city && room.location.toLowerCase().includes(city)) {
      score += 25;
    }
  }

  const budgetNum = Number(prefs.budget || 0);
  if (budgetNum > 0) {
    const gap = Math.abs(room.rent - budgetNum);
    score += Math.max(0, 20 - gap / 1500);
  }

  const freshnessDays = (Date.now() - room.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 10 - freshnessDays / 3);

  return score;
}

export async function getRooms(filters: RoomFilter): Promise<Room[]> {
  if (isMockModeEnabled()) {
    return filterAndSortMockRooms(filters);
  }

  try {
    let query = supabase
      .from('rooms')
      .select(
        `
        id,
        title,
        location,
        rent,
        amenities,
        property_type,
        tenant_preference,
        contact_number,
        owner_id,
        description,
        created_at,
        approved,
        room_images (
          id,
          image_url
        ),
        reviews (
          id,
          rating,
          comment,
          created_at
        )
      `
      )
      .eq('approved', true);

    if (filters.location.trim()) {
      query = query.ilike('location', `%${filters.location.trim()}%`);
    }

    query = query
      .gte('rent', filters.priceRange[0])
      .lte('rent', filters.priceRange[1]);

    if (filters.propertyType.length > 0) {
      query = query.in('property_type', filters.propertyType);
    }

    if (filters.tenantPreference.length > 0) {
      query = query.in('tenant_preference', filters.tenantPreference);
    }

    if (filters.furnishingStatus.length > 0) {
      query = query.in('furnishing_status', filters.furnishingStatus);
    }

    if (filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    switch (filters.sortBy) {
      case 'best_match':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rent_asc':
        query = query.order('rent', { ascending: true });
        break;
      case 'rent_desc':
        query = query.order('rent', { ascending: false });
        break;
      case 'rating_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'date_desc':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    let mappedRooms = (data || []).map(mapRoomFromDB);
    if (filters.sortBy === 'best_match') {
      mappedRooms = mappedRooms.sort((a, b) => getBestMatchScore(b) - getBestMatchScore(a));
    }
    if (mappedRooms.length > 0) {
      return mappedRooms;
    }
  } catch {
    // Use local mock data if Supabase is unavailable or empty.
  }

  return filterAndSortMockRooms(filters);
}

export async function getMyRooms(userId: string): Promise<Room[]> {
  if (isMockModeEnabled() || isMockId(userId)) {
    return mockRooms
      .filter(room => room.ownerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(
        `
        id,
        title,
        location,
        rent,
        amenities,
        property_type,
        tenant_preference,
        contact_number,
        owner_id,
        description,
        created_at,
        approved,
        room_images (
          id,
          image_url
        ),
        reviews (
          id,
          rating,
          comment,
          created_at
        )
      `
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const mappedRooms = (data || []).map(mapRoomFromDB);
    if (mappedRooms.length > 0) {
      return mappedRooms;
    }
  } catch {
    // Use local mock data if Supabase is unavailable.
  }

  return mockRooms
    .filter(room => room.ownerId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  if (isMockModeEnabled() || isMockId(roomId)) {
    return mockRooms.find(room => room.id === roomId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(
        `
        id,
        title,
        location,
        rent,
        amenities,
        property_type,
        tenant_preference,
        contact_number,
        owner_id,
        description,
        created_at,
        approved,
        room_images (
          id,
          image_url
        ),
        reviews (
          id,
          rating,
          comment,
          created_at
        )
      `
      )
      .eq('id', roomId)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return mapRoomFromDB(data);
    }
  } catch {
    // Ignore and use mock fallback below.
  }

  return mockRooms.find(room => room.id === roomId) || null;
}

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

  if (input.imageUrls.length > 0) {
    const imageRows = input.imageUrls.map(url => ({
      room_id: room.id,
      image_url: url,
    }));

    const { error: imageError } = await supabase.from('room_images').insert(imageRows);
    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  return getRoomById(room.id) as Promise<Room>;
}

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

export async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) {
    throw new Error(error.message);
  }
}

function mapRoomFromDB(row: any): Room {
  const reviews =
    row.reviews?.map((review: any) => ({
      id: review.id,
      userId: review.profiles?.id || 'unknown',
      userName: review.profiles?.full_name || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date(review.created_at),
    })) || [];

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
        reviews.length
      : 0;

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    rent: row.rent,
    propertyType: row.property_type,
    tenantPreference: row.tenant_preference,
    ownerContact: row.contact_number,
    ownerId: row.owner_id,
    images:
      row.room_images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        caption: img.caption || '',
      })) || [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    createdAt: new Date(row.created_at),
    description: row.description || '',
    approved: row.approved,
    reviews,
    averageRating,
  };
}

function filterAndSortMockRooms(filters: RoomFilter): Room[] {
  const locationQuery = filters.location.trim().toLowerCase();

  const filtered = mockRooms.filter(room => {
    const matchesLocation =
      locationQuery.length === 0 || room.location.toLowerCase().includes(locationQuery);
    const matchesPrice =
      room.rent >= filters.priceRange[0] && room.rent <= filters.priceRange[1];
    const matchesPropertyType =
      filters.propertyType.length === 0 || filters.propertyType.includes(room.propertyType);
    const matchesTenantPreference =
      filters.tenantPreference.length === 0 ||
      filters.tenantPreference.includes(room.tenantPreference);
    const roomAmenities = room.amenities || [];
    const matchesAmenities =
      filters.amenities.length === 0 ||
      filters.amenities.every(amenity => roomAmenities.includes(amenity));

    return (
      matchesLocation &&
      matchesPrice &&
      matchesPropertyType &&
      matchesTenantPreference &&
      matchesAmenities
    );
  });

  switch (filters.sortBy) {
    case 'best_match':
      return filtered.sort((a, b) => getBestMatchScore(b) - getBestMatchScore(a));
    case 'rent_asc':
      return filtered.sort((a, b) => a.rent - b.rent);
    case 'rent_desc':
      return filtered.sort((a, b) => b.rent - a.rent);
    case 'rating_desc':
      return filtered.sort((a, b) => b.averageRating - a.averageRating);
    case 'date_desc':
    default:
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
