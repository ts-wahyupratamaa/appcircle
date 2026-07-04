import { PostIllustration } from '../data/mockPosts';

export type StoredPost = {
  id: string;
  circleId: string;
  tag: string;
  caption: string;
  imageUri?: string;
  cardColor: string;
  illustration: PostIllustration;
  authorId: string;
  authorName: string;
  createdAt: string;
  synced: boolean;
};

export type CircleFeedItem = {
  id: string;
  circleId: string;
  tag: string;
  imageUri?: string;
  cardColor: string;
  illustration: PostIllustration;
  authorId: string;
  authorName: string;
  createdAt: string;
  synced: boolean;
};

export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  replyToId?: string;
  createdAt: string;
  synced: boolean;
};

export type CircleSession = {
  accountId: string;
  circleId: string;
  enteredAt: string;
};

export const STORAGE_KEYS = {
  session: '@instaintrov/session',
  posts: '@instaintrov/posts',
  circleFeed: '@instaintrov/circle-feed',
  seeded: '@instaintrov/seeded-v4',
  circleFeedSeeded: '@instaintrov/circle-feed-seeded-v4',
  comments: '@instaintrov/comments',
  commentsSeeded: '@instaintrov/comments-seeded-v4',
  chats: '@instaintrov/chats',
  chatsSeeded: '@instaintrov/chats-seeded-v4',
  circleNames: '@instaintrov/circle-names',
  circleDescriptions: '@instaintrov/circle-descriptions',
} as const;

export type ChatMessageType = 'text' | 'image';

export type ChatMessage = {
  id: string;
  circleId: string;
  authorId: string;
  authorName: string;
  type: ChatMessageType;
  text?: string;
  imageUri?: string;
  createdAt: string;
  synced?: boolean;
};
