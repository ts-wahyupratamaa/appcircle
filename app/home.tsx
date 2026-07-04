import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { MainBottomNav } from '../src/components/MainBottomNav';
import { magicNavBottomInset } from '../src/components/BottomNav';
import { CircleFeedStrip } from '../src/components/CircleFeedStrip';
import { EditProfileSheet } from '../src/components/EditProfileSheet';
import { ShareDevSheet } from '../src/components/ShareDevSheet';
import { SwipeToEnter } from '../src/components/SwipeToEnter';
import { PostFeedList } from '../src/components/PostFeedList';
import { ProfileAvatar } from '../src/components/ProfileAvatar';
import { useCircle } from '../src/context/CircleProvider';
import { useProfile } from '../src/context/ProfileProvider';
import { colors, layout, spacing } from '../src/theme';
import { topPadding } from '../src/theme/safeArea';
import { text } from '../src/theme/text';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, verifyAccountPin, changeAccountPin, resetAccountPin } =
    useProfile();
  const {
    ready,
    hasSession,
    activeCircle,
    feedPosts,
    circleFeedItems,
    postComments,
    createPost,
    addPostComment,
    addCircleFeedPhoto,
    logout,
  } = useCircle();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareInvite, setShowShareInvite] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  useEffect(() => {
    if (ready && !hasSession) {
      router.replace('/');
    }
  }, [ready, hasSession, router]);

  const scrollBottomPad = magicNavBottomInset(insets.bottom) + spacing.md;

  if (!ready) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPadding(insets.top) + spacing.lg,
            paddingBottom: scrollBottomPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={styles.profile} onPress={() => setShowEditProfile(true)}>
            <ProfileAvatar avatarUri={profile.avatarUri} />
            <View style={styles.profileText}>
              <Text style={text.greeting}>{profile.greeting}</Text>
              <Text style={text.name}>{profile.displayName}</Text>
            </View>
          </Pressable>

          <View style={styles.logoutSwipe}>
            <SwipeToEnter
              label="Geser keluar →"
              compact
              accent
              hideIcon
              completeRatio={0.22}
              onComplete={handleLogout}
            />
          </View>
        </View>

        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={text.section}>Circle feed</Text>
            {activeCircle ? (
              <Text style={styles.circleMeta}>
                {activeCircle.emoji} {activeCircle.tag}
              </Text>
            ) : null}
          </View>
          <CircleFeedStrip
            items={circleFeedItems ?? []}
            onAdd={addCircleFeedPhoto}
            disabled={!activeCircle}
          />
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.postsLabel}>Postingan</Text>
          <PostFeedList
            posts={feedPosts ?? []}
            comments={postComments ?? []}
            onAddComment={addPostComment}
            onComposeSubmit={createPost}
            composerDisabled={!activeCircle}
          />
        </View>
      </ScrollView>

      <MainBottomNav />

      <EditProfileSheet
        visible={showEditProfile}
        profile={profile}
        circlePin={activeCircle?.pin}
        onClose={() => setShowEditProfile(false)}
        onSave={updateProfile}
        onVerifyAccountPin={verifyAccountPin}
        onChangeAccountPin={changeAccountPin}
        onResetAccountPin={resetAccountPin}
        onShareInvite={() => {
          setShowEditProfile(false);
          setShowShareInvite(true);
        }}
      />

      <ShareDevSheet visible={showShareInvite} onClose={() => setShowShareInvite(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageWarm,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPad,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.md,
  },
  profileText: {
    gap: 2,
    flexShrink: 1,
  },
  logoutSwipe: {
    width: 148,
  },
  feedSection: {
    gap: spacing.md,
  },
  feedHeader: {
    gap: 2,
  },
  circleMeta: {
    ...text.link,
  },
  postsSection: {
    gap: spacing.md,
  },
  postsLabel: {
    ...text.section,
    alignSelf: 'flex-start',
  },
});
