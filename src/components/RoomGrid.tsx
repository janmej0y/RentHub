import type { Room } from '@/types/room';
import { RoomCard } from './RoomCard';
import Link from 'next/link';

interface RoomGridProps {
  rooms: Room[];
  comparedRoomIds?: string[];
  onCompareToggle?: (roomId: string) => void;
}

export function RoomGrid({ rooms, comparedRoomIds = [], onCompareToggle }: RoomGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map((room, index) => (
        <Link
          key={room.id}
          href={`/rooms/${room.id}`}
          prefetch={false}
          className="group card-reveal"
          style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
        >
          <RoomCard
            room={room}
            isPriority={index < 2}
            isCompared={comparedRoomIds.includes(room.id)}
            onCompareToggle={onCompareToggle}
          />
        </Link>
      ))}
    </div>
  );
}
