'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/context/AuthContext';
import { getWishlist } from '@/lib/wishlistService';
import type { Room } from '@/types/room';

import { RoomGrid } from '@/components/RoomGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function MyWishlistPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 📦 Fetch user's wishlist
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const fetchWishlist = async () => {
        try {
          setIsLoading(true);
          const data = await getWishlist(user.id);
          setRooms(data);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Failed to load wishlist',
            description: error?.message || 'Something went wrong',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchWishlist();
    }
  }, [authLoading, isAuthenticated, user, toast]);

  // ⏳ Loading / redirect state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          Your saved properties.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <RoomGrid rooms={rooms} />
      ) : (
        <div className="text-center rounded-lg border-2 border-dashed border-border bg-card p-12">
          <h3 className="text-xl font-semibold">Your wishlist is empty.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start adding rooms to your wishlist to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
