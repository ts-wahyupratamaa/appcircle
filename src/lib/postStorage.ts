import AsyncStorage from '@react-native-async-storage/async-storage';

import { cardPastels, colors } from '../theme';
import { PostIllustration } from '../data/mockPosts';
import { HATERS_ASIA_ID } from '../data/circles';
import { STORAGE_KEYS, StoredPost } from '../types/circle';

const ILLUSTRATIONS: PostIllustration[] = ['dog', 'polaroid', 'gift'];

const SEED_POSTS: Omit<StoredPost, 'id' | 'createdAt' | 'synced'>[] = [
  {
    circleId: HATERS_ASIA_ID,
    tag: '#haters-asia',
    caption: 'circle resmi haters-asia — gas 🔥',
    cardColor: colors.cardMint,
    illustration: 'dog',
    authorId: 'aody.dev',
    authorName: 'aody.dev',
  },
  {
    circleId: HATERS_ASIA_ID,
    tag: '#haters-asia',
    caption: 'drop meme terbaik kalian di sini',
    cardColor: colors.cardLavender,
    illustration: 'polaroid',
    authorId: 'piki.dev',
    authorName: 'piki.dev',
  },
  {
    circleId: HATERS_ASIA_ID,
    tag: '#haters-asia',
    caption: 'QA session: ada bug? tag aku',
    cardColor: colors.cardYellow,
    illustration: 'gift',
    authorId: 'sarah.qa',
    authorName: 'sarah.qa',
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

export async function loadPosts(): Promise<StoredPost[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.posts);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredPost[];
  } catch {
    return [];
  }
}

async function savePosts(posts: StoredPost[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

export async function ensureSeedPosts(): Promise<StoredPost[]> {
  const seeded = await AsyncStorage.getItem(STORAGE_KEYS.seeded);
  if (seeded === '1') {
    return loadPosts();
  }

  const now = Date.now();
  const posts: StoredPost[] = SEED_POSTS.map((post, index) => ({
    ...post,
    id: `seed-${index}`,
    createdAt: new Date(now - index * 86_400_000).toISOString(),
    synced: true,
  }));

  await savePosts(posts);
  await AsyncStorage.setItem(STORAGE_KEYS.seeded, '1');
  return posts;
}

export async function addPost(input: {
  circleId: string;
  tag: string;
  caption: string;
  imageUri?: string;
  authorId: string;
  authorName: string;
}): Promise<StoredPost> {
  const posts = await loadPosts();
  const post = createPostRecord(input, posts.length);
  posts.unshift(post);
  await savePosts(posts);
  return post;
}

export function createPostRecord(
  input: {
    circleId: string;
    tag: string;
    caption: string;
    imageUri?: string;
    authorId: string;
    authorName: string;
  },
  index: number,
): StoredPost {
  return {
    id: newId(),
    circleId: input.circleId,
    tag: input.tag,
    caption: input.caption.trim(),
    imageUri: input.imageUri,
    cardColor: pickCardColor(index),
    illustration: pickIllustration(index),
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: new Date().toISOString(),
    synced: false,
  };
}

export async function queuePost(post: StoredPost): Promise<void> {
  const posts = await loadPosts();
  posts.unshift(post);
  await savePosts(posts);
}

export async function markPostsSynced(ids: string[]): Promise<StoredPost[]> {
  const idSet = new Set(ids);
  const posts = await loadPosts();
  const updated = posts.map((post) =>
    idSet.has(post.id) ? { ...post, synced: true } : post,
  );
  await savePosts(updated);
  return updated;
}

export function filterPostsByCircle(posts: StoredPost[], circleId: string): StoredPost[] {
  return posts
    .filter((post) => post.circleId === circleId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function filterPostsByJoinedCircles(
  posts: StoredPost[],
  joinedCircleIds: string[],
): StoredPost[] {
  const allowed = new Set(joinedCircleIds);
  return posts.filter((post) => allowed.has(post.circleId));
}

export function countPendingSync(posts: StoredPost[]): number {
  return posts.filter((post) => !post.synced).length;
}
