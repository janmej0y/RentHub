'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AddRoomForm } from '@/components/AddRoomForm';
import { useAuthContext } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddRoomPage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  // 🔐 Protect route (Supabase Auth)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router, user]);

  // ⏳ Loading / redirect state
  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
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

  // ✅ Authenticated user
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">
          Add a New Room
        </h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the details below to list your property.
        </p>
      </div>

      <AddRoomForm />
    </div>
  );
}
