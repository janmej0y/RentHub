export interface RoomChatMessage {
  id: string;
  roomId: string;
  ownerId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

