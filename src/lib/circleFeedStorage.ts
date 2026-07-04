import AsyncStorage from '@react-native-async-storage/async-storage';

import { HATERS_ASIA_ID } from '../data/circles';
import { PostIllustration } from '../data/mockPosts';
import { cardPastels, colors } from '../theme';
import { CircleFeedItem, STORAGE_KEYS } from '../types/circle';

const ILLUSTRATIONS: PostIllustration[] = ['dog', 'polaroid', 'gift'];

const SEED_FEED: Omit<CircleFeedItem, 'id' | 'createdAt' | 'synced'>[] = [
  {
    circleId: HATERS_ASIA_ID,
    tag: '#haters-asia',
    cardColor: colors.cardMint,
    illustration: 'dog',
    authorId: 'meita.bl',
    authorName: 'meita.bl',
  },
  {
    circleId: HATERS_ASIA_ID,
    tag: '#haters-asia',
    cardColor: colors.cardLavender,
    illustration: 'polaroid',
    authorId: 'sshdkey.dev',
    authorName: 'sshdkey.dev',
  },
];

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pickCardColor(index: number): string {
  return cardPastels[index % cardPastels.length];
}

function pickIllustration(index: number): PostIllustration {
  return ILLUSTRATIONS[index % ILLUSTRATIONS.length];
}

export async function loadCircleFeed(): Promise<CircleFeedItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.circleFeed);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as CircleFeedItem[];
  } catch {
    return [];
  }
}

async function saveCircleFeed(items: CircleFeedItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.circleFeed, JSON.stringify(items));
}

export async function ensureSeedCircleFeed(): Promise<CircleFeedItem[]> {
  const seeded = await AsyncStorage.getItem(STORAGE_KEYS.circleFeedSeeded);
  if (seeded === '1') {
    return loadCircleFeed();
  }

  const now = Date.now();
  const items: CircleFeedItem[] = SEED_FEED.map((item, index) => ({
    ...item,
    id: `feed-seed-${index}`,
    createdAt: new Date(now - index * 3_600_000).toISOString(),
    synced: true,
  }));

  await saveCircleFeed(items);
  await AsyncStorage.setItem(STORAGE_KEYS.circleFeedSeeded, '1');
  return items;
}

export async function addCircleFeedItem(input: {
  circleId: string;
  tag: string;
  imageUri: string;
  authorId: string;
  authorName: string;
}): Promise<CircleFeedItem> {
  const items = await loadCircleFeed();
  const item = createCircleFeedItem(input, items.length);
  items.unshift(item);
  await saveCircleFeed(items);
  return item;
}

export function createCircleFeedItem(
  input: {
    circleId: string;
    tag: string;
    imageUri: string;
    authorId: string;
    authorName: string;
  },
  index: number,
): CircleFeedItem {
  return {
    id: newId(),
    circleId: input.circleId,
    tag: input.tag,
    imageUri: input.imageUri,
    cardColor: pickCardColor(index),
    illustration: pickIllustration(index),
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: new Date().toISOString(),
    synced: false,
  };
}

export async function queueCircleFeedItem(item: CircleFeedItem): Promise<void> {
  const items = await loadCircleFeed();
  items.unshift(item);
  await saveCircleFeed(items);
}

export async function markCircleFeedSynced(ids: string[]): Promise<CircleFeedItem[]> {
  const idSet = new Set(ids);
  const items = await loadCircleFeed();
  const updated = items.map((item) => (idSet.has(item.id) ? { ...item, synced: true } : item));
  await saveCircleFeed(updated);
  return updated;
}

export function filterCircleFeedByCircle(items: CircleFeedItem[], circleId: string): CircleFeedItem[] {
  return items.filter((item) => item.circleId === circleId);
}

export function filterCircleFeedByJoinedCircles(
  items: CircleFeedItem[],
  joinedCircleIds: string[],
): CircleFeedItem[] {
  const allowed = new Set(joinedCircleIds);
  return items.filter((item) => allowed.has(item.circleId));
}

export function countPendingCircleFeedSync(items: CircleFeedItem[]): number {
  return items.filter((item) => !item.synced).length;
}
