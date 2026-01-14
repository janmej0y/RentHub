'use client';

import { useState, useEffect, useMemo } from 'react';
import { RoomGrid } from '@/components/RoomGrid';
import { SearchFilters } from '@/components/SearchFilters';
import { findRooms, RoomFilter } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [filters, setFilters] = useState<RoomFilter>({
    location: '',
    priceRange: [0, 50000],
    propertyType: [],
    tenantPreference: [],
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterRooms = async () => {
      setIsLoading(true);
      const fetchedRooms = await findRooms(filters);
      setRooms(fetchedRooms);
      setIsLoading(false);
    };
    fetchAndFilterRooms();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<RoomFilter>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const filteredCount = useMemo(() => rooms.length, [rooms]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
          Find Your Perfect Room
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Discover the ideal rental space that feels like home.
        </p>
      </header>
      <div className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-sm">
        <SearchFilters onFilterChange={handleFilterChange} initialFilters={filters} />
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
              Showing <span className="font-bold text-foreground">{filteredCount}</span> results.
            </p>
            {rooms.length > 0 ? (
              <RoomGrid rooms={rooms} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
                <h3 className="text-xl font-semibold">No Rooms Found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search filters to find more options.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
