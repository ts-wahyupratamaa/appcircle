import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

import { findAccountIdByPin } from '../lib/accountPinStorage';
import { isCloudBackend } from '../lib/cloudMode';
import { findCircleByPin, HATERS_ASIA, type Circle } from '../data/circles';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useProfile } from './ProfileProvider';
import {
  clearActiveAccount,
  hasActiveAccount,
  loadActiveAccount,
  loadCircleDescriptions,
  loadCircleNames,
  saveActiveAccount,
  saveCircleDescription,
  saveCircleName,
} from '../lib/circleStorage';
import { watchCircleMeta } from '../lib/firebaseProfiles';
import {
  createPostRecord,
  ensureSeedPosts,
  filterPostsByCircle,
  loadPosts,
  queuePost,
} from '../lib/postStorage';
import {
  createCircleFeedItem,
  ensureSeedCircleFeed,
  filterCircleFeedByCircle,
  loadCircleFeed,
  queueCircleFeedItem,
} from '../lib/circleFeedStorage';
import {
  createCommentRecord,
  ensureSeedComments,
  filterCommentsByPostIds,
  queueComment,
} from '../lib/commentStorage';
import { persistFeedImage } from '../lib/feedImages';
import {
  hasFirebase,
  pushChatMessage,
  pushComment,
  pushFeedItem,
  pushPost,
  watchComments,
  watchFeed,
  watchMessages,
  watchPosts,
} from '../lib/firebaseDb';
import {
  createTextChatMessage,
  ensureSeedChats,
  filterChatsByCircle,
  loadChats,
  queueChatMessage,
} from '../lib/chatStorage';
import { isCircleFeedExpired } from '../constants/feedTtl';
import { filterActiveCircleFeed, purgeExpiredCircleFeed } from '../lib/feedExpiry';
import { clearLocalFeedCacheOnce } from '../lib/migrateLocalFeed';
import { countAllPendingSync, syncPendingPosts } from '../lib/syncService';
import { ChatMessage, CircleFeedItem, PostComment, StoredPost } from '../types/circle';

