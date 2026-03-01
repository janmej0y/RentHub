import type { Room } from '@/types/room';

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=900&q=60',
];

const INDIA_LOCATIONS = [
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Whitefield, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'Banjara Hills, Hyderabad',
  'Gachibowli, Hyderabad',
  'Madhapur, Hyderabad',
  'Kondapur, Hyderabad',
  'Jubilee Hills, Hyderabad',
  'Powai, Mumbai',
  'Andheri West, Mumbai',
  'Bandra, Mumbai',
  'Thane West, Mumbai',
  'Navi Mumbai, Mumbai',
  'Viman Nagar, Pune',
  'Kharadi, Pune',
  'Hinjewadi, Pune',
  'Baner, Pune',
  'Wakad, Pune',
  'Sector 62, Noida',
  'Sector 137, Noida',
  'Gurgaon Sector 57, Gurugram',
  'DLF Phase 3, Gurugram',
  'Cyber City, Gurugram',
  'South Extension, New Delhi',
  'Saket, New Delhi',
  'Dwarka, New Delhi',
  'Rohini, New Delhi',
  'Lajpat Nagar, New Delhi',
  'Salt Lake, Kolkata',
  'New Town, Kolkata',
  'Ballygunge, Kolkata',
  'Alipore, Kolkata',
  'Rajarhat, Kolkata',
  'Adyar, Chennai',
  'Velachery, Chennai',
  'Anna Nagar, Chennai',
  'OMR, Chennai',
  'T Nagar, Chennai',
  'Paldi, Ahmedabad',
  'Prahlad Nagar, Ahmedabad',
  'Bodakdev, Ahmedabad',
  'Vaishali Nagar, Jaipur',
  'Malviya Nagar, Jaipur',
  'Mansarovar, Jaipur',
  'Aliganj, Lucknow',
  'Gomti Nagar, Lucknow',
  'Hazratganj, Lucknow',
  'Kankarbagh, Patna',
] as const;

const PROPERTY_TYPES: Room['propertyType'][] = ['1 BHK', '2 BHK', '1 Bed', '2 Bed', '3 Bed'];
const TENANT_PREFS: Room['tenantPreference'][] = ['Bachelor', 'Family', 'Girls', 'Working'];
const AMENITIES_POOL = ['WiFi', 'AC', 'Parking', 'Kitchen', 'Power Backup', 'Geyser', 'Lift'];
const INDIAN_REVIEWERS = [
  'Aarav Sharma',
  'Priya Nair',
  'Rohan Verma',
  'Sneha Iyer',
  'Karthik Reddy',
  'Ananya Gupta',
  'Vikram Singh',
  'Neha Joshi',
  'Aditya Kulkarni',
  'Meera Kapoor',
  'Rahul Chawla',
  'Pooja Menon',
  'Siddharth Jain',
  'Ishita Banerjee',
  'Harsh Patel',
  'Kavya Krishnan',
  'Nitin Arora',
  'Divya Rao',
  'Abhishek Tiwari',
  'Tanvi Deshpande',
];

const REVIEW_TEMPLATES = [
  'Very clean property and exactly as shown in photos. Owner communication was smooth.',
  'Good ventilation and peaceful surroundings. Commute to office is manageable.',
  'The room is well maintained and locality feels safe even late in the evening.',
  'Water and electricity were reliable, and the owner was quick to help when needed.',
  'Great value for rent in this area. Nearby grocery and transport options are convenient.',
  'Spacious layout with good natural light. Ideal for long-term stay.',
  'Had a comfortable stay. Neighbors are decent and the building is quiet.',
  'Kitchen and washroom were in good condition. Overall a positive rental experience.',
  'Close to metro/bus and daily essentials. I would recommend this property.',
  'Clean common areas and secure entry. Felt safe and comfortable here.',
];

