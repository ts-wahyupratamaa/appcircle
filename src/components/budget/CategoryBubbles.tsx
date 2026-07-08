import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { font } from '../../theme/text';
import { BudgetCategory, CATEGORY_SUGGESTIONS, CategoryType } from '../../types/budget';
import { cardPastels } from '../../theme/tokens';

type Props = {
  categories: BudgetCategory[];
  onSelect: (category: BudgetCategory) => void;
  onAddPress: () => void;
  onSuggestionPress?: (name: string, type: CategoryType) => void;
};

export function CategoryBubbles({ categories, onSelect, onAddPress, onSuggestionPress }: Props) {
  const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const suggestions = CATEGORY_SUGGESTIONS.filter((s) => !existingNames.has(s.name.toLowerCase()));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Kategori</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Pressable style={[styles.chip, styles.addChip]} onPress={onAddPress}>
          <Text style={styles.addText}>+ Tambah</Text>
        </Pressable>
        {categories.map((cat, i) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, { backgroundColor: cardPastels[i % cardPastels.length] }]}
            onPress={() => onSelect(cat)}
          >
            <Text style={styles.chipText}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {categories.length === 0 && suggestions.length > 0 ? (
        <View style={styles.suggest}>
          <Text style={styles.suggestLabel}>Saran buat mulai:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {suggestions.slice(0, 6).map((s) => (
              <Pressable
                key={`${s.name}-${s.type}`}
                style={[styles.chip, styles.suggestChip]}
                onPress={() => onSuggestionPress?.(s.name, s.type)}
              >
                <Text style={styles.suggestText}>{s.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    ...font('bold', 16),
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...font('semibold', 14),
  },
  addChip: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primaryLight,
  },
  addText: {
    ...font('bold', 14, colors.primary),
  },
  suggest: {
    gap: spacing.xs,
  },
  suggestLabel: {
    ...font('medium', 12, colors.textSecondary),
  },
  suggestChip: {
    backgroundColor: colors.white,
    borderStyle: 'dashed',
  },
  suggestText: {
    ...font('medium', 13, colors.textSecondary),
  },
});