type CircleContextValue = {
  ready: boolean;
  hasSession: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  activeCircle: Circle | null;
  feedPosts: StoredPost[];
  postComments: PostComment[];
  circleFeedItems: CircleFeedItem[];
  chatMessages: ChatMessage[];
  validateAccountPin: (pin: string) => Promise<string | null>;
  enterCircle: (pin: string, accountId: string) => Promise<boolean>;
  createPost: (caption: string, imageUri?: string) => Promise<void>;
  addPostComment: (postId: string, text: string, replyToId?: string) => Promise<void>;
  addCircleFeedPhoto: (localUri: string) => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  updateCircleName: (name: string) => Promise<void>;
  updateCircleDescription: (description: string) => Promise<void>;
  syncNow: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const CircleContext = createContext<CircleContextValue | null>(null);

function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    const tb = new Date(b.createdAt).getTime();
    const ta = new Date(a.createdAt).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

function mergeRemoteWithPending<T extends { id: string; circleId: string; synced?: boolean }>(
  remote: T[],
  prev: T[],
  circleId: string,
): T[] {
  const remoteIds = new Set(remote.map((item) => item.id));
  // Keep local rows not yet in snapshot (optimistic write / lag) — including synced:true
  const localOnly = prev.filter(
    (item) => item.circleId === circleId && !remoteIds.has(item.id),
  );
  const others = prev.filter((item) => item.circleId !== circleId);
  const merged = [...remote, ...localOnly, ...others];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((row) => row.id === item.id);
  if (index === -1) {
    return [item, ...items];
  }
  const next = items.slice();
  next[index] = item;
  return next;
}

function appendById<T extends { id: string }>(items: T[], item: T): T[] {
  if (items.some((row) => row.id === item.id)) {
    return items.map((row) => (row.id === item.id ? item : row));
  }
  return [...items, item];
}

async function loadLocalFeed() {
  if (isCloudBackend()) {
    const [allPosts, allFeed, allChats] = await Promise.all([
      loadPosts(),
      loadCircleFeed(),
      loadChats(),
    ]);
    return {
      posts: allPosts.filter((p) => !p.synced),
      comments: [] as PostComment[],
      circleFeed: filterActiveCircleFeed(allFeed.filter((f) => !f.synced)),
      chats: allChats.filter((c) => c.synced === false),
    };
  }

  const [posts, comments, circleFeed, chats] = await Promise.all([
    ensureSeedPosts(),
    ensureSeedComments(),
    ensureSeedCircleFeed(),
    ensureSeedChats(),
  ]);
  return { posts, comments, circleFeed, chats };
}

export function CircleProvider({ children }: { children: ReactNode }) {
  const { isConnected: isOnline } = useNetworkStatus();
  const { profile, signInAs, signOut } = useProfile();
  const [ready, setReady] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [circleFeed, setCircleFeed] = useState<CircleFeedItem[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [circleNames, setCircleNames] = useState<Record<string, string>>({});
  const [circleDescriptions, setCircleDescriptions] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    await clearLocalFeedCacheOnce();

    const [loadedAccountId, feed, loadedNames, loadedDescriptions] = await Promise.all([
      loadActiveAccount(),
      loadLocalFeed(),
      loadCircleNames(),
      loadCircleDescriptions(),
    ]);

    if (loadedAccountId) {
      await signInAs(loadedAccountId);
    }

    setActiveAccountId(loadedAccountId);
    setPosts(feed.posts);
    setComments(feed.comments);
    setCircleFeed(feed.circleFeed);
    setChats(feed.chats);
    setCircleNames(loadedNames);
    setCircleDescriptions(loadedDescriptions);
  }, [signInAs]);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const pendingSyncCount = useMemo(
    () => countAllPendingSync(posts, circleFeed, chats),
    [posts, circleFeed, chats],
  );

  const runSync = useCallback(async () => {
    const result = await syncPendingPosts();
    // cloud: onSnapshot yang pegang state — jangan timpa pakai AsyncStorage (itu yang "reset" feed)
    if (isCloudBackend()) {
      return;
    }
    setPosts(result.posts);
    setCircleFeed(result.circleFeed);
    setChats(result.chats);
  }, []);

  useEffect(() => {
    if (!ready || !isOnline || pendingSyncCount === 0) {
      return;
    }
    runSync();
  }, [ready, isOnline, pendingSyncCount, runSync]);

  const activeCircle = useMemo(() => {
    if (!hasActiveAccount(activeAccountId)) {
      return null;
    }
    const name = circleNames[HATERS_ASIA.id] ?? HATERS_ASIA.name;
    const description = circleDescriptions[HATERS_ASIA.id] ?? HATERS_ASIA.description;
    return { ...HATERS_ASIA, name, description };
  }, [activeAccountId, circleNames, circleDescriptions]);

  useEffect(() => {
    if (!hasFirebase() || !activeAccountId) {
      return;
    }
    return watchCircleMeta(HATERS_ASIA.id, (meta) => {
      if (meta.name) {
        setCircleNames((current) => ({ ...current, [HATERS_ASIA.id]: meta.name! }));
      }
      if (meta.description !== undefined) {
        setCircleDescriptions((current) => ({
          ...current,
          [HATERS_ASIA.id]: meta.description ?? '',
        }));
      }
    });
  }, [activeAccountId]);

  useEffect(() => {
    if (!activeCircle || !hasFirebase()) {
      return;
    }

    const circleId = activeCircle.id;

    const unsubPosts = watchPosts(circleId, (remote) => {
      setPosts((prev) => mergeRemoteWithPending(remote, prev, circleId));
    });
    const unsubFeed = watchFeed(circleId, (remote) => {
      setCircleFeed((prev) => mergeRemoteWithPending(remote, prev, circleId));
    });
    const unsubChats = watchMessages(circleId, (remote) => {
      setChats((prev) => mergeRemoteWithPending(remote, prev, circleId));
    });
    const unsubComments = watchComments(circleId, (remote) => {
      setComments((prev) => {
        const pending = prev.filter((c) => c.synced === false);
        const remoteIds = new Set(remote.map((c) => c.id));
        return [...remote, ...pending.filter((c) => !remoteIds.has(c.id))];
      });
    });

    return () => {
      unsubPosts();
      unsubFeed();
      unsubChats();
      unsubComments();
    };
  }, [activeCircle?.id]);

  const feedPosts = useMemo(() => {
    if (!activeCircle) {
      return [];
    }
    return filterPostsByCircle(posts, activeCircle.id);
  }, [posts, activeCircle]);

  const postComments = useMemo(() => {
    return filterCommentsByPostIds(
      comments,
      feedPosts.map((post) => post.id),
    );
  }, [comments, feedPosts]);

  const circleFeedItems = useMemo(() => {
    if (!activeCircle) {
      return [];
    }
    // terbaru di kiri (index 0)
    return sortByNewest(
      filterActiveCircleFeed(filterCircleFeedByCircle(circleFeed, activeCircle.id)),
    );
  }, [circleFeed, activeCircle]);

  useEffect(() => {
    if (!activeCircle || !hasFirebase()) {
      return;
    }
    const circleId = activeCircle.id;
    const tick = () => {
      setCircleFeed((prev) => {
        const inCircle = prev.filter((item) => item.circleId === circleId);
        const expired = inCircle.filter((item) => isCircleFeedExpired(item.createdAt));
        if (expired.length > 0) {
          void purgeExpiredCircleFeed(circleId, expired);
        }
        return filterActiveCircleFeed(prev);
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [activeCircle?.id]);

  const chatMessages = useMemo(() => {
    if (!activeCircle) {
      return [];
    }
    return filterChatsByCircle(chats, activeCircle.id);
  }, [chats, activeCircle]);

  const validateAccountPin = useCallback(async (pin: string) => {
    return (await findAccountIdByPin(pin)) ?? null;
  }, []);

  const enterCircle = useCallback(
    async (pin: string, accountId: string) => {
      if (!findCircleByPin(pin)) {
        return false;
      }

      await signInAs(accountId);
      await saveActiveAccount(accountId);
      setActiveAccountId(accountId);

      if (!isCloudBackend()) {
        const feed = await loadLocalFeed();
        setPosts(feed.posts);
        setComments(feed.comments);
        setCircleFeed(feed.circleFeed);
        setChats(feed.chats);
      }

      return true;
    },
    [signInAs],
  );

  const createPost = useCallback(
    async (caption: string, localImageUri?: string) => {
      if (!activeCircle || (!caption.trim() && !localImageUri)) {
        return;
      }

      try {
        const imageUri = localImageUri
          ? await persistFeedImage(localImageUri, activeCircle.id)
          : undefined;

        const post = createPostRecord(
          {
            circleId: activeCircle.id,
            tag: activeCircle.tag,
            caption,
            imageUri,
            authorId: profile.username,
            authorName: profile.displayName,
          },
          posts.length,
        );

        setPosts((current) => upsertById(current, { ...post, synced: false }));

        if (isCloudBackend()) {
          try {
            await pushPost(post);
            setPosts((current) => upsertById(current, { ...post, synced: true }));
            return;
          } catch (error) {
            console.warn('[innerly] pushPost failed, queueing', error);
          }
        }

        await queuePost(post);
      } catch (error) {
        console.warn('[innerly] createPost failed', error);
        Alert.alert('Gagal post', 'Cek internet lalu coba lagi.');
      }
    },
    [activeCircle, profile, posts.length],
  );

  const addPostComment = useCallback(
    async (postId: string, text: string, replyToId?: string) => {
      if (!activeCircle || !text.trim()) {
        return;
      }

      const comment = createCommentRecord({
        postId,
        authorId: profile.username,
        authorName: profile.displayName,
        text,
        replyToId,
      });

      if (isCloudBackend()) {
        try {
          await pushComment(comment, activeCircle.id);
          setComments((current) => appendById(current, { ...comment, synced: true }));
          return;
        } catch (error) {
          console.warn('[innerly] pushComment failed, queueing', error);
        }
      }

      await queueComment(comment);
      setComments((current) => appendById(current, comment));
    },
    [activeCircle, profile],
  );

  const addCircleFeedPhoto = useCallback(
    async (localUri: string) => {
      if (!activeCircle || !localUri) {
        return;
      }

      try {
        const imageUri = await persistFeedImage(localUri, activeCircle.id);
        const item = createCircleFeedItem(
          {
            circleId: activeCircle.id,
            tag: activeCircle.tag,
            imageUri,
            authorId: profile.username,
            authorName: profile.displayName,
          },
          circleFeed.length,
        );

        // tampilkan dulu biar tidak hilang saat snapshot lag
        setCircleFeed((current) => upsertById(current, { ...item, synced: false }));

        if (isCloudBackend()) {
          try {
            await pushFeedItem(item);
            setCircleFeed((current) => upsertById(current, { ...item, synced: true }));
          } catch (error) {
            console.warn('[innerly] pushFeedItem failed, queueing', error);
            await queueCircleFeedItem(item);
            Alert.alert('Tersimpan lokal', 'Foto muncul di HP ini; sync cloud gagal — coba lagi nanti.');
          }
          return;
        }

        await queueCircleFeedItem(item);
      } catch (error) {
        console.warn('[innerly] addCircleFeedPhoto failed', error);
        Alert.alert('Gagal upload', 'Foto circle feed tidak tersimpan. Cek internet lalu coba lagi.');
      }
    },
    [activeCircle, profile, circleFeed.length],
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!activeCircle || !text.trim()) {
        return;
      }

      const message = createTextChatMessage({
        circleId: activeCircle.id,
        authorId: profile.username,
        authorName: profile.displayName,
        text,
      });

      if (isCloudBackend()) {
        try {
          await pushChatMessage(message);
          setChats((current) => appendById(current, { ...message, synced: true }));
          return;
        } catch (error) {
          console.warn('[innerly] pushChatMessage failed, queueing', error);
        }
      }

      await queueChatMessage(message);
      setChats((current) => appendById(current, message));
    },
    [activeCircle, profile],
  );

  const updateCircleName = useCallback(
    async (name: string) => {
      if (!activeCircle || !name.trim()) {
        return;
      }
      await saveCircleName(activeCircle.id, name);
      setCircleNames((current) => ({ ...current, [activeCircle.id]: name.trim() }));
    },
    [activeCircle],
  );

  const updateCircleDescription = useCallback(
    async (description: string) => {
      if (!activeCircle) {
        return;
      }
      await saveCircleDescription(activeCircle.id, description);
      setCircleDescriptions((current) => ({ ...current, [activeCircle.id]: description.trim() }));
    },
    [activeCircle],
  );

  const logout = useCallback(async () => {
    await clearActiveAccount();
    setActiveAccountId(null);
    signOut();
  }, [signOut]);

  const value = useMemo<CircleContextValue>(
    () => ({
      ready,
      hasSession: hasActiveAccount(activeAccountId),
      isOnline,
      pendingSyncCount,
      activeCircle,
      feedPosts,
      postComments,
      circleFeedItems,
      chatMessages,
      validateAccountPin,
      enterCircle,
      createPost,
      addPostComment,
      addCircleFeedPhoto,
      sendChatMessage,
      updateCircleName,
      updateCircleDescription,
      syncNow: runSync,
      refresh,
      logout,
    }),
    [
      ready,
      activeAccountId,
      isOnline,
      pendingSyncCount,
      activeCircle,
      feedPosts,
      postComments,
      circleFeedItems,
      chatMessages,
      validateAccountPin,
      enterCircle,
      createPost,
      addPostComment,
      addCircleFeedPhoto,
      sendChatMessage,
      updateCircleName,
      updateCircleDescription,
      runSync,
      refresh,
      logout,
    ],
  );

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error('useCircle must be used within CircleProvider');
  }
  return context;
}

export { HATERS_ASIA };
