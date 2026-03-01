'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import {
  getPendingBookingsForAdmin,
  updateBookingStatus,
  type PendingBookingReview,
} from '@/lib/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function BookingRequestsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingBookingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || user.role !== 'admin') return;
      setIsLoading(true);
      try {
        const data = await getPendingBookingsForAdmin(user.id);
        setRequests(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load booking requests',
          description: error?.message || 'Something went wrong.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && user?.role === 'admin') {
      load();
    }
  }, [authLoading, isAuthenticated, user, toast]);

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      setRequests(prev => prev.filter(item => item.id !== bookingId));
      toast({
        title: `Booking ${status}`,
        description: 'Booking request status updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update booking',
        description: error?.message || 'Something went wrong.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Booking Requests</h1>
        <p className="mt-2 text-muted-foreground">Review payment screenshots and confirm transactions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <h3 className="text-xl font-semibold">No pending booking requests</h3>
          <p className="mt-2 text-sm text-muted-foreground">All booking requests are reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{request.room.title}</span>
                  <Badge variant="secondary">Pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Check-in: {request.checkIn.toLocaleDateString()}</p>
                  <p>Check-out: {request.checkOut.toLocaleDateString()}</p>
                  <p>User ID: {request.userId}</p>
                </div>

                {request.paymentScreenshotName ? (
                  <div>
                    <p className="text-sm font-medium">Payment Proof: {request.paymentScreenshotName}</p>
                    {request.paymentScreenshotUrl ? (
                      <div className="relative mt-2 h-44 w-72 overflow-hidden rounded-md border">
                        <Image
                          src={request.paymentScreenshotUrl}
                          alt={request.paymentScreenshotName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">Unable to generate preview URL.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No screenshot uploaded.</p>
                )}

                <div className="flex gap-2">
                  <Button
                    disabled={updatingId === request.id}
                    onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    disabled={updatingId === request.id}
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
