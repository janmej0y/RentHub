'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoomById, updateRoom } from '@/lib/roomService';
import type { Room } from '@/types/room';
import { useAuthContext } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 📦 Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const data = await getRoomById(params.id);
        if (!data || data.ownerId !== user?.id) {
          toast({
            variant: 'destructive',
            title: 'Unauthorized',
            description: 'You are not the owner of this room.',
          });
          router.replace('/my-rooms');
          return;
        }
        setRoom(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load room',
          description: error?.message || 'Something went wrong',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRoom();
    }
  }, [params.id, user, router, toast]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      rent: Number(formData.get('rent')),
    };

    try {
      await updateRoom(room.id, updates);
      toast({
        title: 'Room updated',
        description: 'Your room listing has been updated.',
      });
      router.push('/my-rooms');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error?.message || 'Unable to update room',
      });
    }
  };

  if (isLoading || authLoading || !room) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="mb-8 h-10 w-1/3" />
        <div className="space-y-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Edit Room</h1>
        <p className="mt-2 text-muted-foreground">
          Update the details of your property.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={room.title} required />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={room.location} required />
        </div>
        <div>
          <Label htmlFor="rent">Rent</Label>
          <Input id="rent" name="rent" type="number" defaultValue={room.rent} required />
        </div>
        <Button type="submit">Update Room</Button>
      </form>
    </div>
  );
}
