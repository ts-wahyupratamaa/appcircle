import { ComponentType, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useProfile } from '../context/ProfileProvider';
import { PostIllustration } from '../data/mockPosts';
import {
  GiftHandsIllustration,
  PolaroidIllustration,
  SleepingDogIllustration,
} from './illustrations/WishIllustrations';
import { colors, layout, radius, shadows, spacing } from '../theme';
import { text } from '../theme/text';
import { StoredPost } from '../types/circle';

const ILLUSTRATIONS: Record<PostIllustration, ComponentType> = {
  dog: SleepingDogIllustration,
  polaroid: PolaroidIllustration,
  gift: GiftHandsIllustration,
};

type CardProps = {
  item: StoredPost;
  width: number;
  height: number;
};

function DetailSlide({ item, width, height }: CardProps) {
  const { profileFor } = useProfile();
  const authorName = profileFor(item.authorId).displayName;
  const Illustration = ILLUSTRATIONS[item.illustration];

  return (
    <View style={[styles.cardOuter, { width, height }]} testID="post-detail-card">
      <View style={[styles.card, { backgroundColor: item.cardColor }]}>
        <View style={styles.media}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          {!item.synced ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>pending sync</Text>
            </View>
          ) : null}
          <Illustration />
        </View>

        <View style={styles.captionBar}>
          <Text style={text.caption}>{item.caption}</Text>
          <Text style={text.link}>{authorName}</Text>
        </View>
      </View>
    </View>
  );
}

type CarouselProps = {
  items: StoredPost[];
  onIndexChange?: (index: number) => void;
};

export function PostDetailCarousel({ items, onIndexChange }: CarouselProps) {
  const [active, setActive] = useState(0);
  const width = layout.screenW - layout.screenPad * 2;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== active) {
      setActive(idx);
      onIndexChange?.(idx);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Belum ada post di circle ini.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScroll}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        testID="post-carousel"
        renderItem={({ item }) => (
          <DetailSlide item={item} width={width} height={layout.detailCardH} />
        )}
      />
      <CarouselDots total={items.length} active={active} />
    </View>
  );
}

/** @deprecated use PostDetailCarousel */
export const WishDetailCarousel = PostDetailCarousel;

export function CarouselDots({ total, active }: { total: number; active: number }) {
  return (
    <View style={styles.dots} testID="carousel-dots">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
  cardOuter: {
    borderRadius: layout.detailCardRadius,
    ...shadows.card,
  },
  card: {
    flex: 1,
    borderRadius: layout.detailCardRadius,
    overflow: 'hidden',
  },
  media: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.detailCardH * 0.72,
    position: 'relative',
  },
  tag: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
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
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pendingText: {
    ...text.tag,
    color: colors.white,
    fontSize: 10,
  },
  captionBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.dotActive,
  },
  dotInactive: {
    backgroundColor: colors.dotInactive,
  },
});
