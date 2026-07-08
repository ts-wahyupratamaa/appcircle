import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble, ChatInputBar, ChatTypingIndicator } from '../src/components/ChatBubble';
import { CircleChatIntro } from '../src/components/CircleChatIntro';
import { CircleInfoSheet } from '../src/components/CircleInfoSheet';
import { MainBottomNav } from '../src/components/MainBottomNav';
import { magicNavBottomInset } from '../src/components/BottomNav';
import { useCircle } from '../src/context/CircleProvider';
import { useProfile } from '../src/context/ProfileProvider';
import { colors, layout, shadows, spacing } from '../src/theme';
import { topPadding } from '../src/theme/safeArea';
import { font } from '../src/theme/text';
import { ChatMessage } from '../src/types/circle';

const COMPOSER_H = 60;

export default function CircleChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const {
    ready,
    hasSession,
    activeCircle,
    chatMessages,
    sendChatMessage,
    updateCircleName,
    updateCircleDescription,
  } = useCircle();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardH, setKeyboardH] = useState(0);
  const [showCircleInfo, setShowCircleInfo] = useState(false);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvt, (e) => {
      setKeyboardH(e.endCoordinates.height);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });
    const onHide = Keyboard.addListener(hideEvt, () => setKeyboardH(0));

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    if (ready && !hasSession) {
      router.replace('/');
    }
  }, [ready, hasSession, router]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages.length, activeCircle?.id]);

  useEffect(() => {
    if (inputFocused) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [inputFocused]);

  const typingPeerName = useMemo(() => {
    if (!activeCircle) {
      return 'teman';
    }
    const lastOther = [...chatMessages]
      .reverse()
      .find((msg) => msg.authorId !== profile.username);
    if (lastOther) {
      return lastOther.authorName;
    }
    const member = activeCircle.members.find((id) => id !== profile.username);
    return member ?? 'teman';
  }, [activeCircle, chatMessages, profile.username]);

  const handleSend = async () => {
    if (!draft.trim() || sending) {
      return;
    }
    setSending(true);
    try {
      await sendChatMessage(draft);
      setDraft('');
      Keyboard.dismiss();
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } finally {
      setSending(false);
    }
  };

  const navInset = magicNavBottomInset(insets.bottom);
  const composerBottom = keyboardH > 0 ? keyboardH : navInset;
  const listBottomPad = COMPOSER_H + composerBottom + spacing.md;

  if (!ready || !activeCircle) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: topPadding(insets.top) }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
          hitSlop={12}
          testID="chat-back"
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          style={styles.headerCenter}
          onPress={() => setShowCircleInfo(true)}
          testID="chat-circle-info"
        >
          <Text style={styles.headerTitle}>
            {activeCircle.emoji} {activeCircle.name}
          </Text>
          <Text style={styles.headerMeta}>
            {activeCircle.tag} · {activeCircle.members.length} orang
          </Text>
        </Pressable>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPad },
          chatMessages.length === 0 ? styles.listContentCentered : styles.listContentWithMessages,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={<CircleChatIntro circle={activeCircle} />}
        ListFooterComponent={
          inputFocused ? <ChatTypingIndicator authorName={typingPeerName} /> : null
        }
      />

      <View style={[styles.composerDock, { bottom: composerBottom }]}>
        <ChatInputBar
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          disabled={sending}
        />
      </View>

      <CircleInfoSheet
        visible={showCircleInfo}
        circle={activeCircle}
        currentUserId={profile.username}
        onClose={() => setShowCircleInfo(false)}
        onSaveName={updateCircleName}
        onSaveDescription={updateCircleDescription}
      />

      {keyboardH === 0 ? <MainBottomNav /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageWarm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPad,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.pageWarm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSide: {
    width: 40,
  },
  headerTitle: {
    ...font('bold', 17),
  },
  headerMeta: {
    ...font('regular', 12, colors.textSecondary),
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listContentCentered: {
    justifyContent: 'center',
  },
  listContentWithMessages: {
    paddingTop: spacing.lg,
  },
  composerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.pageWarm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
