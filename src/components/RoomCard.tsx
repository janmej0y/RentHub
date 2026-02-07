import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Room } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { IndianRupee, MapPin, Users, Heart } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useAuthContext } from '@/context/AuthContext';
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from '@/lib/wishlistService';
import { useToast } from '@/hooks/use-toast';



interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {

  const { user, isAuthenticated } = useAuthContext();

  const { toast } = useToast();

  const [inWishlist, setInWishlist] = useState(false);

  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {

    async function checkWishlist() {

      if (!user) {

        setIsLoading(false);

        return;

      }

      try {

        const result = await isInWishlist(user.id, room.id);

        setInWishlist(result);

      } catch (error) {

        // Handle error silently for now

      } finally {

        setIsLoading(false);

      }

    }

    checkWishlist();

  }, [user, room.id]);



  const handleWishlistToggle = async (e: React.MouseEvent) => {

    e.preventDefault();

    if (!user) return;



    try {

      if (inWishlist) {

        await removeFromWishlist(user.id, room.id);

        setInWishlist(false);

        toast({ title: 'Removed from wishlist' });

      } else {

        await addToWishlist(user.id, room.id);

        setInWishlist(true);

        toast({ title: 'Added to wishlist' });

      }

    } catch (error: any) {

      toast({

        variant: 'destructive',

        title: 'Something went wrong',

        description: error.message,

      });

    }

  };



  const placeholder = PlaceHolderImages.find(p => p.id === 'room-1');

  const imageUrl = room.images?.[0]?.url || placeholder?.imageUrl || 'https://picsum.photos/600/400';



  return (

    <Card className="group w-full h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={room.title}
            width={600}
            height={400}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isAuthenticated && !isLoading && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 rounded-full bg-background/60 hover:bg-background/80"
              onClick={handleWishlistToggle}
            >
              <Heart
                className={`h-5 w-5 text-destructive ${inWishlist ? 'fill-destructive' : 'fill-transparent'}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      {/* ... (rest of the component) */}
    </Card>
)};


export default RoomCard;