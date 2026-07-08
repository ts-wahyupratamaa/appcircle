import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatRupiahInput, parseRupiahInput } from '../../lib/formatRupiah';
import { colors, radius, spacing } from '../../theme';
import { font } from '../../theme/text';
import { BudgetCategory, CATEGORY_TYPE_LABELS, CategoryType } from '../../types/budget';

type Props = {
  visible: boolean;
  initialName?: string;
  initialType?: CategoryType;
  onClose: () => void;
  onSave: (name: string, type: CategoryType) => Promise<void>;
};

const TYPES = Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[];

export function CategorySheet({
  visible,
  initialName = '',
  initialType = 'other',
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<CategoryType>(initialType);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setType(initialType);
    }
  }, [visible, initialName, initialType]);

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(name.trim(), type);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>Tambah Kategori</Text>

            <Text style={styles.fieldLabel}>Nama kategori</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Misal: Ngopi Coding"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Tipe</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
              {TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                    {CATEGORY_TYPE_LABELS[t]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.saveBtn, (!name.trim() || saving) && styles.saveDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || saving}
            >
              <Text style={styles.saveText}>{saving ? 'Menyimpan...' : 'Simpan Kategori'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...font('bold', 20),
  },
  fieldLabel: {
    ...font('semibold', 13, colors.textSecondary),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.base,
    ...font('medium', 16),
  },
  typeRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeChip: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.pillTrack,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    ...font('medium', 13),
  },
  typeTextActive: {
    ...font('semibold', 13, colors.white),
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    ...font('semibold', 15, colors.white),
  },
});
