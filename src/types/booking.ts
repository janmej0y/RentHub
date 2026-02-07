import type { Room } from './room';

export interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  room: Room;
}
