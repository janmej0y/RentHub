'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/context/AuthContext';
import { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function ApprovalsPage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router, user]);

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('approved', false);

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setRooms(data as Room[]);
      }
    }

    if (user?.role === 'admin') {
      fetchRooms();
    }
  }, [user]);

  const approveRoom = async (roomId: string) => {
    const { error } = await supabase
      .from('rooms')
      .update({ approved: true })
      .eq('id', roomId);

    if (error) {
      toast({
        title: 'Error approving room',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setRooms(rooms.filter((room) => room.id !== roomId));
      toast({
        title: 'Room approved',
        description: 'The room has been successfully approved.',
      });
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-headline text-4xl font-bold mb-8">Approve Rooms</h1>
      <div className="grid gap-6">
        {rooms.length === 0 ? (
          <p>No rooms to approve.</p>
        ) : (
          rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{room.description}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => approveRoom(room.id)}>Approve</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
