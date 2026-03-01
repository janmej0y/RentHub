'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuthContext } from '@/context/AuthContext';
import { getBookings } from '@/lib/bookingService';
import type { Booking } from '@/types/booking';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';

function downloadBookingReceipt(booking: Booking) {
  const lines = [
    'RentHub Booking Receipt',
    '-----------------------',
    `Booking ID: ${booking.id}`,
    `Property: ${booking.room.title}`,
    `Location: ${booking.room.location}`,
    `Monthly Rent: ${formatCurrency(booking.room.rent)}`,
    `Check-in: ${new Date(booking.checkIn).toLocaleDateString('en-IN')}`,
    `Check-out: ${new Date(booking.checkOut).toLocaleDateString('en-IN')}`,
    `Status: ${booking.status === 'pending' ? 'Pending Review' : 'Confirmed'}`,
    `Generated At: ${new Date().toLocaleString('en-IN')}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-receipt-${booking.id}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'}>
                    {booking.status === 'pending' ? 'Pending Review' : 'Confirmed'}
                  </Badge>
                </div>
                <div className="mt-3 rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                  Timeline: Submitted {'->'} Payment Review {'->'} Confirmed
                </div>
                {booking.paymentScreenshotName ? (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Payment screenshot: {booking.paymentScreenshotName}
                    </p>
                    {booking.paymentScreenshotUrl ? (
                      <div className="relative mt-2 h-36 w-56 overflow-hidden rounded-md border">
                        <Image
                          src={booking.paymentScreenshotUrl}
                          alt={booking.paymentScreenshotName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => downloadBookingReceipt(booking)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
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
