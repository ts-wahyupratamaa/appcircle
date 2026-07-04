import { StyleSheet, Text, View } from 'react-native';

import { useCircle } from '../context/CircleProvider';
import { colors, layout, radius, shadows, spacing } from '../theme';
import { font, text } from '../theme/text';

export function EventRow() {
  const { activeCircle } = useCircle();

  if (!activeCircle) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={text.section}>Circle</Text>
      <View style={styles.item}>
        <View style={[styles.circle, { backgroundColor: activeCircle.bgColor }]}>
          <Text style={styles.emoji}>{activeCircle.emoji}</Text>
        </View>
        <Text style={[text.eventLabel, styles.labelActive]}>{activeCircle.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  item: {
    alignItems: 'center',
    width: layout.eventCircle + 8,
  },
  circle: {
    width: layout.eventCircle,
    height: layout.eventCircle,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
    ...shadows.card,
  },
  labelActive: {
    ...font('bold', 11),
    textAlign: 'center',
  },
  emoji: {
    fontSize: 22,
  },
});
