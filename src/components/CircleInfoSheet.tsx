import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Circle } from '../data/circles';
import { colors, layout, radius, spacing } from '../theme';
import { font, text } from '../theme/text';

type Props = {
  visible: boolean;
  circle: Circle;
  currentUserId: string;
  onClose: () => void;
  onSaveName: (name: string) => Promise<void>;
  onSaveDescription: (description: string) => Promise<void>;
};

export function CircleInfoSheet({
  visible,
  circle,
  currentUserId,
  onClose,
  onSaveName,
  onSaveDescription,
}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(circle.name);
  const [description, setDescription] = useState(circle.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(circle.name);
      setDescription(circle.description);
    }
  }, [visible, circle.name, circle.description]);

  const handleSave = async () => {
    if (!name.trim() || saving) {
      return;
    }
    setSaving(true);
    try {
      await onSaveName(name);
      await onSaveDescription(description);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
          testID="circle-info-sheet"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Info circle</Text>
            <Pressable onPress={onClose} hitSlop={12} testID="circle-info-close">
              <Feather name="x" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.circleHead}>
            <View style={[styles.emojiWrap, { backgroundColor: circle.bgColor }]}>
              <Text style={styles.emoji}>{circle.emoji}</Text>
            </View>
            <View>
              <Text style={text.wishTitle}>{circle.tag}</Text>
              <View style={styles.pinLockedRow}>
                <Feather name="lock" size={12} color={colors.textTertiary} />
                <Text style={styles.pinLocked}>PIN {circle.pin} · admin circle</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Nama circle</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={32}
            placeholder="Nama circle"
            placeholderTextColor={colors.textTertiary}
            testID="circle-name-input"
          />

          <Text style={styles.label}>Deskripsi</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            maxLength={280}
            placeholder="Ceritain circle ini buat apa..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            testID="circle-description-input"
          />
          <Text style={styles.hint}>Di chat cuma tampil 2 kalimat pertama.</Text>

          <Text style={styles.label}>Anggota ({circle.members.length})</Text>
          <ScrollView style={styles.memberList} showsVerticalScrollIndicator={false}>
            {circle.members.map((member) => (
              <View key={member} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>
                  {member}
                  {member === currentUserId ? ' · kamu' : ''}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={[styles.saveBtn, (!name.trim() || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim() || saving}
            testID="circle-name-save"
          >
            <Text style={text.button}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
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
    maxHeight: '80%',
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
  pinLockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  pinLocked: {
    ...font('regular', 12, colors.textTertiary),
  },
  label: {
    ...font('semibold', 13, colors.textSecondary),
    marginTop: spacing.xs,
  },
  input: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...font('regular', 15),
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    minHeight: 88,
  },
  hint: {
    ...font('regular', 11, colors.textTertiary),
    marginTop: -spacing.xs,
  },
  memberList: {
    maxHeight: 200,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    ...font('bold', 13, colors.primary),
  },
  memberName: {
    ...font('medium', 14),
    flex: 1,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
});
