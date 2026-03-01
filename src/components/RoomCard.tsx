import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Room } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { IndianRupee, MapPin, Users, Heart, Star, Camera } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlistService';
import { useToast } from '@/hooks/use-toast';

interface RoomCardProps {
  room: Room;
  isPriority?: boolean;
}

export function RoomCard({ room, isPriority = true }: RoomCardProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await isInWishlist(user.id, room.id);
        setInWishlist(result);
      } catch {
        // Ignore wishlist errors in card rendering.
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
  const cardImageUrl = imageUrl.includes('images.unsplash.com')
    ? imageUrl.replace(/w=\d+/i, 'w=640').replace(/q=\d+/i, 'q=55')
    : imageUrl;
  const imageCaption = room.images?.[0]?.caption || 'Click to see full property details and all photos.';
  const shortDescription = room.description?.slice(0, 110) || 'Well-maintained property with practical layout.';
  const isRecent = Date.now() - room.createdAt.getTime() < 1000 * 60 * 60 * 24 * 3;

  return (
    <Card className="group h-full w-full overflow-hidden border-border/70 bg-card/90 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {!isImageLoaded && <div className="pulse-shimmer absolute inset-0 bg-muted/80" />}
          <Image
            src={cardImageUrl}
            alt={room.title}
            width={600}
            height={400}
            priority={isPriority}
            quality={60}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setIsImageLoaded(true)}
          />
          <div className="absolute left-2 top-2 flex items-center gap-2">
            {isRecent && <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">New</Badge>}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Camera className="h-3 w-3" /> {room.images.length}
            </Badge>
          </div>
          {isAuthenticated && !isLoading && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 rounded-full bg-background/60 hover:bg-background/80"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 text-destructive ${inWishlist ? 'fill-destructive' : 'fill-transparent'}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg">{room.title}</CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap">
            {room.propertyType}
          </Badge>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground/90">{imageCaption}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{room.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <IndianRupee className="h-4 w-4" />
            <span>{formatCurrency(room.rent)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{room.averageRating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{room.tenantPreference}</span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground/90">{shortDescription}</p>
      </CardContent>
    </Card>
  );
}

export default RoomCard;
