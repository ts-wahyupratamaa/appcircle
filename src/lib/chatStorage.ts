import AsyncStorage from '@react-native-async-storage/async-storage';

import { HATERS_ASIA_ID } from '../data/circles';
import { ChatMessage, STORAGE_KEYS } from '../types/circle';

const SEED_CHATS: Omit<ChatMessage, 'id' | 'createdAt'>[] = [
  {
    circleId: HATERS_ASIA_ID,
    type: 'text',
    authorId: 'aody.dev',
    authorName: 'aody.dev',
    text: 'woy haters-asia rame nih hari ini 🔥',
  },
  {
    circleId: HATERS_ASIA_ID,
    type: 'text',
    authorId: 'piki.dev',
    authorName: 'piki.dev',
    text: 'drop meme terbaik kalian',
  },
  {
    circleId: HATERS_ASIA_ID,
    type: 'text',
    authorId: 'sarah.qa',
    authorName: 'sarah.qa',
    text: 'ada bug? tag aku di postingan',
  },
];

function newId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMessage(raw: ChatMessage): ChatMessage {
  if (raw.type === 'image') {
    return raw;
  }
  if (raw.type === 'text') {
    return raw;
  }
  return {
    ...raw,
    type: 'text',
    text: raw.text ?? '',
  };
}

export async function loadChats(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.chats);
  if (!raw) {
    return [];
  }

  try {
    return (JSON.parse(raw) as ChatMessage[]).map(normalizeMessage);
  } catch {
    return [];
  }
}

async function saveChats(messages: ChatMessage[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(messages));
}

export async function ensureSeedChats(): Promise<ChatMessage[]> {
  const seeded = await AsyncStorage.getItem(STORAGE_KEYS.chatsSeeded);
  if (seeded === '1') {
    return loadChats();
  }

  const now = Date.now();
  const messages: ChatMessage[] = SEED_CHATS.map((msg, index) => ({
    ...msg,
    id: `seed-chat-${index}`,
    createdAt: new Date(now - (SEED_CHATS.length - index) * 120_000).toISOString(),
  }));

  await saveChats(messages);
  await AsyncStorage.setItem(STORAGE_KEYS.chatsSeeded, '1');
  return messages;
}

export async function addTextChatMessage(input: {
  circleId: string;
  authorId: string;
  authorName: string;
  text: string;
}): Promise<ChatMessage> {
  const messages = await loadChats();
  const message = createTextChatMessage(input);
  messages.push(message);
  await saveChats(messages);
  return message;
}

export function createTextChatMessage(input: {
  circleId: string;
  authorId: string;
  authorName: string;
  text: string;
}): ChatMessage {
  return {
    id: newId(),
    circleId: input.circleId,
    authorId: input.authorId,
    authorName: input.authorName,
    type: 'text',
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    synced: false,
  };
}

export async function queueChatMessage(message: ChatMessage): Promise<void> {
  const messages = await loadChats();
  messages.push(message);
  await saveChats(messages);
}

export async function markChatsSynced(ids: string[]): Promise<ChatMessage[]> {
  const messages = await loadChats();
  const idSet = new Set(ids);
  const updated = messages.map((msg) => (idSet.has(msg.id) ? { ...msg, synced: true } : msg));
  await saveChats(updated);
  return updated;
}

export async function addImageChatMessage(input: {
  circleId: string;
  authorId: string;
  authorName: string;
  imageUri: string;
  caption?: string;
}): Promise<ChatMessage> {
  const messages = await loadChats();
  const message: ChatMessage = {
    id: newId(),
    circleId: input.circleId,
    authorId: input.authorId,
    authorName: input.authorName,
    type: 'image',
    imageUri: input.imageUri,
    text: input.caption?.trim() || undefined,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  messages.push(message);
  await saveChats(messages);
  return message;
}

export function filterChatsByCircle(messages: ChatMessage[], circleId: string): ChatMessage[] {
  return messages
    .filter((msg) => msg.circleId === circleId && msg.type === 'text')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
