import type { Room } from '@/types/room';
import { RoomCard } from './RoomCard';
import Link from 'next/link';

interface RoomGridProps {
  rooms: Room[];
}

export function RoomGrid({ rooms }: RoomGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map(room => (
        <Link key={room.id} href={`/rooms/${room.id}`} className="group">
            <RoomCard room={room} />
        </Link>
      ))}
    </div>
  );
}
