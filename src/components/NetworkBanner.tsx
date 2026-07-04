import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

type Props = {
  isOnline: boolean;
  pendingCount: number;
};

export function NetworkBanner({ isOnline, pendingCount }: Props) {
  return (
    <View style={[styles.banner, isOnline ? styles.online : styles.offline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.text}>
        {isOnline
          ? pendingCount > 0
            ? `Online — ${pendingCount} post menunggu sync`
            : 'Online — feed tersinkron'
          : 'Offline — post tetap tersimpan lokal'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  online: {
    backgroundColor: colors.online,
  },
  offline: {
    backgroundColor: colors.offline,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.cardMintDeep,
  },
  dotOffline: {
    backgroundColor: colors.cardYellow,
  },
  text: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
});
