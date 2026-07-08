import { useEffect, useState } from 'react';
import {
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
import { BudgetSettings } from '../../types/budget';

type Props = {
  visible: boolean;
  settings: BudgetSettings | null;
  onClose: () => void;
  onSave: (patch: Partial<BudgetSettings>) => Promise<void>;
};

type FieldKey =
  | 'dailyAllowance'
  | 'coffeeWeeklyLimit'
  | 'transportWeeklyLimit'
  | 'bufferWeeklyLimit'
  | 'tradingMonthlyLimit'
  | 'coffeeAvgCup';

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'dailyAllowance', label: 'Jatah harian' },
  { key: 'coffeeWeeklyLimit', label: 'Ngopi / minggu' },
  { key: 'transportWeeklyLimit', label: 'Transport / minggu' },
  { key: 'bufferWeeklyLimit', label: 'Buffer / minggu' },
  { key: 'tradingMonthlyLimit', label: 'Trading / bulan' },
  { key: 'coffeeAvgCup', label: 'Rata-rata harga kopi' },
];

export function BudgetSettingsSheet({ visible, settings, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Record<FieldKey, string>>({
    dailyAllowance: '',
    coffeeWeeklyLimit: '',
    transportWeeklyLimit: '',
    bufferWeeklyLimit: '',
    tradingMonthlyLimit: '',
    coffeeAvgCup: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && settings) {
      setDraft({
        dailyAllowance: formatRupiahInput(settings.dailyAllowance),
        coffeeWeeklyLimit: formatRupiahInput(settings.coffeeWeeklyLimit),
        transportWeeklyLimit: formatRupiahInput(settings.transportWeeklyLimit),
        bufferWeeklyLimit: formatRupiahInput(settings.bufferWeeklyLimit),
        tradingMonthlyLimit: formatRupiahInput(settings.tradingMonthlyLimit),
        coffeeAvgCup: formatRupiahInput(settings.coffeeAvgCup),
      });
    }
  }, [visible, settings]);

  const handleSave = async () => {
    if (!settings || saving) return;
    setSaving(true);
    try {
      const patch: Partial<BudgetSettings> = {};
      for (const { key } of FIELDS) {
        const val = parseRupiahInput(draft[key]);
        if (val) patch[key] = val;
      }
      await onSave(patch);
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
            <Text style={styles.title}>Atur Budget</Text>
            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
              {FIELDS.map(({ key, label }) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    value={draft[key] ? `Rp${draft[key]}` : ''}
                    onChangeText={(t) => {
                      const parsed = parseRupiahInput(t);
                      setDraft((d) => ({
                        ...d,
                        [key]: parsed ? formatRupiahInput(parsed) : '',
                      }));
                    }}
                    keyboardType="number-pad"
                    placeholder="Rp0"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              ))}
            </ScrollView>
            <Pressable style={[styles.saveBtn, saving && styles.saveDisabled]} onPress={handleSave}>
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
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
  },
  title: { ...font('bold', 20) },
  scroll: { maxHeight: 360 },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...font('semibold', 13, colors.textSecondary), marginBottom: spacing.xs },
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
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { ...font('semibold', 15, colors.white) },
});
