import { useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, layout, spacing, wishCardWidth } from '../theme';
import { StoredPost } from '../types/circle';
import { PostCard } from './PostCard';

type Props = {
  posts: StoredPost[];
  onPostPress?: (id: string) => void;
};

export function PostCardCarousel({ posts, onPostPress }: Props) {
  const [active, setActive] = useState(0);
  const cardW = wishCardWidth();
  const gap = layout.wishCardGap;
  const step = cardW + gap;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / step);
    setActive(Math.min(Math.max(idx, 0), Math.max(posts.length - 1, 0)));
  };

  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Belum ada post di circle ini. Tap + buat yang pertama!</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={posts}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScroll}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        ItemSeparatorComponent={() => <View style={{ width: gap }} />}
        testID="home-post-carousel"
        renderItem={({ item }) => (
          <PostCard
            caption={item.caption}
            tag={item.tag}
            cardColor={item.cardColor}
            illustration={item.illustration}
            pending={!item.synced}
            width={cardW}
            onPress={() => onPostPress?.(item.id)}
          />
        )}
      />
      <View style={styles.dots}>
        {posts.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

/** @deprecated use PostCardCarousel */
export const WishCardCarousel = PostCardCarousel;

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    borderRadius: layout.wishCardRadius,
    backgroundColor: colors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.dotInactive,
  },
  dotActive: {
    backgroundColor: colors.dotActive,
    width: 18,
    height: 6,
    borderRadius: 3,
  },
});
