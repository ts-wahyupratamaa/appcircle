import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTapPhotoPicker } from '../hooks/useTapPhotoPicker';
import { CircleFeedItem } from '../types/circle';
import { colors, layout, shadows, spacing, wishCardWidth } from '../theme';
import { font } from '../theme/text';
import { PostCard } from './PostCard';

const BLANK_ID = '__circle-feed-blank__';

type StripRow = CircleFeedItem | { id: typeof BLANK_ID };

type Props = {
  items?: CircleFeedItem[];
  onAdd?: (localUri: string) => Promise<void>;
  disabled?: boolean;
};

function isBlank(row: StripRow): row is { id: typeof BLANK_ID } {
  return row.id === BLANK_ID;
}

export function CircleFeedStrip({ items = [], onAdd, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<StripRow>>(null);

  const cardW = wishCardWidth();
  const gap = layout.wishCardGap;

  // blank kiri, lalu foto terbaru → terlama (items sudah newest-first dari provider)
  const rows = useMemo<StripRow[]>(() => [{ id: BLANK_ID }, ...items], [items]);
  const listKey = useMemo(() => rows.map((row) => row.id).join('|'), [rows]);

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

  // foto baru masuk — scroll ke kiri biar langsung kelihatan
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [items[0]?.id]);

  const renderItem: ListRenderItem<StripRow> = ({ item }) => {
    if (isBlank(item)) {
      return (
        <Pressable
          style={[styles.blankCard, { width: cardW, marginRight: gap }]}
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
      <View style={{ marginRight: gap }}>
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
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        key={listKey}
        data={rows}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        extraData={listKey}
        decelerationRate="fast"
        snapToInterval={cardW + gap}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.row}
        testID="circle-feed-strip"
        renderItem={renderItem}
      />
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
});
