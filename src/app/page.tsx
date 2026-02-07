'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { RoomGrid } from '@/components/RoomGrid';
import { SearchFilters } from '@/components/SearchFilters';
import { getRooms, type RoomFilter } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [filters, setFilters] = useState<RoomFilter>({
    location: '',
    priceRange: [0, 50000],
    propertyType: [],
    tenantPreference: [],
    amenities: [], // Add this
    furnishingStatus: [], // Add this if required by RoomFilter
    sortBy: 'date_desc', // Add this
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔒 Prevent duplicate calls
  const lastFiltersRef = useRef<string>('');

  useEffect(() => {
    const serializedFilters = JSON.stringify(filters);

    // ❌ Skip if filters didn't actually change
    if (lastFiltersRef.current === serializedFilters) return;

    lastFiltersRef.current = serializedFilters;

    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const data = await getRooms(filters);
        setRooms(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<RoomFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredCount = useMemo(() => rooms.length, [rooms]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-6xl">
          Find Your Perfect Room
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover the ideal rental space that feels like home.
        </p>
      </header>

      <div className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-sm">
        <SearchFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-56 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Showing <span className="font-bold">{filteredCount}</span> results.
            </p>

            {rooms.length > 0 ? (
              <RoomGrid rooms={rooms} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">No Rooms Found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
