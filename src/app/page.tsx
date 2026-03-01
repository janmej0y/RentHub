'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Building2, WalletCards, MapPinned, Sparkles, BookmarkPlus } from 'lucide-react';
import { RoomGrid } from '@/components/RoomGrid';
import { SearchFilters } from '@/components/SearchFilters';
import { getRooms, type RoomFilter } from '@/lib/roomService';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types/room';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;
const QUICK_LOCATIONS = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'New Delhi', 'Chennai'];
const SAVED_SEARCHES_KEY = 'renthub-saved-searches';
const RECENT_ROOMS_KEY = 'renthub-recent-rooms';
type ViewMode = 'list' | 'map';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [recentRoomIds, setRecentRoomIds] = useState<string[]>([]);
  const requestIdRef = useRef(0);

  const handleFilterChange = useCallback((newFilters: Partial<RoomFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SAVED_SEARCHES_KEY);
      const recent = window.localStorage.getItem(RECENT_ROOMS_KEY);
      setSavedSearches(saved ? (JSON.parse(saved) as string[]) : []);
      setRecentRoomIds(recent ? (JSON.parse(recent) as string[]) : []);
    } catch {
      setSavedSearches([]);
      setRecentRoomIds([]);
    }
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

  const locationInsights = useMemo(() => {
    const grouped = rooms.reduce<Record<string, { count: number; totalRent: number }>>((acc, room) => {
      const city = room.location.split(',').slice(-1)[0]?.trim() || room.location;
      if (!acc[city]) {
        acc[city] = { count: 0, totalRent: 0 };
      }
      acc[city].count += 1;
      acc[city].totalRent += room.rent;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([city, data]) => ({
        city,
        count: data.count,
        avgRent: Math.round(data.totalRent / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);
  }, [rooms]);

  const recentRooms = useMemo(() => {
    const ids = new Set(recentRoomIds);
    return rooms.filter(room => ids.has(room.id)).slice(0, 4);
  }, [rooms, recentRoomIds]);

  const recommendedRooms = useMemo(() => {
    const recentSet = new Set(recentRoomIds);
    return [...rooms]
      .filter(room => !recentSet.has(room.id))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);
  }, [rooms, recentRoomIds]);

  const saveCurrentSearch = () => {
    const keyword = filters.location.trim();
    if (!keyword) {
      toast({
        variant: 'destructive',
        title: 'Type a location first',
        description: 'Only location-based searches can be saved right now.',
      });
      return;
    }

    const next = [keyword, ...savedSearches.filter(item => item.toLowerCase() !== keyword.toLowerCase())].slice(0, 8);
    setSavedSearches(next);
    window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
    toast({ title: 'Search saved', description: `"${keyword}" added to saved searches.` });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <header className="fade-in-up hero-mesh relative overflow-hidden rounded-2xl border border-border/60 p-8 shadow-sm">
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
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={saveCurrentSearch}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Save Search
          </Button>
          {savedSearches.slice(0, 4).map(keyword => (
            <Button
              key={keyword}
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange({ location: keyword })}
            >
              {keyword}
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

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Professional insights and faster browsing enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Map View
          </Button>
        </div>
      </section>

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
                {viewMode === 'map' ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {locationInsights.map(item => (
                      <Card key={item.city} className="card-reveal border-border/70 bg-card/90">
                        <CardContent className="space-y-2 p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.city}</h3>
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                              {item.count} listings
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Avg rent {formatCurrency(item.avgRent)}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFilterChange({ location: item.city })}
                          >
                            Explore {item.city}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <RoomGrid rooms={displayedRooms} />
                )}
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border/70 bg-card/90 p-5">
          <h3 className="font-headline text-2xl font-semibold">Recently Viewed</h3>
          {recentRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Properties you open will appear here.</p>
          ) : (
            <div className="space-y-3">
              {recentRooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  className="w-full rounded-lg border border-border/70 p-3 text-left transition hover:border-accent/50 hover:bg-accent/5"
                >
                  <p className="font-medium">{room.title}</p>
                  <p className="text-sm text-muted-foreground">{room.location}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4 rounded-xl border border-border/70 bg-card/90 p-5">
          <h3 className="font-headline text-2xl font-semibold">Recommended For You</h3>
          {recommendedRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Recommendations will appear after browsing.</p>
          ) : (
            <div className="space-y-3">
              {recommendedRooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  className="w-full rounded-lg border border-border/70 p-3 text-left transition hover:border-accent/50 hover:bg-accent/5"
                >
                  <p className="font-medium">{room.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.location} • {room.averageRating.toFixed(1)} stars
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
