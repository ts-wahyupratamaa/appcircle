import { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { PostIllustration } from '../data/mockPosts';
import {
  GiftHandsIllustration,
  PolaroidIllustration,
  SleepingDogIllustration,
} from './illustrations/WishIllustrations';
import { colors, layout, radius, shadows, spacing } from '../theme';
import { font, text } from '../theme/text';

const ILLUSTRATIONS: Record<PostIllustration, ComponentType> = {
  dog: SleepingDogIllustration,
  polaroid: PolaroidIllustration,
  gift: GiftHandsIllustration,
};

type Props = {
  caption: string;
  tag?: string;
  cardColor?: string;
  illustration?: PostIllustration;
  imageUri?: string;
  pending?: boolean;
  width?: number;
  showCaption?: boolean;
  onPress?: () => void;
};

export function PostCard({
  caption,
  tag,
  cardColor = colors.cardMint,
  illustration = 'dog',
  imageUri,
  pending = false,
  width,
  showCaption = true,
  onPress,
}: Props) {
  const Illustration = ILLUSTRATIONS[illustration];
  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress, testID: 'post-card' as const } : { testID: 'post-card' as const };

  return (
    <Wrapper
      style={[styles.card, { backgroundColor: cardColor }, width ? { width } : null]}
      {...wrapperProps}
    >
      <View style={styles.media}>
        {tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ) : null}
        {pending ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>pending sync</Text>
          </View>
        ) : null}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} contentFit="cover" />
        ) : (
          <Illustration />
        )}
      </View>

      {showCaption ? (
        <View style={styles.captionBar}>
          <Text style={text.caption} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      ) : null}
    </Wrapper>
  );
}

/** @deprecated use PostCard */
export const WishCard = PostCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.wishCardRadius,
    overflow: 'hidden',
    ...shadows.card,
  },
  media: {
    height: layout.wishIllustrationH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  tag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  tagText: {
    ...text.tag,
    color: colors.white,
  },
  pendingBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pendingText: {
    ...font('medium', 10, colors.white),
  },
  captionBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: layout.postCaptionH,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
});
