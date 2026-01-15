'use client';

import { AddRoomForm } from '@/components/AddRoomForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddRoomPage() {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!hasRole('admin')) {
        router.push('/'); // Redirect non-admins to home
      }
    }
  }, [isAuthenticated, isLoading, router, hasRole]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="mb-8 h-10 w-1/3" />
        <div className="space-y-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Add a New Room</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the details below to list your property on RoomBase.
        </p>
      </div>
      <AddRoomForm />
    </div>
  );
}
