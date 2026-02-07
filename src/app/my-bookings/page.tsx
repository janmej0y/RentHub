'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/context/AuthContext';
import { getBookings } from '@/lib/bookingService';
import type { Booking } from '@/types/booking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function MyBookingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 📦 Fetch user's bookings
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const fetchBookings = async () => {
        try {
          setIsLoading(true);
          const data = await getBookings(user.id);
          setBookings(data);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Failed to load bookings',
            description: error?.message || 'Something went wrong',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookings();
    }
  }, [authLoading, isAuthenticated, user, toast]);

  // ⏳ Loading / redirect state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Your upcoming and past stays.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map(booking => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{booking.room.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-lg border-2 border-dashed border-border bg-card p-12">
          <h3 className="text-xl font-semibold">You have no bookings yet.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start exploring and book your next stay.
          </p>
        </div>
      )}
    </div>
  );
}