function buildImages(roomNumber: number, location: string): Room['images'] {
  const imageA = IMAGE_POOL[roomNumber % IMAGE_POOL.length];
  const imageB = IMAGE_POOL[(roomNumber + 2) % IMAGE_POOL.length];
  const imageC = IMAGE_POOL[(roomNumber + 4) % IMAGE_POOL.length];
  const shortLocation = location.split(',')[0];

  return [
    {
      id: `mock-room-${roomNumber}-img-1`,
      url: imageA,
      caption: `${shortLocation}: Bright living room with natural daylight.`,
    },
    {
      id: `mock-room-${roomNumber}-img-2`,
      url: imageB,
      caption: `${shortLocation}: Cozy bedroom with storage and ventilation.`,
    },
    {
      id: `mock-room-${roomNumber}-img-3`,
      url: imageC,
      caption: `${shortLocation}: Functional kitchen and dining zone.`,
    },
  ];
}

function buildDescription(
  title: string,
  location: string,
  propertyType: Room['propertyType'],
  tenantPreference: Room['tenantPreference']
): string {
  return `${title} is located in ${location} and is ideal for ${tenantPreference.toLowerCase()} tenants. This ${propertyType} unit includes well-planned interiors, good daylight, reliable water and power supply, and easy access to schools, offices, transit, and daily essentials. The property is maintained for immediate move-in and offers a practical layout for long-term rental comfort.`;
}

function buildAmenities(index: number): string[] {
  const set = new Set<string>([
    AMENITIES_POOL[index % AMENITIES_POOL.length],
    AMENITIES_POOL[(index + 2) % AMENITIES_POOL.length],
    AMENITIES_POOL[(index + 4) % AMENITIES_POOL.length],
    'WiFi',
  ]);
  return Array.from(set);
}

export const mockRooms: Room[] = INDIA_LOCATIONS.map((location, index) => {
  const roomNumber = index + 1;
  const propertyType = PROPERTY_TYPES[index % PROPERTY_TYPES.length];
  const tenantPreference = TENANT_PREFS[index % TENANT_PREFS.length];
  const title = `${propertyType} Rental in ${location.split(',')[0]}`;
  const rent = 12000 + (index % 10) * 2200 + Math.floor(index / 10) * 1200;
  const baseRating = Number((3.8 + (index % 5) * 0.2).toFixed(1));
  const reviewerA = INDIAN_REVIEWERS[index % INDIAN_REVIEWERS.length];
  const reviewerB = INDIAN_REVIEWERS[(index + 7) % INDIAN_REVIEWERS.length];
  const reviewA = REVIEW_TEMPLATES[index % REVIEW_TEMPLATES.length];
  const reviewB = REVIEW_TEMPLATES[(index + 3) % REVIEW_TEMPLATES.length];
  const ratingA = Math.max(3, Math.min(5, Math.round(baseRating)));
  const ratingB = Math.max(3, Math.min(5, Math.round(baseRating + (index % 2 === 0 ? 0 : -0.4))));
  const averageRating = Number(((ratingA + ratingB) / 2).toFixed(1));

  return {
    id: `mock-room-${roomNumber}`,
    title,
    location,
    rent,
    propertyType,
    tenantPreference,
    ownerContact: '7477661933',
    ownerId: roomNumber <= 12 ? 'mock-admin-1' : `mock-owner-${(index % 8) + 2}`,
    amenities: buildAmenities(index),
    images: buildImages(roomNumber, location),
    createdAt: new Date(Date.now() - roomNumber * 1000 * 60 * 60 * 12),
    description: buildDescription(title, location, propertyType, tenantPreference),
    approved: true,
    reviews: [
      {
        id: `mock-room-${roomNumber}-review-1`,
        userId: `mock-user-${(index % 6) + 1}`,
        userName: reviewerA,
        rating: ratingA,
        comment: reviewA,
        createdAt: new Date(Date.now() - roomNumber * 1000 * 60 * 60 * 24),
      },
      {
        id: `mock-room-${roomNumber}-review-2`,
        userId: `mock-user-${((index + 2) % 6) + 1}`,
        userName: reviewerB,
        rating: ratingB,
        comment: reviewB,
        createdAt: new Date(Date.now() - (roomNumber + 2) * 1000 * 60 * 60 * 24),
      },
    ],
    averageRating,
  };
});
