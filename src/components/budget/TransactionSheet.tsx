import { useEffect, useState } from 'react';
import {
  Alert,
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

import { formatRupiahInput, parseRupiahInput } from '../../lib/formatRupiah';
import { colors, radius, spacing } from '../../theme';
import { font } from '../../theme/text';
import { BudgetCategory } from '../../types/budget';

type Props = {
  visible: boolean;
  category: BudgetCategory | null;
  onClose: () => void;
  onSubmit: (payload: { categoryId: string; amount: number; note?: string }) => Promise<string | undefined>;
};

export function TransactionSheet({ visible, category, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [amountRaw, setAmountRaw] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmountRaw('');
      setNote('');
    } else {
      Keyboard.dismiss();
    }
  }, [visible]);

  const handleAmountChange = (text: string) => {
    const parsed = parseRupiahInput(text);
    setAmountRaw(parsed ? formatRupiahInput(parsed) : text.replace(/[^\d]/g, ''));
  };

  const handleSubmit = async () => {
    if (!category || saving) return;
    const amount = parseRupiahInput(amountRaw);
    if (!amount) {
      Alert.alert('Nominal tidak valid', 'Masukkan nominal lebih dari Rp0');
      return;
    }
    setSaving(true);
    try {
      const warning = await onSubmit({
        categoryId: category.id,
        amount,
        note: note.trim() || undefined,
      });
      if (warning) {
        Alert.alert('Perhatian', warning);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!category) return null;

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
            <Text style={styles.title}>Tambah Pengeluaran</Text>
            <Text style={styles.cat}>{category.name}</Text>

            <Text style={styles.fieldLabel}>Nominal</Text>
            <TextInput
              style={styles.amountInput}
              value={amountRaw ? `Rp${amountRaw}` : ''}
              onChangeText={(t) => handleAmountChange(t.replace(/^Rp/, ''))}
              placeholder="Rp35.000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              autoFocus
            />

            <Text style={styles.fieldLabel}>Catatan (opsional)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Misal: Ngoding di cafe"
              placeholderTextColor={colors.textTertiary}
            />

            <Pressable
              style={[styles.saveBtn, saving && styles.saveDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
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
  cat: {
    ...font('semibold', 15, colors.primary),
  },
  fieldLabel: {
    ...font('semibold', 13, colors.textSecondary),
  },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...font('extrabold', 28),
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.base,
    ...font('medium', 15),
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveDisabled: { opacity: 0.6 },
  saveText: {
    ...font('semibold', 15, colors.white),
  },
});
