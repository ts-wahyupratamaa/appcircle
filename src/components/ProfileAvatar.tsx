import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors, layout, shadows } from '../theme';

type Props = {
  size?: number;
  showOnline?: boolean;
  avatarUri?: string | null;
};

function MaleFaceSvg({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={24} fill={colors.cardBlueSoft} />
      <Ellipse cx={24} cy={28} rx={14} ry={15} fill="#E8C4A8" stroke={colors.black} strokeWidth={1.5} />
      <Path
        d="M10 22 C12 14 18 10 24 10 C30 10 36 14 38 22"
        fill="#3D2314"
        stroke={colors.black}
        strokeWidth={1.5}
      />
      <Path d="M10 20 C14 18 18 20 22 18" fill="#3D2314" />
      <Path d="M26 18 C30 20 34 18 38 20" fill="#3D2314" />
      <Circle cx={18} cy={27} r={2} fill={colors.black} />
      <Circle cx={30} cy={27} r={2} fill={colors.black} />
      <Path d="M20 34 Q24 37 28 34" stroke={colors.black} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Ellipse cx={15} cy={31} rx={3} ry={2} fill="#F5A89A" opacity={0.45} />
      <Ellipse cx={33} cy={31} rx={3} ry={2} fill="#F5A89A" opacity={0.45} />
    </Svg>
  );
}

export function ProfileAvatar({ size = layout.avatar, showOnline = true, avatarUri }: Props) {
  return (
    <View style={[styles.wrap, { width: size + 6, height: size + 6 }]}>
      <View style={[styles.ring, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}>
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
              contentFit="cover"
              testID="profile-avatar-image"
            />
          ) : (
            <MaleFaceSvg size={size} />
          )}
        </View>
      </View>
      {showOnline ? <View style={styles.onlineDot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    padding: 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  avatar: {
    overflow: 'hidden',
    backgroundColor: colors.cardBlueSoft,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.cardMintDeep,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
