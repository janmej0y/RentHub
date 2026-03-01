import type { RoomChatMessage } from '@/types/chat';

const CHAT_STORAGE_KEY = 'renthub-room-chats';

type StoredMessage = Omit<RoomChatMessage, 'createdAt'> & { createdAt: string };

function readChatStore(): StoredMessage[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredMessage[];
  } catch {
    return [];
  }
}

function writeChatStore(messages: StoredMessage[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

function toMessage(msg: StoredMessage): RoomChatMessage {
  return {
    ...msg,
    createdAt: new Date(msg.createdAt),
  };
}

function toStoredMessage(msg: RoomChatMessage): StoredMessage {
  return {
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  };
}

function createOwnerAutoReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('available') || lower.includes('vacant')) {
    return 'Yes, this property is currently available. You can proceed with booking.';
  }
  if (lower.includes('visit') || lower.includes('inspection')) {
    return 'Site visits are possible. Please share your preferred date and time.';
  }
  if (lower.includes('discount') || lower.includes('negoti')) {
    return 'The rent is mostly fixed, but we can discuss based on duration.';
  }
  if (lower.includes('deposit')) {
    return 'Security amount is assessed only if damages are found after move-out inspection.';
  }
  return 'Thanks for your message. I will review this and get back to you shortly.';
}

export async function getRoomChatMessages(roomId: string): Promise<RoomChatMessage[]> {
  const messages = readChatStore()
    .filter(item => item.roomId === roomId)
    .map(toMessage)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return messages;
}

export async function sendRoomChatMessage(input: {
  roomId: string;
  ownerId: string;
  senderId: string;
  senderName: string;
  text: string;
}): Promise<void> {
  const now = new Date();
  const messages = readChatStore();

  const userMessage: RoomChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomId: input.roomId,
    ownerId: input.ownerId,
    senderId: input.senderId,
    senderName: input.senderName,
    text: input.text.trim(),
    createdAt: now,
  };

  messages.push(toStoredMessage(userMessage));

  if (input.senderId !== input.ownerId) {
    const ownerReply: RoomChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId: input.roomId,
      ownerId: input.ownerId,
      senderId: input.ownerId,
      senderName: 'Owner',
      text: createOwnerAutoReply(input.text),
      createdAt: new Date(now.getTime() + 1000),
    };
    messages.push(toStoredMessage(ownerReply));
  }

  writeChatStore(messages);
}

