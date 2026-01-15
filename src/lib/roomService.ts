import type { Room, PropertyType, TenantPreference } from '@/types/room';
import { PlaceHolderImages } from './placeholder-images';

const roomsData: Room[] = [
  {
    id: 'room-1',
    title: 'Cozy 1BHK in Koramangala',
    location: 'Bengaluru',
    rent: 25000,
    propertyType: '1 BHK',
    tenantPreference: 'Bachelor',
    ownerContact: '9876543210',
    ownerId: 'user-2',
    images: [{ id: 'img-1', url: PlaceHolderImages.find(p => p.id === 'room-1')?.imageUrl || '' }],
    createdAt: new Date('2023-10-01'),
    description: 'A cozy and well-lit 1BHK apartment in the heart of Koramangala. Perfect for bachelors or students. Comes with a modular kitchen and a balcony with a great view. Located in a quiet neighborhood with easy access to shops, restaurants, and public transport.'
  },
  {
    id: 'room-2',
    title: 'Spacious 2 Bed in Bandra',
    location: 'Mumbai',
    rent: 45000,
    propertyType: '2 Bed',
    tenantPreference: 'Family',
    ownerContact: '9876543211',
    ownerId: 'user-1',
    images: [{ id: 'img-2', url: PlaceHolderImages.find(p => p.id === 'room-2')?.imageUrl || '' }, { id: 'img-2a', url: PlaceHolderImages.find(p => p.id === 'room-6')?.imageUrl || '' }],
    createdAt: new Date('2023-10-05'),
    description: 'A beautiful and spacious 2-bedroom apartment in the posh locality of Bandra. Ideal for families. The apartment is semi-furnished and has a large living room, two bathrooms, and a dedicated parking spot. 24/7 security and water supply.'
  },
  {
    id: 'room-3',
    title: 'Modern Studio for Girls',
    location: 'Pune',
    rent: 18000,
    propertyType: '1 Bed',
    tenantPreference: 'Girls',
    ownerContact: '9876543212',
    ownerId: 'user-2',
    images: [{ id: 'img-3', url: PlaceHolderImages.find(p => p.id === 'room-3')?.imageUrl || '' }],
    createdAt: new Date('2023-10-10'),
    description: 'A modern and secure studio apartment exclusively for girls. Located near the main IT park in Pune. The studio is fully furnished with all necessary amenities including a kitchenette, AC, and high-speed internet. The building has a female security guard and biometric access.'
  },
  {
    id: 'room-4',
    title: 'Luxury 2BHK with City View',
    location: 'Delhi',
    rent: 35000,
    propertyType: '2 BHK',
    tenantPreference: 'Working',
    ownerContact: '9876543213',
    ownerId: 'user-1',
    images: [{ id: 'img-4', url: PlaceHolderImages.find(p => p.id === 'room-4')?.imageUrl || '' }],
    createdAt: new Date('2023-10-12'),
    description: 'Experience luxury living in this 2BHK apartment with a stunning view of the city skyline. Perfect for working professionals. The apartment is part of a premium complex with a swimming pool, gym, and clubhouse. Close to the metro station.'
  },
  {
    id: 'room-5',
    title: 'Quiet 3 Bed in Chennai',
    location: 'Chennai',
    rent: 30000,
    propertyType: '3 Bed',
    tenantPreference: 'Family',
    ownerContact: '9876543214',
    ownerId: 'user-2',
    images: [{ id: 'img-5', url: PlaceHolderImages.find(p => p.id === 'room-5')?.imageUrl || '' }],
    createdAt: new Date('2023-10-15'),
    description: 'A serene and peaceful 3-bedroom house located in a calm residential area of Chennai. Perfect for a family looking for a quiet place to live. The house has a private garden, ample ventilation, and is surrounded by greenery.'
  },
  {
    id: 'room-6',
    title: '1BHK near Hitech City',
    location: 'Hyderabad',
    rent: 22000,
    propertyType: '1 BHK',
    tenantPreference: 'Working',
    ownerContact: '9876543215',
    ownerId: 'user-1',
    images: [{ id: 'img-6', url: PlaceHolderImages.find(p => p.id === 'room-6')?.imageUrl || '' }],
    createdAt: new Date('2023-10-18'),
    description: 'A comfortable 1BHK apartment located just minutes away from Hitech City. An ideal choice for IT professionals. The building is new and has all modern amenities. The flat is well-ventilated and receives ample natural light.'
  },
  {
    id: 'room-7',
    title: 'Affordable Room in Kolkata',
    location: 'Kolkata',
    rent: 12000,
    propertyType: '1 Bed',
    tenantPreference: 'Bachelor',
    ownerContact: '9876543216',
    ownerId: 'user-2',
    images: [{ id: 'img-7', url: PlaceHolderImages.find(p => p.id === 'room-7')?.imageUrl || '' }],
    createdAt: new Date('2023-10-20'),
    description: 'A budget-friendly room for bachelors in a prime location in Kolkata. The room is part of a shared apartment and comes with a bed, cupboard, and a study table. The kitchen and bathroom are shared. All bills included in the rent.'
  },
  {
    id: 'room-8',
    title: 'Penthouse with Terrace',
    location: 'Mumbai',
    rent: 80000,
    propertyType: '3 Bed',
    tenantPreference: 'Family',
    ownerContact: '9876543217',
    ownerId: 'user-1',
    images: [{ id: 'img-8', url: PlaceHolderImages.find(p => p.id === 'room-8')?.imageUrl || '' }],
    createdAt: new Date('2023-10-22'),
    description: 'A luxurious penthouse apartment with a private terrace garden. Located in a premium high-rise building in Mumbai. Offers breathtaking views of the sea. The apartment is fully furnished with designer furniture and high-end appliances.'
  },
];

