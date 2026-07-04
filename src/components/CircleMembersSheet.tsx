import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Circle } from '../data/circles';
import { colors, layout, radius, spacing } from '../theme';
import { font, text } from '../theme/text';

type Props = {
  visible: boolean;
  circles: Circle[];
  onClose: () => void;
  onLogout?: () => void;
};

export function CircleMembersSheet({ visible, circles, onClose, onLogout }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Circles kamu</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {circles.map((circle) => (
              <View key={circle.id} style={styles.circleBlock}>
                <View style={styles.circleHead}>
                  <View style={[styles.emojiWrap, { backgroundColor: circle.bgColor }]}>
                    <Text style={styles.emoji}>{circle.emoji}</Text>
                  </View>
                  <View>
                    <Text style={text.wishTitle}>{circle.name}</Text>
                    <Text style={text.link}>{circle.tag} · PIN {circle.pin}</Text>
                  </View>
                </View>
                <View style={styles.members}>
                  {circle.members.map((member) => (
                    <View key={member} style={styles.memberChip}>
                      <Text style={styles.memberText}>{member}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {onLogout ? (
            <Pressable style={styles.logoutBtn} onPress={onLogout} testID="sheet-logout">
              <Feather name="log-out" size={18} color={colors.textPrimary} />
              <Text style={styles.logoutText}>Keluar circle</Text>
            </Pressable>
          ) : null}
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
    maxHeight: '75%',
    backgroundColor: colors.pageWarm,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenPad,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...font('bold', 20),
  },
  circleBlock: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  circleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  members: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memberChip: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  memberText: {
    ...font('medium', 12),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    ...font('semibold', 14),
  },
});
