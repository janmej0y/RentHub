import Image from 'next/image';
import type { Room } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { IndianRupee, MapPin, BedDouble, Users, Building } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === 'room-1');
  
  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={room.images[0]?.url || placeholder?.imageUrl || "https://picsum.photos/seed/1/600/400"}
            alt={room.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint="apartment interior"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-headline font-semibold leading-tight pr-2">
              {room.title}
            </CardTitle>
            <Badge variant="secondary" className="whitespace-nowrap flex-shrink-0">{room.propertyType}</Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{room.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>For {room.tenantPreference}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 font-bold text-lg text-foreground">
            <IndianRupee className="h-5 w-5" />
            <span>{formatCurrency(room.rent)}</span>
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
