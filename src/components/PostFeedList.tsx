import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useProfile } from '../context/ProfileProvider';
import {
  buildCommentThreads,
  formatCommentAge,
  getFirstComment,
  groupCommentsByPost,
} from '../lib/commentStorage';
import { colors, radius, shadows, spacing } from '../theme';
import { font } from '../theme/text';
import { PostComment, StoredPost } from '../types/circle';
import { PostAuthorAvatar } from './PostAuthorAvatar';

const ROOT_AVATAR = 36;
const REPLY_AVATAR = 28;
const THREAD_INDENT = 48;
const COMPOSE_IDLE_MS = 3000;

type Props = {
  posts?: StoredPost[];
  comments?: PostComment[];
  onAddComment?: (postId: string, text: string, replyToId?: string) => Promise<void>;
  onComposeSubmit?: (caption: string) => Promise<void>;
  composerDisabled?: boolean;
};

type ReplyTarget = {
  id?: string;
  authorId: string;
  text: string;
};

type ReplyBarProps = {
  postId: string;
  replyTo: ReplyTarget | null;
  onClearReply: () => void;
  onSubmit: (postId: string, text: string, replyToId?: string) => Promise<void>;
};

function PostReplyBar({ postId, replyTo, onClearReply, onSubmit }: ReplyBarProps) {
  const { profile, profileFor } = useProfile();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!draft.trim() || sending) {
      return;
    }

    setSending(true);
    try {
      await onSubmit(postId, draft, replyTo?.id);
      setDraft('');
      onClearReply();
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.replyWrap}>
      {replyTo ? (
        <View style={styles.replyingTo}>
          <View style={styles.replyHeader}>
            <Text style={styles.commentAuthor}>{profile.displayName}</Text>
            <Text style={styles.replyTilde}>~</Text>
            <Text style={styles.replyTarget} numberOfLines={1}>
              {profileFor(replyTo.authorId).displayName}
            </Text>
          </View>
          <Pressable onPress={onClearReply} hitSlop={8}>
            <Feather name="x" size={14} color={colors.textTertiary} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.replyBar}>
        <TextInput
          style={styles.replyInput}
          placeholder={replyTo ? 'Tulis balasan...' : 'Tulis komentar...'}
          placeholderTextColor={colors.textTertiary}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={280}
          testID={`post-reply-input-${postId}`}
        />
        <Pressable
          style={[styles.replySend, (!draft.trim() || sending) && styles.replySendDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
          testID={`post-reply-send-${postId}`}
        >
          <Feather name="send" size={14} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

type CommentHeaderProps = {
  comment: PostComment;
  parent?: PostComment;
  isPostAuthor?: boolean;
};

function CommentHeader({ comment, parent, isPostAuthor }: CommentHeaderProps) {
  const { profileFor } = useProfile();
  const authorName = profileFor(comment.authorId).displayName;
  const parentName = parent ? profileFor(parent.authorId).displayName : '';

  if (parent) {
    return (
      <View style={styles.replyHeader}>
        <Text style={styles.commentAuthor}>{authorName}</Text>
        <Text style={styles.replyTilde}>~</Text>
        <Text style={styles.replyTarget} numberOfLines={1}>
          {parentName}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.rootHeader}>
      <Text style={styles.commentAuthor}>{authorName}</Text>
      {isPostAuthor ? <Text style={styles.creatorDash}>-</Text> : null}
    </View>
  );
}

type CommentNodeProps = {
  comment: PostComment;
  parent?: PostComment;
  postAuthorId: string;
  nested?: boolean;
  onReply: (comment: PostComment) => void;
};

function CommentNode({ comment, parent, postAuthorId, nested, onReply }: CommentNodeProps) {
  const { profileFor } = useProfile();
  const author = profileFor(comment.authorId);
  const size = nested ? REPLY_AVATAR : ROOT_AVATAR;

  return (
    <View
      style={[styles.commentNode, nested && styles.commentNodeNested]}
      testID={`post-comment-${comment.id}`}
    >
      <PostAuthorAvatar
        authorId={comment.authorId}
        authorName={author.displayName}
        size={size}
        avatarUri={author.avatarUri}
      />
      <View style={styles.commentBody}>
        <CommentHeader
          comment={comment}
          parent={parent}
          isPostAuthor={comment.authorId === postAuthorId}
        />
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{formatCommentAge(comment.createdAt)}</Text>
          <Pressable onPress={() => onReply(comment)} hitSlop={8}>
            <Text style={styles.balasBtn}>Balas</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type ThreadGroupProps = {
  root: PostComment;
  replies: PostComment[];
  post: StoredPost;
  commentMap: Map<string, PostComment>;
  onReply: (comment: PostComment) => void;
};

function ThreadGroup({ root, replies, post, commentMap, onReply }: ThreadGroupProps) {
  return (
    <View style={styles.threadGroup}>
      <CommentNode
        comment={root}
        postAuthorId={post.authorId}
        onReply={onReply}
      />

      {replies.length > 0 ? (
        <View style={styles.nestedThread}>
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              parent={reply.replyToId ? commentMap.get(reply.replyToId) : undefined}
              postAuthorId={post.authorId}
              nested
              onReply={onReply}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type PostThreadProps = {
  post: StoredPost;
  comments: PostComment[];
  onAddComment: (postId: string, text: string, replyToId?: string) => Promise<void>;
};

function PostThread({ post, comments, onAddComment }: PostThreadProps) {
  const { profile, profileFor } = useProfile();
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const [, refreshAge] = useState(0);

  useEffect(() => {
    const id = setInterval(() => refreshAge((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const commentMap = useMemo(() => {
    const map = new Map<string, PostComment>();
    for (const comment of comments) {
      map.set(comment.id, comment);
    }
    return map;
  }, [comments]);

  const threads = useMemo(() => buildCommentThreads(comments), [comments]);
  const replyCount = comments.length;
  const firstComment = useMemo(() => getFirstComment(comments), [comments]);

  const openThread = () => setExpanded(true);

  const handleReply = (comment: PostComment) => {
    setReplyTo(comment);
    setExpanded(true);
  };

  const author = profileFor(post.authorId);

  return (
    <View style={styles.item} testID={`feed-post-${post.id}`}>
      <View style={styles.postRow}>
        <PostAuthorAvatar
          authorId={post.authorId}
          authorName={author.displayName}
          size={40}
          avatarUri={author.avatarUri}
        />
        <View style={styles.body}>
          <View style={styles.postCopy}>
            <Text style={styles.authorName}>{author.displayName}</Text>
            {post.imageUri ? (
              <Image source={{ uri: post.imageUri }} style={styles.postPhoto} contentFit="cover" />
            ) : null}
            {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
          </View>

          <View style={styles.postMeta}>
            <Text style={styles.postMetaText}>
              {formatCommentAge(post.createdAt)}
            </Text>
            {firstComment ? (
              <>
                <Text style={styles.postMetaDot}>·</Text>
                <Text style={styles.postMetaText}>
                  Komentar pertama {formatCommentAge(firstComment.createdAt)}
                </Text>
              </>
            ) : null}
          </View>

          {!post.synced ? <Text style={styles.pending}>Menunggu sync</Text> : null}

          {!expanded ? (
            <View style={styles.collapsedActions}>
              {replyCount > 0 ? (
                <Pressable
                  style={styles.viewReplies}
                  onPress={openThread}
                  testID={`view-replies-${post.id}`}
                >
                  <View style={styles.viewRepliesLine} />
                  <Text style={styles.viewRepliesText}>Lihat {replyCount} balasan</Text>
                  <Feather name="chevron-down" size={14} color={colors.textSecondary} />
                </Pressable>
              ) : (
                <Pressable onPress={openThread} hitSlop={8}>
                  <Text style={styles.balasBtn}>Balas</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </View>

      {expanded ? (
        <View style={styles.expandedThread}>
          {threads.map((thread) => (
            <ThreadGroup
              key={thread.root.id}
              root={thread.root}
              replies={thread.replies}
              post={post}
              commentMap={commentMap}
              onReply={handleReply}
            />
          ))}

          <PostReplyBar
            postId={post.id}
            replyTo={
              replyTo
                ? { id: replyTo.id, authorId: replyTo.authorId, text: replyTo.text }
                : null
            }
            onClearReply={() => setReplyTo(null)}
            onSubmit={onAddComment}
          />

          <Pressable
            style={styles.hideReplies}
            onPress={() => {
              setExpanded(false);
              setReplyTo(null);
            }}
          >
            <View style={styles.viewRepliesLine} />
            <Text style={styles.viewRepliesText}>Sembunyikan balasan</Text>
            <Feather name="chevron-up" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function PostComposer({
  onSubmit,
  onClose,
}: {
  onSubmit: (caption: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);

  const finish = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }
    const text = draft.trim();
    if (!text) {
      onClose();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(text);
      onClose();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [draft, onClose, onSubmit]);

  useEffect(() => {
    if (idleRef.current) {
      clearTimeout(idleRef.current);
    }
    idleRef.current = setTimeout(() => {
      void finish();
    }, COMPOSE_IDLE_MS);
    return () => {
      if (idleRef.current) {
        clearTimeout(idleRef.current);
      }
    };
  }, [draft, finish]);

  return (
    <View style={styles.composer} testID="post-compose-input">
      <TextInput
        style={styles.composerInput}
        placeholder="Tulis postingan..."
        placeholderTextColor={colors.textTertiary}
        value={draft}
        onChangeText={setDraft}
        multiline
        maxLength={280}
        autoFocus
        editable={!submitting}
      />
      <Text style={styles.composerHint}>
        {submitting ? 'Posting...' : 'Berhenti ngetik 3 detik → auto post'}
      </Text>
    </View>
  );
}

function PostComposerModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (caption: string) => Promise<void>;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Tutup" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalCenter}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {visible ? <PostComposer onSubmit={onSubmit} onClose={onClose} /> : null}
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function PostComposeLink({
  count,
  onPress,
  disabled,
}: {
  count: number;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const label = count === 0 ? 'tap buat postingan' : `${count} postingan · tap buat baru`;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      testID="post-compose-link"
      hitSlop={8}
    >
      <Text style={[styles.composeLink, disabled && styles.composeLinkDisabled]}>{label}</Text>
    </Pressable>
  );
}

export function PostFeedList({
  posts = [],
  comments = [],
  onAddComment,
  onComposeSubmit,
  composerDisabled,
}: Props) {
  const commentsByPost = useMemo(() => groupCommentsByPost(comments), [comments]);
  const handleAddComment = onAddComment ?? (async () => {});
  const [composing, setComposing] = useState(false);

  const handleComposePress = () => {
    if (composerDisabled || !onComposeSubmit) {
      return;
    }
    setComposing(true);
  };

  return (
    <View style={styles.list}>
      <PostComposeLink
        count={posts.length}
        onPress={handleComposePress}
        disabled={composerDisabled || composing}
      />
      {onComposeSubmit ? (
        <PostComposerModal
          visible={composing}
          onClose={() => setComposing(false)}
          onSubmit={onComposeSubmit}
        />
      ) : null}
      {posts.map((post) => (
        <PostThread
          key={post.id}
          post={post}
          comments={commentsByPost[post.id] ?? []}
          onAddComment={handleAddComment}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  item: {
    gap: spacing.sm,
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
  },
  postCopy: {
    gap: 2,
  },
  authorName: {
    ...font('semibold', 13),
  },
  caption: {
    ...font('regular', 15, colors.textPrimary),
    lineHeight: 21,
  },
  postPhoto: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
    backgroundColor: colors.white,
  },
  composeLink: {
    textAlign: 'center',
    ...font('medium', 14, colors.textSecondary),
  },
  composeLinkDisabled: {
    opacity: 0.45,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  composer: {
    gap: spacing.xs,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.base,
    ...shadows.card,
  },
  composerInput: {
    minHeight: 88,
    maxHeight: 140,
    ...font('regular', 15),
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  composerHint: {
    ...font('regular', 11, colors.textTertiary),
    textAlign: 'right',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  postMetaText: {
    ...font('regular', 12, colors.textTertiary),
  },
  postMetaDot: {
    ...font('regular', 12, colors.textTertiary),
  },
  pending: {
    ...font('medium', 11, colors.textTertiary),
  },
  collapsedActions: {
    marginTop: spacing.xs,
  },
  viewReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  hideReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewRepliesLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.borderStrong,
  },
  viewRepliesText: {
    ...font('semibold', 13, colors.textSecondary),
  },
  expandedThread: {
    gap: spacing.lg,
    paddingLeft: THREAD_INDENT,
  },
  threadGroup: {
    gap: spacing.sm,
  },
  nestedThread: {
    marginLeft: ROOT_AVATAR / 2,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    gap: spacing.md,
  },
  commentNode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  commentNodeNested: {
    paddingLeft: spacing.xs,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  rootHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  replyHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  commentAuthor: {
    ...font('semibold', 14),
  },
  replyTilde: {
    ...font('regular', 14, colors.textTertiary),
  },
  replyTarget: {
    ...font('semibold', 14, colors.textSecondary),
    flexShrink: 1,
  },
  creatorDash: {
    ...font('regular', 14, colors.textTertiary),
  },
  commentText: {
    ...font('regular', 14, colors.textPrimary),
    lineHeight: 19,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  commentTime: {
    ...font('regular', 12, colors.textTertiary),
  },
  balasBtn: {
    ...font('semibold', 12, colors.textTertiary),
  },
  replyWrap: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    minHeight: 34,
    maxHeight: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
    ...font('regular', 14),
    textAlignVertical: 'top',
  },
  replySend: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replySendDisabled: {
    opacity: 0.4,
  },
});
