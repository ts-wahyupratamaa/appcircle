import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentControl } from '../src/components/SegmentControl';
import { PostDetailCarousel } from '../src/components/WishDetailCarousel';
import { useCircle } from '../src/context/CircleProvider';
import { bottomPadding } from '../src/theme/safeArea';
import { colors, layout, spacing } from '../src/theme';
import { font, text } from '../src/theme/text';

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedPosts, activeCircle } = useCircle();
  const [mode, setMode] = useState<'slideshow' | 'list'>('slideshow');

  return (
    <View style={[styles.screen, { paddingTop: spacing.md, paddingBottom: bottomPadding(insets.bottom) }]}>
      <StatusBar style="dark" />

      <Pressable
        style={styles.back}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/home');
          }
        }}
        testID="back-button"
      >
        <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        <Text style={text.link}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Circle feed</Text>
      {activeCircle ? (
        <Text style={styles.subtitle}>
          {activeCircle.emoji} {activeCircle.name} · {feedPosts.length} post
        </Text>
      ) : null}

      <SegmentControl value={mode} onChange={setMode} />

      {mode === 'slideshow' ? (
        <View style={styles.carousel}>
          <PostDetailCarousel items={feedPosts} />
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {feedPosts.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View style={[styles.listThumb, { backgroundColor: item.cardColor }]} />
              <View style={styles.listBody}>
                <Text style={text.tag}>{item.tag}</Text>
                <Text style={text.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
                <Text style={text.link}>
                  {item.authorName} · {!item.synced ? 'pending sync' : 'synced'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageWarm,
    paddingHorizontal: layout.screenPad,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...font('extrabold', layout.screenTitleSize),
    letterSpacing: -0.5,
  },
  subtitle: {
    ...font('regular', 14, colors.textSecondary),
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  carousel: {
    flex: 1,
    marginTop: spacing.sm,
  },
  list: {
    flex: 1,
    marginTop: spacing.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  listBody: {
    flex: 1,
    gap: 4,
  },
});
