'use client';

import { useEffect, useState } from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getRoomById, getRooms } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IndianRupee,
  MapPin,
  Users,
  Phone,
  Star,
  ArrowLeft,
  ShieldCheck,
  Clock3,
  ThumbsUp,
  Expand,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { addReview, getReviews } from '@/lib/reviewService';
import { addBooking, getRoomBookingStatus } from '@/lib/bookingService';
import { uploadPaymentScreenshot } from '@/lib/storageService';
import { getRoomChatMessages, sendRoomChatMessage } from '@/lib/chatService';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { RoomChatMessage } from '@/types/chat';

const RECENT_ROOMS_KEY = 'renthub-recent-rooms';
const REVIEW_HELPFUL_KEY = 'renthub-review-helpful-votes';

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
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'oldest'>('latest');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REVIEW_HELPFUL_KEY);
      setHelpfulVotes(raw ? (JSON.parse(raw) as Record<string, number>) : {});
    } catch {
      setHelpfulVotes({});
    }
  }, []);

  const voteHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => {
      const next = { ...prev, [reviewId]: (prev[reviewId] || 0) + 1 };
      window.localStorage.setItem(REVIEW_HELPFUL_KEY, JSON.stringify(next));
      return next;
    });
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  if (sortedReviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Verified renter reviews</p>
        <Select value={sortBy} onValueChange={value => setSortBy(value as 'latest' | 'highest' | 'oldest')}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Sort reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Most recent</SelectItem>
            <SelectItem value="highest">Highest rating</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {sortedReviews.map(review => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">{review.userName}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Verified Stay</Badge>
            </div>
            <StarRating rating={review.rating} />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">{review.comment}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => voteHelpful(review.id)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Helpful ({helpfulVotes[review.id] || 0})
            </Button>
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
  const [similarRooms, setSimilarRooms] = useState<Room[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);
  const { isAuthenticated, user } = useAuthContext();

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

      try {
        const city = fetchedRoom.location.split(',').slice(-1)[0]?.trim() || fetchedRoom.location;
        const related = await getRooms({
          location: city,
          priceRange: [0, 50000],
          propertyType: [],
          tenantPreference: [],
          amenities: [],
          furnishingStatus: [],
          sortBy: 'rating_desc',
        });
        setSimilarRooms(related.filter(item => item.id !== fetchedRoom.id).slice(0, 6));
      } catch {
        setSimilarRooms([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    try {
      const existing = window.localStorage.getItem(RECENT_ROOMS_KEY);
      const parsed = existing ? (JSON.parse(existing) as string[]) : [];
      const next = [roomId, ...parsed.filter(item => item !== roomId)].slice(0, 10);
      window.localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(next));
    } catch {
      // Ignore local storage issues.
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

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <Carousel className="w-full rounded-xl border bg-card/90 p-4 shadow-sm">
            <CarouselContent>
              {room.images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedImage({ url: image.url, caption: image.caption || room.title })}
                      className="group relative aspect-video w-full overflow-hidden rounded-md bg-muted"
                    >
                      {(() => {
                        const detailImageUrl = image.url.includes('images.unsplash.com')
                          ? image.url.replace(/w=\d+/i, 'w=1000').replace(/q=\d+/i, 'q=65')
                          : image.url;
                        return (
                          <Image
                            src={detailImageUrl}
                            alt={image.caption || room.title}
                            fill
                            priority={index === 0}
                            quality={70}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 60vw"
                          />
                        );
                      })()}
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/65 px-2 py-1 text-xs text-white">
                        <Expand className="h-3 w-3" />
                        Fullscreen
                      </span>
                    </button>
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
          <Card className="md:sticky md:top-24">
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

              <div className="grid grid-cols-1 gap-2 rounded-lg border bg-muted/25 p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Verified listing with documented ownership details
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-accent" />
                  Availability updates are reviewed daily
                </p>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {isAuthenticated && (
        <section className="mt-8">
          <Card className="border-border/70 bg-card/95">
            <CardContent className="p-6">
              <BookingForm room={room} />
            </CardContent>
          </Card>
        </section>
      )}

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/70 bg-card/95">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-headline font-bold">Full Description</h2>
            <p className="leading-relaxed text-muted-foreground">
              {room.description || 'No description provided.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="space-y-3 p-6 text-sm">
            <h3 className="font-semibold">Property Highlights</h3>
            <p className="text-muted-foreground">Type: {room.propertyType}</p>
            <p className="text-muted-foreground">Tenant Preference: {room.tenantPreference}</p>
            <p className="text-muted-foreground">Location: {room.location}</p>
            <p className="text-muted-foreground">Rent: {formatCurrency(room.rent)}</p>
            <p className="text-muted-foreground">Rating: {room.averageRating.toFixed(1)}</p>
            {room.amenities && room.amenities.length > 0 ? (
              <div>
                <p className="mb-1 text-muted-foreground">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-headline font-bold">Reviews</h2>
        {isAuthenticated && (
          <div className="mb-8">
            <ReviewForm roomId={room.id} onReviewAdded={handleReviewAdded} />
          </div>
        )}
        <ReviewList reviews={room.reviews} />
      </section>

      {isAuthenticated && user && (
        <section className="mt-10">
          <ChatPanel room={room} currentUserId={user.id} currentUserName={user.name || 'You'} />
        </section>
      )}

      {similarRooms.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-headline font-bold">Similar Properties</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similarRooms.map(item => (
              <Link
                key={item.id}
                href={`/rooms/${item.id}`}
                prefetch={false}
                className="card-reveal rounded-xl border border-border/70 bg-card/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.location}</p>
                <p className="mt-2 text-sm font-medium">{formatCurrency(item.rent)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Dialog open={Boolean(selectedImage)} onOpenChange={open => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl border-none bg-black/90 p-2">
          <DialogTitle className="sr-only">
            {selectedImage ? `Fullscreen image for ${room.title}` : 'Fullscreen room image'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedImage?.caption || 'Room image preview in fullscreen mode.'}
          </DialogDescription>
          {selectedImage ? (
            <div className="space-y-3">
              <div className="relative h-[72vh] w-full overflow-hidden rounded">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="px-2 pb-2 text-sm text-white/85">{selectedImage.caption}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingForm({ room }: { room: Room }) {
  const roomId = room.id;
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOutDateTime, setCheckOutDateTime] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'none' | 'pending' | 'confirmed'>('none');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const upiId = '7477661933@ptsbi';
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('RentHub')}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
  const today = new Date().toISOString().slice(0, 10);
  const minCheckOutDateTime = `${checkIn || today}T00:00`;
  const nights = checkIn && checkOutDateTime
    ? Math.max(
        0,
        Math.ceil(
          (new Date(checkOutDateTime).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;
  const estimatedTotal = nights > 0 ? Math.round((room.rent / 30) * nights) : 0;
  const utilities = nights > 0 ? Math.round(nights * 120) : 0;
  const platformFee = nights > 0 ? Math.round(Math.max(199, estimatedTotal * 0.015)) : 0;
  const grandTotal = estimatedTotal + utilities + platformFee;
  const blockedDateRanges = [
    `${new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)} to ${
      new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10)
    }`,
    `${new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10)} to ${
      new Date(Date.now() + 11 * 86400000).toISOString().slice(0, 10)
    }`,
  ];

  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;
      const status = await getRoomBookingStatus(user.id, roomId);
      setBookingStatus(status);
    };

    loadStatus();
  }, [user, roomId]);

  const handleBooking = async () => {
    if (!user || !checkIn || !checkOutDateTime) {
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

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(checkOutDateTime);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      toast({
        variant: 'destructive',
        title: 'Invalid date format',
        description: 'Please select valid check-in and check-out date-time.',
      });
      return;
    }
    if (checkOutDate <= checkInDate) {
      toast({
        variant: 'destructive',
        title: 'Invalid checkout',
        description: 'Check-out date and time must be after check-in date.',
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
      setCheckOutDateTime('');
      setPaymentScreenshot(null);
      setIsBookingOpen(false);
      setStep(1);
      setBookingStatus('pending');
    } catch (error: any) {
      toast({
        title: 'Booking submitted',
        description: 'After reviewing the payment details, it will be confirmed soon.',
      });
      setCheckIn('');
      setCheckOutDateTime('');
      setPaymentScreenshot(null);
      setIsBookingOpen(false);
      setStep(1);
      setBookingStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4 font-headline text-2xl font-bold">Book this room</h3>

      {bookingStatus === 'pending' ? (
        <div className="space-y-3">
          <Button className="w-full" disabled>
            After reviewing the transaction, it will be confirmed
          </Button>
          <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800">
            Booking timeline: Submitted {'->'} Payment Review {'->'} Confirmed
          </div>
        </div>
      ) : bookingStatus === 'confirmed' ? (
        <div className="space-y-3">
          <Button className="w-full" disabled>
            Booking Confirmed
          </Button>
          <div className="rounded-md border border-emerald-300/60 bg-emerald-50 p-3 text-sm text-emerald-800">
            Booking timeline: Submitted {'->'} Payment Review {'->'} Confirmed
          </div>
        </div>
      ) : null}

      {bookingStatus !== 'none' ? null : !isBookingOpen ? (
        <Button onClick={() => setIsBookingOpen(true)} className="w-full">
          Booking Option
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" size="sm" variant={step === 1 ? 'default' : 'outline'} onClick={() => setStep(1)}>
                1. Dates
              </Button>
              <Button type="button" size="sm" variant={step === 2 ? 'default' : 'outline'} onClick={() => setStep(2)}>
                2. Payment
              </Button>
              <Button type="button" size="sm" variant={step === 3 ? 'default' : 'outline'} onClick={() => setStep(3)}>
                3. Submit
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card/80 p-4 text-sm">
            <p className="font-medium">Booking Summary</p>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>Property: {room.title}</p>
              <p>Monthly Rent: {formatCurrency(room.rent)}</p>
              <p>Nights: {nights || 0}</p>
              <p>Stay Charges: {estimatedTotal > 0 ? formatCurrency(estimatedTotal) : '-'}</p>
              <p>Utilities: {utilities > 0 ? formatCurrency(utilities) : '-'}</p>
              <p>Platform Fee: {platformFee > 0 ? formatCurrency(platformFee) : '-'}</p>
              <p>Security Deposit: Charged only if damaged products are found after inspection.</p>
              <p className="font-medium text-foreground">
                Payable Now: {estimatedTotal > 0 ? formatCurrency(grandTotal) : '-'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 text-sm">
            <p className="font-medium">Availability Calendar (Preview)</p>
            <p className="mt-1 text-xs text-muted-foreground">These upcoming dates are currently blocked:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {blockedDateRanges.map(range => (
                <span key={range} className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                  {range}
                </span>
              ))}
            </div>
          </div>

          {step === 1 && (
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
                  type="datetime-local"
                  min={minCheckOutDateTime}
                  value={checkOutDateTime}
                  onChange={e => setCheckOutDateTime(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose exact checkout date and time.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
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
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Rental Agreement Preview</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Booking is subject to payment verification and owner approval.</li>
                <li>Security deposit is refundable as per move-out condition policy.</li>
                <li>Cancellation within 24 hours of check-in may attract partial charges.</li>
                <li>Misuse, damages, or policy violations can lead to booking cancellation.</li>
              </ul>
              <label className="mt-2 flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs">
                  I agree to the digital rental agreement and confirm the provided booking details are accurate.
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && (!checkIn || !checkOutDateTime)) {
                    toast({
                      variant: 'destructive',
                      title: 'Select check-in and exact checkout date-time',
                    });
                    return;
                  }
                  if (step === 2 && !paymentScreenshot) {
                    toast({
                      variant: 'destructive',
                      title: 'Upload payment screenshot first',
                    });
                    return;
                  }
                  if (step === 3 && !agreed) {
                    toast({
                      variant: 'destructive',
                      title: 'Agreement consent required',
                      description: 'Please accept the rental agreement before submitting.',
                    });
                    return;
                  }
                  setStep((step + 1) as 1 | 2 | 3);
                }}
              >
                Next Step
              </Button>
            ) : null}

            <Button
              onClick={handleBooking}
              className="flex-1"
              disabled={isSubmitting || !checkIn || !checkOutDateTime || !paymentScreenshot || !agreed || step !== 3}
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

function ChatPanel({
  room,
  currentUserId,
  currentUserName,
}: {
  room: Room;
  currentUserId: string;
  currentUserName: string;
}) {
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    const rows = await getRoomChatMessages(room.id);
    setMessages(rows);
  };

  useEffect(() => {
    loadMessages();
  }, [room.id]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    setIsSending(true);
    try {
      await sendRoomChatMessage({
        roomId: room.id,
        ownerId: room.ownerId,
        senderId: currentUserId,
        senderName: currentUserName,
        text,
      });
      setDraft('');
      await loadMessages();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-headline font-bold">
            <MessageCircle className="h-5 w-5 text-accent" />
            Chat With Owner
          </h2>
          <span className="text-xs text-muted-foreground">Room ID: {room.id}</span>
        </div>

        <div className="max-h-72 space-y-3 overflow-y-auto rounded-md border bg-muted/15 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Start the conversation with the owner about availability, visit time, or rent details.
            </p>
          ) : (
            messages.map(msg => {
              const mine = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      mine ? 'bg-accent text-accent-foreground' : 'bg-background border'
                    }`}
                  >
                    <p className="text-xs opacity-80">{mine ? 'You' : msg.senderName}</p>
                    <p>{msg.text}</p>
                    <p className="mt-1 text-[10px] opacity-70">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type a message to owner..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={isSending || draft.trim().length === 0}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
