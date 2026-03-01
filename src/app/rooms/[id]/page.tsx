'use client';

import { useEffect, useState } from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import Image from 'next/image';
import { getRoomById } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, MapPin, Users, Phone, Star, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { addReview, getReviews } from '@/lib/reviewService';
import { addBooking, getRoomBookingStatus } from '@/lib/bookingService';
import { uploadPaymentScreenshot } from '@/lib/storageService';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

function StarRating({ rating, size = 5 }: { rating: number; size?: number }) {
  const sizeClass = `h-${size} w-${size}`;
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function ReviewForm({ roomId, onReviewAdded }: { roomId: string; onReviewAdded: () => void }) {
  const { user } = useAuthContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;
    setIsSubmitting(true);
    try {
      await addReview(user.id, roomId, rating, comment);
      onReviewAdded();
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Your Rating:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded border p-2"
            rows={4}
          />
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviewList({ reviews }: { reviews: Room['reviews'] }) {
  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{review.userName}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            <StarRating rating={review.rating} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = typeof params.id === 'string' ? params.id : '';

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const { isAuthenticated } = useAuthContext();

  const router = useRouter();

  const fetchRoom = async (id: string) => {
    setIsLoading(true);
    try {
      const fetchedRoom = await getRoomById(id);
      if (!fetchedRoom) {
        router.push('/404');
        return;
      }

      const extraReviews = await getReviews(id);
      const mergedReviews = [...fetchedRoom.reviews, ...extraReviews].filter(
        (review, index, all) => all.findIndex(item => item.id === review.id) === index
      );

      const averageRating =
        mergedReviews.length > 0
          ? mergedReviews.reduce((sum, review) => sum + review.rating, 0) / mergedReviews.length
          : fetchedRoom.averageRating;

      setRoom({
        ...fetchedRoom,
        reviews: mergedReviews,
        averageRating,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="mb-6 h-10 w-1/2" />
        <Skeleton className="h-[360px] w-full" />
      </div>
    );
  }

  if (!room) return null;

  const handleReviewAdded = () => {
    if (roomId) {
      fetchRoom(roomId);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
        <div className="md:col-span-3">
          <Carousel className="w-full rounded-lg border p-4">
            <CarouselContent>
              {room.images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <Image
                        src={image.url}
                        alt={image.caption || room.title}
                        fill
                        priority={index === 0}
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {image.caption || 'Property image'}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-headline text-3xl font-bold">{room.title}</h1>
                <Badge variant="secondary" className="mt-1 whitespace-nowrap">
                  {room.propertyType}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{room.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-foreground" />
                <span className="text-xl font-semibold">{formatCurrency(room.rent)}</span>
              </div>

              <div className="flex items-center gap-2">
                <StarRating rating={room.averageRating} />
                <span className="text-sm text-muted-foreground">({room.reviews.length} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4" />
                <span>Preferred: {room.tenantPreference}</span>
              </div>

              {showContact ? (
                <a href={`tel:${room.ownerContact}`}>
                  <Button variant="outline" className="mt-6 w-full">
                    <Phone className="mr-2 h-4 w-4" /> {room.ownerContact}
                  </Button>
                </a>
              ) : (
                <Button
                  onClick={() => setShowContact(true)}
                  className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Owner
                </Button>
              )}

              {isAuthenticated && (
                <div className="pt-4">
                  <BookingForm roomId={room.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-headline font-bold">Full Description</h2>
        <p className="leading-relaxed text-muted-foreground">
          {room.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-headline font-bold">Reviews</h2>
        {isAuthenticated && (
          <div className="mb-8">
            <ReviewForm roomId={room.id} onReviewAdded={handleReviewAdded} />
          </div>
        )}
        <ReviewList reviews={room.reviews} />
      </div>
    </div>
  );
}

function BookingForm({ roomId }: { roomId: string }) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'none' | 'pending' | 'confirmed'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const upiId = '7477661933@ptsbi';
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('RentHub')}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
  const today = new Date().toISOString().slice(0, 10);
  const minCheckOut = checkIn || today;

  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;
      const status = await getRoomBookingStatus(user.id, roomId);
      setBookingStatus(status);
    };

    loadStatus();
  }, [user, roomId]);

  const handleBooking = async () => {
    if (!user || !checkIn || !checkOut) {
      toast({
        variant: 'destructive',
        title: 'All fields are required',
      });
      return;
    }

    if (!paymentScreenshot) {
      toast({
        variant: 'destructive',
        title: 'Payment screenshot is required',
        description: 'Please upload your payment screenshot before submitting booking.',
      });
      return;
    }

    if (checkOut <= checkIn) {
      toast({
        variant: 'destructive',
        title: 'Invalid dates',
        description: 'Check-out must be after check-in.',
      });
      return;
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T00:00:00`);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      toast({
        variant: 'destructive',
        title: 'Invalid date format',
        description: 'Please select valid check-in and check-out dates.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedPayment = await uploadPaymentScreenshot(user.id, paymentScreenshot);
      await addBooking(
        user.id,
        roomId,
        checkInDate,
        checkOutDate,
        uploadedPayment.name,
        uploadedPayment.path
      );
      toast({
        title: 'Your booking is now on pending',
        description: 'After reviewing the transaction, it will be confirmed.',
      });
      setCheckIn('');
      setCheckOut('');
      setPaymentScreenshot(null);
      setIsBookingOpen(false);
      setBookingStatus('pending');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="mb-4 font-headline text-2xl font-bold">Book this room</h3>

      {bookingStatus === 'pending' ? (
        <Button className="w-full" disabled>
          After reviewing the transaction, it will be confirmed
        </Button>
      ) : bookingStatus === 'confirmed' ? (
        <Button className="w-full" disabled>
          Booking Confirmed
        </Button>
      ) : null}

      {bookingStatus !== 'none' ? null : !isBookingOpen ? (
        <Button onClick={() => setIsBookingOpen(true)} className="w-full">
          Booking Option
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium">Pay via UPI</p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Image
                src={qrUrl}
                alt="UPI QR code"
                width={120}
                height={120}
                unoptimized
                className="rounded-md border bg-white"
              />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">UPI ID</p>
                <p className="font-mono text-sm font-semibold">{upiId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-screenshot">Upload payment screenshot</Label>
            <Input
              id="payment-screenshot"
              type="file"
              accept="image/*"
              onChange={e => setPaymentScreenshot(e.target.files?.[0] || null)}
            />
            {paymentScreenshot ? (
              <p className="text-xs text-muted-foreground">
                Selected file: {paymentScreenshot.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                A screenshot is required to submit booking.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Check-in</Label>
              <Input
                type="date"
                min={today}
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <Label>Check-out</Label>
              <Input
                type="date"
                min={minCheckOut}
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBooking}
              className="flex-1"
              disabled={isSubmitting || !checkIn || !checkOut || !paymentScreenshot}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
