import { StyleSheet, Text, View } from 'react-native';

import { Circle } from '../data/circles';
import { colors, spacing } from '../theme';
import { font } from '../theme/text';

const AVATAR = 96;

function trimToTwoSentences(text: string): string {
  const normalized = text.trim();
  if (!normalized) {
    return '';
  }
  const sentences = normalized.match(/[^.!?…]+[.!?…]+(?:\s|$)|[^.!?…]+$/g);
  if (!sentences?.length) {
    return normalized;
  }
  return sentences
    .slice(0, 2)
    .map((part) => part.trim())
    .join(' ')
    .trim();
}

type Props = {
  circle: Circle;
};

export function CircleChatIntro({ circle }: Props) {
  const blurb = trimToTwoSentences(circle.description);

  return (
    <View style={styles.wrap}>
      <View style={[styles.avatar, { backgroundColor: circle.bgColor }]}>
        <Text style={styles.emoji}>{circle.emoji}</Text>
      </View>
      <Text style={styles.title}>{circle.name}</Text>
      <Text style={styles.meta}>
        {circle.tag} · {circle.members.length} orang
      </Text>
      {blurb ? <Text style={styles.description}>{blurb}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    ...font('semibold', 16),
    textAlign: 'center',
  },
  meta: {
    ...font('regular', 13, colors.textSecondary),
    textAlign: 'center',
    lineHeight: 18,
  },
  description: {
    ...font('regular', 13, colors.textSecondary),
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.sm,
    maxWidth: 300,
  },
});
