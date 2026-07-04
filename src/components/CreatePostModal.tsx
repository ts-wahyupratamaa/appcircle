import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Circle } from '../data/circles';
import { colors, layout, radius, shadows, spacing } from '../theme';
import { font, text } from '../theme/text';

type Props = {
  visible: boolean;
  circle: Circle | null;
  imageUri?: string | null;
  onClose: () => void;
  onSubmit: (caption: string, imageUri?: string) => Promise<void>;
};

export function CreatePostModal({ visible, circle, imageUri, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      return;
    }
    setCaption('');
    Keyboard.dismiss();
  }, [visible]);

  const handlePost = async () => {
    if ((!caption.trim() && !imageUri) || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(caption, imageUri ?? undefined);
      setCaption('');
      Keyboard.dismiss();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? spacing.sm : 0}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
            onPress={(event) => event.stopPropagation()}
            testID="create-post-sheet"
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>Post baru</Text>
              <Pressable onPress={handleClose} hitSlop={12} testID="create-post-close">
                <Feather name="x" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.meta}>
              {circle ? `${circle.emoji} ${circle.name} · ${circle.tag}` : 'Pilih circle dulu'}
            </Text>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Tulis caption fun kamu..."
              placeholderTextColor={colors.textTertiary}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={280}
              testID="create-post-input"
            />

            <View style={styles.footer}>
              <Text style={styles.count}>{caption.length}/280</Text>
              <Pressable
                style={[
                  styles.postBtn,
                  ((!caption.trim() && !imageUri) || submitting) && styles.postBtnDisabled,
                ]}
                onPress={handlePost}
                disabled={(!caption.trim() && !imageUri) || submitting}
                testID="create-post-submit"
              >
                <Feather name="send" size={16} color={colors.white} />
                <Text style={text.button}>{submitting ? 'Posting...' : 'Post'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: 300,
    backgroundColor: colors.pageWarm,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenPad,
    paddingTop: spacing.md,
    gap: spacing.md,
    ...shadows.nav,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...font('bold', 20),
  },
  meta: {
    ...font('medium', 13, colors.textSecondary),
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  input: {
    minHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.base,
    ...font('regular', 15),
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  count: {
    ...font('regular', 12, colors.textSecondary),
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  postBtnDisabled: {
    opacity: 0.45,
  },
});
