import AsyncStorage from '@react-native-async-storage/async-storage';

import { HATERS_ASIA_ID } from '../data/circles';
import { PostComment, STORAGE_KEYS } from '../types/circle';

const SEED_COMMENTS: Omit<PostComment, 'id' | 'createdAt' | 'synced'>[] = [
  {
    postId: 'seed-0',
    authorId: 'meita.bl',
    authorName: 'meita.bl',
    text: 'gas haters-asia 🔥',
  },
  {
    postId: 'seed-1',
    authorId: 'sshdkey.dev',
    authorName: 'sshdkey.dev',
    replyToId: 'comment-seed-0',
    text: 'siap deploy malem ini',
  },
];

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCommentAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) {
    return 'baru';
  }
  if (mins < 60) {
    return `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours} h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} hr`;
  }
  return `${Math.floor(days / 7)}mg`;
}

export function getFirstComment(comments: PostComment[]): PostComment | null {
  if (comments.length === 0) {
    return null;
  }
  return comments.reduce((earliest, comment) =>
    comment.createdAt < earliest.createdAt ? comment : earliest,
  );
}

export async function loadComments(): Promise<PostComment[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.comments);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PostComment[];
  } catch {
    return [];
  }
}

async function saveComments(comments: PostComment[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
}

export async function ensureSeedComments(): Promise<PostComment[]> {
  const seeded = await AsyncStorage.getItem(STORAGE_KEYS.commentsSeeded);
  if (seeded === '1') {
    return loadComments();
  }

  const now = Date.now();
  const comments: PostComment[] = SEED_COMMENTS.map((comment, index) => ({
    ...comment,
    id: `comment-seed-${index}`,
    createdAt: new Date(now - index * 3_600_000).toISOString(),
    synced: true,
  }));

  await saveComments(comments);
  await AsyncStorage.setItem(STORAGE_KEYS.commentsSeeded, '1');
  return comments;
}

export async function addComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  replyToId?: string;
}): Promise<PostComment> {
  const comments = await loadComments();
  const comment = createCommentRecord(input);
  comments.push(comment);
  await saveComments(comments);
  return comment;
}

export function createCommentRecord(input: {
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  replyToId?: string;
}): PostComment {
  return {
    id: newId(),
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName,
    text: input.text.trim(),
    replyToId: input.replyToId,
    createdAt: new Date().toISOString(),
    synced: false,
  };
}

export async function queueComment(comment: PostComment): Promise<void> {
  const comments = await loadComments();
  comments.push(comment);
  await saveComments(comments);
}

export function filterCommentsByPostIds(
  comments: PostComment[] | undefined,
  postIds: string[],
): PostComment[] {
  const list = comments ?? [];
  const allowed = new Set(postIds);
  return list
    .filter((comment) => allowed.has(comment.postId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function groupCommentsByPost(
  comments: PostComment[] | undefined,
): Record<string, PostComment[]> {
  return (comments ?? []).reduce<Record<string, PostComment[]>>((groups, comment) => {
    const list = groups[comment.postId] ?? [];
    list.push(comment);
    groups[comment.postId] = list;
    return groups;
  }, {});
}

export type CommentThread = {
  root: PostComment;
  replies: PostComment[];
};

export function buildCommentThreads(comments: PostComment[]): CommentThread[] {
  const map = new Map(comments.map((c) => [c.id, c]));

  const threadRootId = (comment: PostComment): string => {
    let current: PostComment | undefined = comment;
    while (current?.replyToId) {
      current = map.get(current.replyToId);
    }
    return current?.id ?? comment.id;
  };

  const roots = comments
    .filter((c) => !c.replyToId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return roots.map((root) => ({
    root,
    replies: comments
      .filter((c) => c.replyToId && threadRootId(c) === root.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));
}
