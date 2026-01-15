import Image from 'next/image';
import type { Room } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { IndianRupee, MapPin, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === 'room-1');

  const imageUrl =
    room.images?.[0]?.url ||
    placeholder?.imageUrl ||
    'https://picsum.photos/600/400';

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
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-headline font-semibold leading-tight">
            {room.title}
          </CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap">
            {room.propertyType}
          </Badge>
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
          <div className="flex items-center gap-1 text-lg font-bold text-foreground">
            <IndianRupee className="h-5 w-5" />
            <span>{formatCurrency(room.rent)}</span>
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
