'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/context/AuthContext';
import { getMyRooms } from '@/lib/roomService';
import type { Room } from '@/types/room';

import { RoomCard } from '@/components/RoomCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
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
    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router, user]);

  // 📦 Fetch landlord's rooms
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'admin') {
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

  // ⏳ Loading / redirect state
  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
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
          <h1 className="font-headline text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your listed properties.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/add-room">
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
              <Skeleton className="h-6 w-3/g" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map(room => (
            <div key={room.id} className="relative group">
              <RoomCard room={room} />
              {/* Add actions here */}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-lg border-2 border-dashed border-border bg-card p-12">
          <h3 className="text-xl font-semibold">
            You haven't listed any rooms yet.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first property.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/add-room">
              <PlusCircle className="mr-2 h-4 w-4" />
              List a Room
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
