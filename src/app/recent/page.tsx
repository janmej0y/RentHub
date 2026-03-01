'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRooms } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { EmptyState } from '@/components/EmptyState';

const SAVED_SEARCHES_KEY = 'renthub-saved-searches';
const RECENT_ROOMS_KEY = 'renthub-recent-rooms';

export default function RecentPage() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [recentRoomIds, setRecentRoomIds] = useState<string[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

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
    getRooms({
      location: '',
      priceRange: [0, 50000],
      propertyType: [],
      tenantPreference: [],
      amenities: [],
      furnishingStatus: [],
      sortBy: 'date_desc',
    }).then(setAllRooms);
  }, []);

  const recentRooms = useMemo(() => {
    const roomMap = new Map(allRooms.map(room => [room.id, room]));
    return recentRoomIds.map(id => roomMap.get(id)).filter(Boolean) as Room[];
  }, [allRooms, recentRoomIds]);

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-headline text-4xl font-bold">Recent Activity</h1>
        <p className="mt-2 text-muted-foreground">Your saved searches and recently viewed properties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <EmptyState
              title="No saved searches yet"
              description="Save location searches from the homepage to see them here."
              actionLabel="Go to Home"
              onAction={() => router.push('/')}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedSearches.map(search => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/?location=${encodeURIComponent(search)}`)}
                >
                  {search}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently Viewed Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRooms.length === 0 ? (
            <EmptyState
              title="No recently viewed rooms"
              description="Open property detail pages to build your recent list."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentRooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  className="rounded-lg border border-border/70 p-4 text-left transition hover:border-accent/50 hover:bg-accent/5"
                >
                  <p className="font-medium">{room.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{room.location}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

