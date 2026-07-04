import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useProfile } from '../context/ProfileProvider';
import { formatChatTime } from '../lib/chatStorage';
import { ChatMessage } from '../types/circle';
import { colors, radius, spacing } from '../theme';
import { font } from '../theme/text';
import { PostAuthorAvatar } from './PostAuthorAvatar';

type BubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: BubbleProps) {
  const { profile, profileFor } = useProfile();
  const isMine = message.authorId === profile.username;
  const author = profileFor(message.authorId);

  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      {!isMine ? (
        <PostAuthorAvatar
          authorId={message.authorId}
          authorName={author.displayName}
          size={28}
          avatarUri={author.avatarUri}
        />
      ) : null}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {!isMine ? <Text style={styles.author}>{author.displayName}</Text> : null}
        {message.text ? (
          <Text style={[styles.text, isMine && styles.textMine]}>{message.text}</Text>
        ) : null}
        <Text style={[styles.time, isMine && styles.timeMine]}>
          {formatChatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

type TypingProps = {
  authorName: string;
};

function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(560 - delay),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        styles.typingDot,
        {
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
          ],
        },
      ]}
    />
  );
}

export function ChatTypingIndicator({ authorName }: TypingProps) {
  return (
    <View style={styles.row} testID="chat-typing">
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{authorName[0]?.toUpperCase()}</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleTheirs, styles.typingBubble]}>
        <Text style={styles.author}>{authorName}</Text>
        <View style={styles.typingDots}>
          <TypingDot delay={0} />
          <TypingDot delay={160} />
          <TypingDot delay={320} />
        </View>
      </View>
    </View>
  );
}

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
};

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onFocus,
  onBlur,
  disabled,
}: InputProps) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.composer}>
      <TextInput
        style={styles.inputField}
        placeholder="Ketik pesan..."
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        multiline
        maxLength={500}
        testID="chat-input"
      />
      <Pressable
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
        testID="chat-send"
      >
        <Feather name="send" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  rowMine: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...font('bold', 13, colors.primary),
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleTheirs: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: spacing.xs,
  },
  author: {
    ...font('semibold', 11, colors.primary),
  },
  typingBubble: {
    paddingVertical: spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 14,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.textTertiary,
  },
  text: {
    ...font('regular', 15, colors.textPrimary),
    lineHeight: 20,
  },
  textMine: {
    color: colors.white,
  },
  time: {
    ...font('regular', 10, colors.textTertiary),
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.pageWarm,
  },
  inputField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...font('regular', 15),
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
