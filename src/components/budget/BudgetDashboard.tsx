import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRupiah } from '../../lib/formatRupiah';
import { colors, spacing } from '../../theme';
import { font } from '../../theme/text';
import { useBudget } from '../../context/BudgetProvider';
import { BudgetCard } from './BudgetCard';
import { CategoryBubbles } from './CategoryBubbles';
import { WeeklyReport } from './WeeklyReport';
import { BudgetCategory, CategoryType } from '../../types/budget';

type Props = {
  onCategorySelect: (cat: BudgetCategory) => void;
  onAddCategory: () => void;
  onSuggestion: (name: string, type: CategoryType) => void;
  onSettings: () => void;
};

export function BudgetDashboard({
  onCategorySelect,
  onAddCategory,
  onSuggestion,
  onSettings,
}: Props) {
  const {
    daily,
    coffeeBucket,
    transportBucket,
    weekendBalance,
    monthly,
    weekly,
    categories,
  } = useBudget();

  const tradingWarning =
    monthly && monthly.trading.status === 'overbudget'
      ? 'Melewati batas trading bulanan'
      : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>duit tracker 💸</Text>
        <Pressable style={styles.gear} onPress={onSettings} hitSlop={8}>
          <Feather name="settings" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <CategoryBubbles
        categories={categories}
        onSelect={onCategorySelect}
        onAddPress={onAddCategory}
        onSuggestionPress={onSuggestion}
      />

      {daily ? (
        <BudgetCard
          title="Hari Ini"
          emoji="☀️"
          limit={daily.allowance}
          spent={daily.spent}
          remaining={daily.remaining}
          status={daily.status}
        />
      ) : null}

      {coffeeBucket ? (
        <BudgetCard
          title="Ngopi Minggu Ini"
          emoji="☕"
          limit={coffeeBucket.limit}
          spent={coffeeBucket.spent}
          remaining={coffeeBucket.remaining}
          status={coffeeBucket.status}
          subtitle={coffeeBucket.extraLabel}
        />
      ) : null}

      {transportBucket ? (
        <BudgetCard
          title="Transport Minggu Ini"
          emoji="🚆"
          limit={transportBucket.limit}
          spent={transportBucket.spent}
          remaining={transportBucket.remaining}
          status={transportBucket.status}
        />
      ) : null}

      <BudgetCard
        title="Saldo Weekend"
        emoji="🎉"
        value={weekendBalance}
        subtitle="Dari sisa jatah harian — buat weekend"
        accent={colors.cardLavender}
        status={weekendBalance > 0 ? 'safe' : 'warning'}
      />

      {monthly ? (
        <BudgetCard
          title="Trading Bulan Ini"
          emoji="📈"
          limit={monthly.trading.limit}
          spent={monthly.trading.spent}
          remaining={monthly.trading.remaining}
          status={monthly.trading.status}
          warningText={tradingWarning}
        />
      ) : null}

      {monthly ? (
        <View style={styles.savingRow}>
          <View style={[styles.savingCard, { backgroundColor: colors.cardBlue }]}>
            <Text style={styles.savingLabel}>Tabungan bulan ini</Text>
            <Text style={styles.savingValue}>{formatRupiah(monthly.saving)}</Text>
          </View>
          <View style={[styles.savingCard, { backgroundColor: colors.cardYellow }]}>
            <Text style={styles.savingLabel}>Saham bulan ini</Text>
            <Text style={styles.savingValue}>{formatRupiah(monthly.investment)}</Text>
          </View>
        </View>
      ) : null}

      {weekly ? <WeeklyReport weekly={weekly} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    ...font('extrabold', 28),
    letterSpacing: -0.5,
  },
  gear: {
    padding: spacing.sm,
  },
  savingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  savingCard: {
    flex: 1,
    borderRadius: 20,
    padding: spacing.base,
    gap: spacing.xs,
  },
  savingLabel: {
    ...font('medium', 12, colors.textSecondary),
  },
  savingValue: {
    ...font('bold', 16),
  },
});
