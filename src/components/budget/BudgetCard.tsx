import { StyleSheet, Text, View } from 'react-native';

import { formatRupiah } from '../../lib/formatRupiah';
import { colors, radius, shadows, spacing } from '../../theme';
import { font } from '../../theme/text';
import { BudgetStatus } from '../../types/budget';

type Props = {
  title: string;
  emoji?: string;
  limit?: number;
  spent?: number;
  remaining?: number;
  value?: number;
  subtitle?: string;
  status?: BudgetStatus;
  accent?: string;
  warningText?: string;
};

const STATUS_BG: Record<BudgetStatus, string> = {
  safe: colors.cardMint,
  warning: colors.warning,
  overbudget: colors.cardPeach,
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  safe: 'aman ✨',
  warning: 'hampir habis ⚡',
  overbudget: 'overbudget 💀',
};

export function BudgetCard({
  title,
  emoji,
  limit,
  spent,
  remaining,
  value,
  subtitle,
  status = 'safe',
  accent,
  warningText,
}: Props) {
  const bg = accent ?? STATUS_BG[status];

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {emoji ? `${emoji} ` : ''}
          {title}
        </Text>
        {status ? <Text style={styles.badge}>{STATUS_LABEL[status]}</Text> : null}
      </View>

      {value !== undefined ? (
        <Text style={styles.hero}>{formatRupiah(value)}</Text>
      ) : null}

      {limit !== undefined ? (
        <View style={styles.row}>
          <Text style={styles.label}>Limit</Text>
          <Text style={styles.amount}>{formatRupiah(limit)}</Text>
        </View>
      ) : null}
      {spent !== undefined ? (
        <View style={styles.row}>
          <Text style={styles.label}>Terpakai</Text>
          <Text style={styles.amount}>{formatRupiah(spent)}</Text>
        </View>
      ) : null}
      {remaining !== undefined ? (
        <View style={styles.row}>
          <Text style={styles.label}>Sisa</Text>
          <Text style={[styles.amount, remaining < 0 && styles.over]}>
            {formatRupiah(remaining)}
          </Text>
        </View>
      ) : null}
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {warningText ? <Text style={styles.warn}>{warningText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...font('bold', 15),
    flex: 1,
  },
  badge: {
    ...font('semibold', 11, colors.textSecondary),
  },
  hero: {
    ...font('extrabold', 28),
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...font('medium', 13, colors.textSecondary),
  },
  amount: {
    ...font('bold', 15),
  },
  over: {
    color: colors.primary,
  },
  sub: {
    ...font('medium', 12, colors.textSecondary),
    marginTop: spacing.xs,
  },
  warn: {
    ...font('semibold', 12, colors.primary),
    marginTop: spacing.xs,
  },
});
