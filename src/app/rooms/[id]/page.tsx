'use client';

import { useEffect, useState } from 'react';
import { getRoomById } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, MapPin, Users, Phone, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { addReview } from '@/lib/reviewService';
import { addBooking } from '@/lib/bookingService';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Carousel } from '@/components/ui/carousel'; // Adjust the path based on your project structure

const StarRating = ({ rating, size = 5 }: { rating: number, size?: number }) => {
    const sizeClass = `h-${size} w-${size}`;
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`${sizeClass} ${
                        i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
};

const ReviewForm = ({ roomId, onReviewAdded }: { roomId: string, onReviewAdded: () => void }) => {
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
        } catch (error) {
            console.error(error);
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
                                className={`h-6 w-6 cursor-pointer ${
                                    i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                                onClick={() => setRating(i + 1)}
                            />
                        ))}
                        </div>
                    </div>
                    <div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full p-2 border rounded"
                            rows={4}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const ReviewList = ({ reviews }: { reviews: Room['reviews'] }) => {
    return (
        <div className="space-y-6">
            {reviews.map((review) => (
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
};

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const { isAuthenticated } = useAuthContext();

  const router = useRouter();

  const fetchRoom = async (id: string) => {
    setIsLoading(true);
    const fetchedRoom = await getRoomById(id);
    if (!fetchedRoom) {
      router.push('/404');
      return;
    }
    setRoom(fetchedRoom);
    setIsLoading(false);
  };

  useEffect(() => {
    if (params.id) {
      fetchRoom(params.id);
    }
  }, [params.id]);

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            {/* ... skeleton code */}
        </div>
    );
  }

  if (!room) {
    return null; 
  }

  const handleReviewAdded = () => {
    fetchRoom(params.id);
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
           <Carousel className="w-full rounded-lg overflow-hidden border">
            {/* ... carousel code */}
          </Carousel>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="font-headline text-3xl font-bold">{room.title}</h1>
                    <Badge variant="secondary" className="whitespace-nowrap mt-1">{room.propertyType}</Badge>
                </div>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="h-4 w-4" />
                <span>{room.location}</span>
              </div>

                <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={room.averageRating} />
                    <span className="text-muted-foreground text-sm">({room.reviews.length} reviews)</span>
                </div>

              <div className="space-y-4 text-foreground">
                {/* ... room details */}
              </div>
              
              {showContact ? (
                <a href={`tel:${room.ownerContact}`}>
                  <Button variant="outline" className="w-full mt-8">
                    <Phone className="mr-2 h-4 w-4" /> {room.ownerContact}
                  </Button>
                </a>
              ) : (
                <Button onClick={() => setShowContact(true)} className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Phone className="mr-2 h-4 w-4"/> Contact Owner
                </Button>
              )}

                {isAuthenticated && (
                    <div className="mt-4">
                        <BookingForm roomId={room.id} />
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-headline font-bold mb-4">About this property</h2>
        <p className="text-muted-foreground leading-relaxed">
          {room.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-headline font-bold mb-4">Reviews</h2>
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

const BookingForm = ({ roomId }: { roomId: string }) => {
    const { user } = useAuthContext();
    const { toast } = useToast();
    const [checkIn, setCheckIn] = useState<Date | undefined>();
    const [checkOut, setCheckOut] = useState<Date | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBooking = async () => {
        if (!user || !checkIn || !checkOut) {
            toast({
                variant: 'destructive',
                title: 'All fields are required',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await addBooking(user.id, roomId, checkIn, checkOut);
            toast({
                title: 'Booking successful!',
                description: 'Payment gateway will be integrated later.',
            });
            setCheckIn(undefined);
            setCheckOut(undefined);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-headline font-bold mb-4">Book this room</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Check-in</Label>
                        <Input type="date" value={checkIn?.toISOString().split('T')[0]} onChange={(e) => setCheckIn(new Date(e.target.value))} />
                    </div>
                    <div>
                        <Label>Check-out</Label>
                        <Input type="date" value={checkOut?.toISOString().split('T')[0]} onChange={(e) => setCheckOut(new Date(e.target.value))} />
                    </div>
                </div>
                <Button onClick={handleBooking} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Booking...' : 'Book Now'}
                </Button>
            </div>
        </div>
    )
}

