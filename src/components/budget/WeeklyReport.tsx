import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRupiah } from '../../lib/formatRupiah';
import { formatDateWIB } from '../../lib/wibTime';
import { colors, radius, spacing } from '../../theme';
import { font } from '../../theme/text';
import { WeeklyBudgetSummary } from '../../types/budget';

type Props = {
  weekly: WeeklyBudgetSummary;
};

export function WeeklyReport({ weekly }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Laporan Mingguan</Text>
      <Text style={styles.range}>
        {formatDateWIB(weekly.weekStart)} – {formatDateWIB(weekly.weekEnd)}
      </Text>

      <View style={styles.summaryGrid}>
        <SummaryItem label="Jatah harian total" value={weekly.totalDailyAllowance} />
        <SummaryItem label="Pengeluaran harian" value={weekly.totalDailySpent} />
        <SummaryItem label="Masuk weekend" value={weekly.totalRolledToWeekend} accent={colors.cardLavender} />
        <SummaryItem label="Ngopi" value={weekly.coffee} />
        <SummaryItem label="Transport" value={weekly.transport} />
        <SummaryItem label="Belanja/lain" value={weekly.other} />
        <SummaryItem label="Tabungan" value={weekly.saving} accent={colors.cardBlue} />
        <SummaryItem label="Saham" value={weekly.investment} accent={colors.cardYellow} />
        <SummaryItem label="Trading" value={weekly.trading} />
        {weekly.totalOverbudget > 0 ? (
          <SummaryItem label="Overbudget" value={weekly.totalOverbudget} warn />
        ) : null}
      </View>

      <Text style={styles.section}>Per Hari</Text>
      {weekly.days.map((day) => {
        const open = expanded === day.date;
        return (
          <View key={day.date} style={styles.dayCard}>
            <Pressable style={styles.dayHeader} onPress={() => setExpanded(open ? null : day.date)}>
              <View>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                <Text style={styles.dayDate}>{formatDateWIB(day.date)}</Text>
              </View>
              <View style={styles.dayRight}>
                <Text style={styles.daySpent}>{formatRupiah(day.spent)}</Text>
                <Text style={[styles.dayRemain, day.dailyRemaining < 0 && styles.over]}>
                  sisa {formatRupiah(day.dailyRemaining)}
                </Text>
                {day.rolledToWeekend > 0 ? (
                  <Text style={styles.rolled}>+{formatRupiah(day.rolledToWeekend)} weekend</Text>
                ) : null}
              </View>
            </Pressable>
            {open && day.transactions.length > 0 ? (
              <View style={styles.txList}>
                {day.transactions.map((tx) => (
                  <View key={tx.id} style={styles.txRow}>
                    <Text style={styles.txName}>{tx.categoryNameSnapshot}</Text>
                    <Text style={styles.txAmount}>{formatRupiah(tx.amount)}</Text>
                  </View>
                ))}
              </View>
            ) : open ? (
              <Text style={styles.emptyDay}>Belum ada transaksi</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function SummaryItem({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: string;
  warn?: boolean;
}) {
  return (
    <View style={[styles.item, accent ? { backgroundColor: accent } : null]}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={[styles.itemValue, warn && styles.over]}>{formatRupiah(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { ...font('bold', 18) },
  range: { ...font('medium', 13, colors.textSecondary) },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLabel: { ...font('medium', 11, colors.textSecondary) },
  itemValue: { ...font('bold', 15), marginTop: 2 },
  over: { color: colors.primary },
  section: { ...font('bold', 16), marginTop: spacing.sm },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  dayLabel: { ...font('bold', 15) },
  dayDate: { ...font('medium', 12, colors.textSecondary) },
  dayRight: { alignItems: 'flex-end', gap: 2 },
  daySpent: { ...font('bold', 14) },
  dayRemain: { ...font('medium', 12, colors.textSecondary) },
  rolled: { ...font('semibold', 11, colors.primary) },
  txList: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.base, gap: spacing.sm },
  txRow: { flexDirection: 'row', justifyContent: 'space-between' },
  txName: { ...font('medium', 13) },
  txAmount: { ...font('bold', 13) },
  emptyDay: { ...font('medium', 12, colors.textSecondary), padding: spacing.base },
});
