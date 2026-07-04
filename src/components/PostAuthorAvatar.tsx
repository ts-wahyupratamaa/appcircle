import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';
import { font } from '../theme/text';

const AVATAR_COLORS = [
  colors.primaryMuted,
  colors.cardMint,
  colors.cardLavenderSoft,
  colors.cardYellowSoft,
] as const;

type Props = {
  authorId: string;
  authorName: string;
  size?: number;
  avatarUri?: string | null;
};

function pickColor(authorId: string) {
  let hash = 0;
  for (let i = 0; i < authorId.length; i += 1) {
    hash = authorId.charCodeAt(i) + hash * 31;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function PostAuthorAvatar({ authorId, authorName, size = 36, avatarUri }: Props) {
  const initial = authorName[0]?.toUpperCase() ?? '?';

  if (avatarUri) {
    return (
      <Image
        key={avatarUri}
        source={{ uri: avatarUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        recyclingKey={avatarUri}
        testID="post-author-avatar-image"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: pickColor(authorId),
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  initial: {
    ...font('bold', 14, colors.primary),
  },
});