export interface RoomFilter {
  location: string;
  priceRange: [number, number];
  propertyType: PropertyType[];
  tenantPreference: TenantPreference[];
}

// Simulate API calls
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const findRooms = async (filters: RoomFilter): Promise<Room[]> => {
  await simulateDelay(500);
  return roomsData.filter(room => {
    const locationMatch = filters.location ? room.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
    const priceMatch = room.rent >= filters.priceRange[0] && room.rent <= filters.priceRange[1];
    const propertyTypeMatch = filters.propertyType.length > 0 ? filters.propertyType.includes(room.propertyType) : true;
    const tenantPreferenceMatch = filters.tenantPreference.length > 0 ? filters.tenantPreference.includes(room.tenantPreference) : true;

    return locationMatch && priceMatch && propertyTypeMatch && tenantPreferenceMatch;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getRoomById = async (id: string): Promise<Room | undefined> => {
  await simulateDelay(200);
  return roomsData.find(room => room.id === id);
}

export const getRoomsByOwner = async (ownerId: string): Promise<Room[]> => {
    await simulateDelay(300);
    return roomsData.filter(room => room.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const addRoom = async (roomData: Omit<Room, 'id' | 'createdAt' | 'images'> & {images: string[]}): Promise<Room> => {
    await simulateDelay(700);
    const newRoom: Room = {
        ...roomData,
        id: `room-${Date.now()}`,
        createdAt: new Date(),
        images: roomData.images.map((url, i) => ({ id: `img-${Date.now()}-${i}`, url }))
    };
    roomsData.unshift(newRoom);
    return newRoom;
}

export const updateRoom = async (roomId: string, updateData: Partial<Room>): Promise<Room> => {
    await simulateDelay(600);
    const roomIndex = roomsData.findIndex(r => r.id === roomId);
    if (roomIndex === -1) throw new Error("Room not found");

    roomsData[roomIndex] = { ...roomsData[roomIndex], ...updateData };
    return roomsData[roomIndex];
}

export const deleteRoom = async (roomId: string): Promise<{ success: boolean }> => {
    await simulateDelay(400);
    const roomIndex = roomsData.findIndex(r => r.id === roomId);
    if (roomIndex === -1) throw new Error("Room not found");
    
    roomsData.splice(roomIndex, 1);
    return { success: true };
}
