
'use client';

import { useEffect, useState } from 'react';
import { getRoomById } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, MapPin, Users, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const fetchRoom = async (id: string) => {
      setIsLoading(true);
      const fetchedRoom = await getRoomById(id);
      if (!fetchedRoom) {
        notFound();
      }
      setRoom(fetchedRoom);
      setIsLoading(false);
    };

    if (params.id) {
      fetchRoom(params.id);
    }
  }, [params.id]);

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <div className="mt-4 hidden md:grid grid-cols-4 gap-4">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                     <Skeleton className="h-12 w-full mt-8" />
                </div>
            </div>
             <div className="mt-12">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
  }

  if (!room) {
    return null; 
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
           <Carousel className="w-full rounded-lg overflow-hidden border">
            <CarouselContent>
              {room.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video relative">
                    <Image
                      src={image.url}
                      alt={`${room.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {room.images.length > 1 && (
                <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                </>
            )}
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

              <div className="space-y-4 text-foreground">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5" />
                        <span>For</span>
                    </div>
                  <span className="font-semibold">{room.tenantPreference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="h-5 w-5" />
                    <span>Rent</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(room.rent)} / month</span>
                </div>
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
    </div>
  );
}
