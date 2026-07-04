import { isCloudBackend } from './cloudMode';
import {
  countPendingCircleFeedSync,
  loadCircleFeed,
  markCircleFeedSynced,
} from './circleFeedStorage';
import { loadChats, markChatsSynced } from './chatStorage';
import { pushChatMessage, pushFeedItem, pushPost } from './firebaseDb';
import { filterActiveCircleFeed, purgeExpiredCircleFeed } from './feedExpiry';
import {
  countPendingSync,
  loadPosts,
  markPostsSynced,
} from './postStorage';
import { IntroDraft, loadDrafts, markDraftsSynced } from './introStorage';

export type SyncResult = {
  syncedCount: number;
  posts: Awaited<ReturnType<typeof loadPosts>>;
  circleFeed: Awaited<ReturnType<typeof loadCircleFeed>>;
  chats: Awaited<ReturnType<typeof loadChats>>;
};

async function pushPendingToCloud(): Promise<SyncResult> {
  const [posts, circleFeed, chats] = await Promise.all([
    loadPosts(),
    loadCircleFeed(),
    loadChats(),
  ]);

  const pendingPosts = posts.filter((post) => !post.synced);
  const pendingFeed = filterActiveCircleFeed(circleFeed.filter((item) => !item.synced));
  const pendingChats = chats.filter((chat) => chat.synced === false);

  for (const post of pendingPosts) {
    await pushPost(post);
  }
  for (const item of pendingFeed) {
    await pushFeedItem(item);
  }
  for (const chat of pendingChats) {
    await pushChatMessage(chat);
  }

  const expiredFeed = circleFeed.filter((item) => !filterActiveCircleFeed([item]).length);
  if (expiredFeed.length > 0) {
    const circleId = expiredFeed[0]?.circleId;
    if (circleId) {
      await purgeExpiredCircleFeed(circleId, expiredFeed);
    }
  }

  const syncedCount = pendingPosts.length + pendingFeed.length + pendingChats.length;

  const [updatedPosts, updatedFeed, updatedChats] = await Promise.all([
    pendingPosts.length > 0 ? markPostsSynced(pendingPosts.map((p) => p.id)) : posts,
    pendingFeed.length > 0 ? markCircleFeedSynced(pendingFeed.map((f) => f.id)) : circleFeed,
    pendingChats.length > 0 ? markChatsSynced(pendingChats.map((c) => c.id)) : chats,
  ]);

  return { syncedCount, posts: updatedPosts, circleFeed: updatedFeed, chats: updatedChats };
}

/** Push offline queue ke Firestore, atau no-op dummy lokal */
export async function syncPendingPosts(): Promise<SyncResult> {
  const [posts, circleFeed] = await Promise.all([loadPosts(), loadCircleFeed()]);

  if (isCloudBackend()) {
    return pushPendingToCloud();
  }

  const pendingPostIds = posts.filter((post) => !post.synced).map((post) => post.id);
  const pendingFeedIds = circleFeed.filter((item) => !item.synced).map((item) => item.id);

  if (pendingPostIds.length === 0 && pendingFeedIds.length === 0) {
    return { syncedCount: 0, posts, circleFeed, chats: await loadChats() };
  }

  const [updatedPosts, updatedFeed] = await Promise.all([
    pendingPostIds.length > 0 ? markPostsSynced(pendingPostIds) : posts,
    pendingFeedIds.length > 0 ? markCircleFeedSynced(pendingFeedIds) : circleFeed,
  ]);

  return {
    syncedCount: pendingPostIds.length + pendingFeedIds.length,
    posts: updatedPosts,
    circleFeed: updatedFeed,
    chats: await loadChats(),
  };
}

/** @deprecated legacy draft sync */
export async function syncPendingDrafts(): Promise<{
  syncedCount: number;
  drafts: IntroDraft[];
}> {
  const drafts = await loadDrafts();
  const pendingIds = drafts.filter((draft) => !draft.synced).map((draft) => draft.id);

  if (pendingIds.length === 0) {
    return { syncedCount: 0, drafts };
  }

  const updated = await markDraftsSynced(pendingIds);
  return { syncedCount: pendingIds.length, drafts: updated };
}

export function countAllPendingSync(
  posts: Awaited<ReturnType<typeof loadPosts>>,
  circleFeed: Awaited<ReturnType<typeof loadCircleFeed>>,
  chats: Awaited<ReturnType<typeof loadChats>> = [],
): number {
  const pendingChats = chats.filter((chat) => chat.synced === false).length;
  return countPendingSync(posts) + countPendingCircleFeedSync(circleFeed) + pendingChats;
}

export { countPendingSync };
