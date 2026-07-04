import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildExpoGoMessage, buildShareMessage, FRIEND_SHARE } from '../constants/share';
import { colors, layout, radius, spacing } from '../theme';
import { font, text } from '../theme/text';

type Props = {
  visible: boolean;
  onClose: () => void;
  pwaUrl?: string;
  apkUrl?: string;
};

export function ShareDevSheet({
  visible,
  onClose,
  pwaUrl = FRIEND_SHARE.pwaUrl,
  apkUrl = FRIEND_SHARE.apkUrl,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    await Share.share({
      message: buildShareMessage(pwaUrl, apkUrl),
      title: `${FRIEND_SHARE.appName} — invite circle`,
    });
  };

  const handleShareExpo = async () => {
    await Share.share({
      message: buildExpoGoMessage(),
      title: `${FRIEND_SHARE.appName} — Expo Go`,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Bagikan ke temen</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.lead}>
            Circle {FRIEND_SHARE.circleName} · {FRIEND_SHARE.memberCount} orang. Kirim link PWA + PIN
            lewat WA/Telegram (iPhone & Android).
          </Text>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>PIN akun (1 per orang)</Text>
            {FRIEND_SHARE.accountPins.map((item) => (
              <Text key={item.id} style={styles.codeRow}>
                {item.id}: <Text style={styles.code}>{item.pin}</Text>
              </Text>
            ))}
            <Text style={[styles.codeRow, styles.codeRowGap]}>
              {FRIEND_SHARE.circleTag}: <Text style={styles.code}>{FRIEND_SHARE.circlePin}</Text>
            </Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Link PWA (utama)</Text>
            <Text style={styles.link} selectable>
              {pwaUrl}
            </Text>
            <Text style={styles.step}>iPhone Safari: Share → Add to Home Screen</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>APK Android (opsional)</Text>
            <Text style={styles.link} selectable>
              {apkUrl}
            </Text>
          </View>

          <Pressable style={styles.shareBtn} onPress={handleShare} testID="share-invite">
            <Feather name="share-2" size={18} color={colors.white} />
            <Text style={text.button}>Share invite PWA</Text>
          </Pressable>

          <Pressable style={styles.shareBtnGhost} onPress={handleShareExpo}>
            <Text style={styles.shareBtnGhostText}>Share Expo Go (dev)</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.pageWarm,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenPad,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...font('bold', 20),
  },
  lead: {
    ...font('regular', 14, colors.textSecondary),
    lineHeight: 20,
  },
  block: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.xs,
  },
  blockTitle: {
    ...font('semibold', 14),
    marginBottom: spacing.xs,
  },
  codeRow: {
    ...font('regular', 14),
  },
  codeRowGap: {
    marginTop: spacing.xs,
  },
  code: {
    ...font('bold', 14, colors.primary),
  },
  step: {
    ...font('regular', 13, colors.textSecondary),
    lineHeight: 18,
  },
  link: {
    ...font('regular', 12, colors.primary),
    lineHeight: 18,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  shareBtnGhost: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  shareBtnGhostText: {
    ...font('semibold', 14, colors.primary),
  },
});
