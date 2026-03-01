'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, TrendingUp, Building2, WalletCards } from 'lucide-react';
import { RoomGrid } from '@/components/RoomGrid';
import { SearchFilters } from '@/components/SearchFilters';
import { getRooms, type RoomFilter } from '@/lib/roomService';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types/room';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;
const QUICK_LOCATIONS = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'New Delhi', 'Chennai'];

export default function Home() {
  const [filters, setFilters] = useState<RoomFilter>({
    location: '',
    priceRange: [0, 50000],
    propertyType: [],
    tenantPreference: [],
    amenities: [],
    furnishingStatus: [],
    sortBy: 'date_desc',
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const requestIdRef = useRef(0);

  const handleFilterChange = useCallback((newFilters: Partial<RoomFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await getRooms(filters);
        if (requestIdRef.current === currentRequestId) {
          setRooms(data);
          setCurrentPage(1);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const displayedRooms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rooms.slice(start, start + PAGE_SIZE);
  }, [rooms, currentPage]);

  const stats = useMemo(() => {
    if (rooms.length === 0) {
      return {
        count: 0,
        avgRent: 0,
        topCity: '-',
      };
    }

    const avgRent = Math.round(rooms.reduce((sum, room) => sum + room.rent, 0) / rooms.length);
    const cityCount = rooms.reduce<Record<string, number>>((acc, room) => {
      const city = room.location.split(',').slice(-1)[0]?.trim() || room.location;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return { count: rooms.length, avgRent, topCity };
  }, [rooms]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <header className="fade-in-up relative overflow-hidden rounded-2xl border bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-8 shadow-sm">
        <div className="float-soft absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/15 blur-2xl" />
        <div className="float-soft absolute -bottom-10 left-1/3 h-36 w-36 rounded-full bg-emerald-400/15 blur-2xl" />
        <h1 className="font-headline text-4xl font-bold md:text-6xl">Find Your Perfect Room</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Faster browsing, smarter filters, and rich property details.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK_LOCATIONS.map(city => (
            <Button
              key={city}
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange({ location: city })}
            >
              <Search className="mr-2 h-4 w-4" />
              {city}
            </Button>
          ))}
        </div>
      </header>

      <section className="fade-in grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Available Listings</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <Building2 className="h-5 w-5 text-accent" /> {stats.count}
          </p>
        </div>
        <div className="glass-panel rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Average Monthly Rent</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <WalletCards className="h-5 w-5 text-accent" /> {formatCurrency(stats.avgRent)}
          </p>
        </div>
        <div className="glass-panel rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Most Listings In</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <TrendingUp className="h-5 w-5 text-accent" /> {stats.topCity}
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-10 py-4">
        <SearchFilters onFilterChange={handleFilterChange} initialFilters={filters} />
      </div>

      <section className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold">{displayedRooms.length}</span> of{' '}
              <span className="font-bold">{rooms.length}</span> results.
            </p>

            {rooms.length > 0 ? (
              <>
                <RoomGrid rooms={displayedRooms} />
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">No Rooms Found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your search filters.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
