import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useTapPhotoPicker } from '../hooks/useTapPhotoPicker';
import { CircleFeedItem } from '../types/circle';
import { colors, layout, shadows, spacing, wishCardWidth } from '../theme';
import { font } from '../theme/text';
import { PostCard } from './PostCard';

const BLANK_ID = '__circle-feed-blank__';
const DOT_H = 6;
const DOT_IDLE = 6;
const DOT_ACTIVE = 18;

type StripRow = CircleFeedItem | { id: typeof BLANK_ID };

type Props = {
  items?: CircleFeedItem[];
  onAdd?: (localUri: string) => Promise<void>;
  disabled?: boolean;
};

function isBlank(row: StripRow): row is { id: typeof BLANK_ID } {
  return row.id === BLANK_ID;
}

function FeedDot({ index, step, scrollX }: { index: number; step: number; scrollX: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
    return {
      width: interpolate(scrollX.value, inputRange, [DOT_IDLE, DOT_ACTIVE, DOT_IDLE], Extrapolation.CLAMP),
      height: DOT_H,
      borderRadius: DOT_H / 2,
      backgroundColor: interpolateColor(scrollX.value, inputRange, [
        colors.dotInactive,
        colors.dotActive,
        colors.dotInactive,
      ]),
    };
  });

  return <Animated.View style={style} />;
}

export function CircleFeedStrip({ items = [], onAdd, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const scrollX = useSharedValue(0);

  const cardW = wishCardWidth();
  const gap = layout.wishCardGap;
  const step = cardW + gap;

  const rows = useMemo<StripRow[]>(
    () => [{ id: BLANK_ID }, ...items],
    [items],
  );

  const { onPress: handleBlankTap } = useTapPhotoPicker({
    disabled: disabled || !onAdd,
    loading,
    onPick: async (uri) => {
      setLoading(true);
      try {
        await onAdd?.(uri);
      } finally {
        setLoading(false);
      }
    },
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.wrap}>
      <Animated.FlatList
        data={rows}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.row}
        testID="circle-feed-strip"
        ItemSeparatorComponent={() => <View style={{ width: gap }} />}
        renderItem={({ item }) => {
          if (isBlank(item)) {
            return (
              <Pressable
                style={[styles.blankCard, { width: cardW }]}
                onPress={handleBlankTap}
                disabled={disabled || loading}
                testID="circle-feed-blank"
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Text style={styles.blankTitle}>Circle feed</Text>
                    <Text style={styles.blankHint}>Tap buat upload foto</Text>
                  </>
                )}
              </Pressable>
            );
          }

          return (
            <PostCard
              caption=""
              tag={item.tag}
              cardColor={item.cardColor}
              illustration={item.illustration}
              imageUri={item.imageUri}
              pending={!item.synced}
              width={cardW}
              showCaption={false}
            />
          );
        }}
      />
      {rows.length > 1 ? (
        <View style={styles.dots}>
          {rows.map((_, i) => (
            <FeedDot key={i} index={i} step={step} scrollX={scrollX} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  row: {
    paddingRight: spacing.sm,
  },
  blankCard: {
    height: layout.wishIllustrationH,
    borderRadius: layout.wishCardRadius,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.card,
  },
  blankTitle: {
    ...font('semibold', 14, colors.textPrimary),
  },
  blankHint: {
    ...font('regular', 12, colors.textSecondary),
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: DOT_H,
  },
});
