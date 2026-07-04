import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing } from '../src/theme';
import { font } from '../src/theme/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Halaman tidak ada' }} />
      <View style={styles.screen}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.body}>Halaman ini tidak ditemukan.</Text>
        <Link href="/" style={styles.link}>
          Kembali ke awal
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPad,
    backgroundColor: colors.pageWarm,
    gap: spacing.md,
  },
  title: {
    ...font('bold', 48, colors.primary),
  },
  body: {
    ...font('regular', 16, colors.textSecondary),
    textAlign: 'center',
  },
  link: {
    ...font('semibold', 15, colors.primary),
    marginTop: spacing.sm,
  },
});
