import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

import { CircleFeedItem, ChatMessage, PostComment, StoredPost } from '../types/circle';
import { isCircleFeedExpired } from '../constants/feedTtl';
import { filterActiveCircleFeed, purgeExpiredCircleFeed } from './feedExpiry';
import { getDb, hasFirebase } from './firebase';

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function postsRef(circleId: string) {
  return collection(getDb(), 'circles', circleId, 'posts');
}

function messagesRef(circleId: string) {
  return collection(getDb(), 'circles', circleId, 'messages');
}

function feedRef(circleId: string) {
  return collection(getDb(), 'circles', circleId, 'feed');
}

function commentsRef(circleId: string) {
  return collection(getDb(), 'circles', circleId, 'comments');
}

export function watchPosts(circleId: string, onData: (posts: StoredPost[]) => void): () => void {
  const q = query(postsRef(circleId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        circleId,
        tag: String(data.tag ?? ''),
        caption: String(data.caption ?? ''),
        imageUri: data.imageUri ? String(data.imageUri) : undefined,
        cardColor: String(data.cardColor ?? '#C8F0D8'),
        illustration: (data.illustration as StoredPost['illustration']) ?? 'dog',
        authorId: String(data.authorId ?? ''),
        authorName: String(data.authorName ?? ''),
        createdAt: tsToIso(data.createdAt),
        synced: true,
      } satisfies StoredPost;
    });
    onData(posts);
  });
}

export function watchMessages(
  circleId: string,
  onData: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(messagesRef(circleId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        circleId,
        authorId: String(data.authorId ?? ''),
        authorName: String(data.authorName ?? ''),
        type: (data.type as ChatMessage['type']) ?? 'text',
        text: data.text ? String(data.text) : undefined,
        imageUri: data.imageUri ? String(data.imageUri) : undefined,
        createdAt: tsToIso(data.createdAt),
      } satisfies ChatMessage;
    });
    onData(messages);
  });
}

function mapFeedDocs(circleId: string, docs: { id: string; data: () => Record<string, unknown> }[]) {
  return docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      circleId,
      tag: String(data.tag ?? ''),
      imageUri: data.imageUri ? String(data.imageUri) : undefined,
      cardColor: String(data.cardColor ?? '#C8F0D8'),
      illustration: (data.illustration as CircleFeedItem['illustration']) ?? 'dog',
      authorId: String(data.authorId ?? ''),
      authorName: String(data.authorName ?? ''),
      createdAt: tsToIso(data.createdAt),
      synced: true,
    } satisfies CircleFeedItem;
  });
}

export function watchFeed(
  circleId: string,
  onData: (items: CircleFeedItem[]) => void,
): () => void {
  const emit = (items: CircleFeedItem[]) => {
    const expired = items.filter((item) => isCircleFeedExpired(item.createdAt));
    if (expired.length > 0) {
      void purgeExpiredCircleFeed(circleId, expired);
    }
    onData(filterActiveCircleFeed(items));
  };

  const q = query(feedRef(circleId), orderBy('createdAt', 'desc'));
  let unsub = onSnapshot(
    q,
    (snap) => emit(mapFeedDocs(circleId, snap.docs)),
    (error) => {
      console.warn('[innerly] watchFeed orderBy failed, fallback', error);
      unsub();
      unsub = onSnapshot(feedRef(circleId), (snap) => {
        const items = mapFeedDocs(circleId, snap.docs).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        emit(items);
      });
    },
  );

  return () => unsub();
}

export function watchComments(
  circleId: string,
  onData: (comments: PostComment[]) => void,
): () => void {
  const q = query(commentsRef(circleId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        postId: String(data.postId ?? ''),
        authorId: String(data.authorId ?? ''),
        authorName: String(data.authorName ?? ''),
        text: String(data.text ?? ''),
        replyToId: data.replyToId ? String(data.replyToId) : undefined,
        createdAt: tsToIso(data.createdAt),
        synced: true,
      } satisfies PostComment;
    });
    onData(comments);
  });
}

export async function pushPost(post: StoredPost): Promise<void> {
  await setDoc(doc(postsRef(post.circleId), post.id), {
    tag: post.tag,
    caption: post.caption,
    imageUri: post.imageUri ?? null,
    cardColor: post.cardColor,
    illustration: post.illustration,
    authorId: post.authorId,
    authorName: post.authorName,
    createdAt: post.createdAt,
  });
}

export async function pushChatMessage(message: ChatMessage): Promise<void> {
  await setDoc(doc(messagesRef(message.circleId), message.id), {
    type: message.type,
    text: message.text ?? null,
    imageUri: message.imageUri ?? null,
    authorId: message.authorId,
    authorName: message.authorName,
    createdAt: message.createdAt,
  });
}

export async function pushFeedItem(item: CircleFeedItem): Promise<void> {
  const createdAtMs = new Date(item.createdAt).getTime();
  await setDoc(doc(feedRef(item.circleId), item.id), {
    tag: item.tag,
    imageUri: item.imageUri ?? null,
    cardColor: item.cardColor,
    illustration: item.illustration,
    authorId: item.authorId,
    authorName: item.authorName,
    createdAt: item.createdAt,
    createdAtMs: Number.isNaN(createdAtMs) ? Date.now() : createdAtMs,
  });
}

export async function deleteFeedItem(circleId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(feedRef(circleId), itemId));
}

export async function pushComment(comment: PostComment, circleId: string): Promise<void> {
  await setDoc(doc(commentsRef(circleId), comment.id), {
    postId: comment.postId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    text: comment.text,
    replyToId: comment.replyToId ?? null,
    createdAt: comment.createdAt,
  });
}

export { hasFirebase };
