'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { getMyRooms, deleteRoom } from '@/lib/roomService';
import type { Room } from '@/types/room';

import { RoomCard } from '@/components/RoomCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { PlusCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';

export default function MyRoomsPage() {
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

  // 📦 Fetch logged-in user's rooms
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const fetchRooms = async () => {
        try {
          setIsLoading(true);
          const data = await getMyRooms(user.id);
          setRooms(data);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Failed to load rooms',
            description: error?.message || 'Something went wrong',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchRooms();
    }
  }, [authLoading, isAuthenticated, user, toast]);

  // 🗑 Delete room
  const handleDelete = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      toast({
        title: 'Room deleted',
        description: 'Your room listing has been removed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error?.message || 'Unable to delete room',
      });
    }
  };

  // ⏳ Loading / redirect state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold">My Rooms</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your listed properties.
          </p>
        </div>

        <Button asChild>
          <Link href="/add-room">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Room
          </Link>
        </Button>
      </div>

      {/* Content */}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map(room => (
            <div key={room.id} className="relative group">
              <RoomCard room={room} />

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" asChild>
                  {/* Edit route can be added later */}
                  <Link href="/add-room" title="Edit Room">
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive" />
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your room listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDelete(room.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-lg border-2 border-dashed border-border bg-card p-12">
          <h3 className="text-xl font-semibold">
            You haven&apos;t listed any rooms yet.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first property.
          </p>
          <Button asChild className="mt-4">
            <Link href="/add-room">
              <PlusCircle className="mr-2 h-4 w-4" />
              List a Room
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
