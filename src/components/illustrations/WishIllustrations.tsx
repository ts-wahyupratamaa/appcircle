import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { ThemeMode } from '../../theme/palettes';
import { colors, layout } from '../../theme';

const SCALE = layout.screenW / 390;

type IllustrationProps = {
  variant?: ThemeMode;
};

export function GiftHandsIllustration({ variant = 'light' }: IllustrationProps) {
  const sparkle = variant === 'light' ? colors.primaryLight : colors.white;
  const sparkleAccent = variant === 'light' ? colors.primary : colors.illustrationCoral;
  const w = 240 * SCALE;
  const h = 220 * SCALE;
  return (
    <Svg width={w} height={h} viewBox="0 0 220 200">
      <Path
        d="M30 40 Q80 10 120 35"
        stroke={sparkle}
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />
      <Circle cx={45} cy={28} r={4} fill={sparkle} opacity={0.8} />
      <Circle cx={95} cy={18} r={3} fill={sparkleAccent} />
      <Circle cx={130} cy={32} r={5} fill={sparkle} opacity={0.6} />

      <Ellipse cx={110} cy={95} rx={28} ry={22} fill={colors.illustrationYellow} stroke={colors.black} strokeWidth={2} />
      <Rect x={98} y={78} width={24} height={18} rx={3} fill={colors.white} stroke={colors.black} strokeWidth={1.5} />
      <Path d="M104 78 L110 68 L116 78" fill={colors.illustrationCoral} stroke={colors.black} strokeWidth={1.5} />
      <Line x1={110} y1={68} x2={110} y2={42} stroke={colors.black} strokeWidth={1.5} />

      <Path
        d="M55 55 C40 75 35 100 50 120 C65 135 85 125 90 105 C95 85 80 65 55 55 Z"
        fill="#F5D5B8"
        stroke={colors.black}
        strokeWidth={2}
      />
      <Path d="M70 118 L70 145 C70 155 85 160 90 150 L95 125" fill="#F5D5B8" stroke={colors.black} strokeWidth={2} />

      <Path
        d="M165 130 C180 110 195 95 200 115 C205 135 190 155 170 150 C150 145 145 125 165 130 Z"
        fill={colors.illustrationMint}
        stroke={colors.black}
        strokeWidth={2}
      />
      <Path d="M175 148 L178 175 C180 185 165 190 158 180 L150 158" fill={colors.illustrationMint} stroke={colors.black} strokeWidth={2} />
    </Svg>
  );
}

export function SleepingDogIllustration() {
  const w = 220 * SCALE;
  const h = 130 * SCALE;
  return (
    <Svg width={w} height={h} viewBox="0 0 200 120">
      <Ellipse cx={100} cy={75} rx={55} ry={30} fill={colors.white} stroke={colors.black} strokeWidth={2} />
      <Circle cx={70} cy={58} r={22} fill={colors.white} stroke={colors.black} strokeWidth={2} />
      <Ellipse cx={58} cy={52} rx={10} ry={7} fill={colors.white} stroke={colors.black} strokeWidth={1.5} />
      <Circle cx={52} cy={50} r={2} fill={colors.black} />
      <Path d="M48 58 Q42 62 44 68" stroke={colors.black} strokeWidth={1.5} fill="none" />
      <Line x1={62} y1={48} x2={68} y2={44} stroke={colors.black} strokeWidth={1.5} />
      <Line x1={68} y1={48} x2={74} y2={44} stroke={colors.black} strokeWidth={1.5} />
      <Path d="M130 70 Q145 65 155 72" stroke={colors.black} strokeWidth={2} fill="none" />
      <Path d="M85 42 Q95 30 108 38" stroke={colors.black} strokeWidth={1.5} fill="none" />
      <Path d="M115 35 L118 28 M122 36 L126 30" stroke={colors.black} strokeWidth={1.5} />
      <Circle cx={140} cy={30} r={6} fill="none" stroke={colors.black} strokeWidth={1.5} />
      <Circle cx={155} cy={25} r={4} fill="none" stroke={colors.black} strokeWidth={1.5} />
      <Path d="M90 32 Q100 22 110 32" stroke={colors.black} strokeWidth={1} fill="none" opacity={0.5} />
      <Path d="M105 28 Q110 18 118 26" stroke={colors.black} strokeWidth={1} fill="none" opacity={0.5} />
    </Svg>
  );
}

export function PolaroidIllustration() {
  const w = 220 * SCALE;
  const h = 175 * SCALE;
  return (
    <Svg width={w} height={h} viewBox="0 0 200 160">
      <Rect x={55} y={25} width={90} height={70} rx={6} fill={colors.white} stroke={colors.black} strokeWidth={2} />
      <Rect x={62} y={32} width={76} height={50} rx={2} fill="#E8E8E8" stroke={colors.black} strokeWidth={1} />
      <Circle cx={100} cy={88} r={8} fill={colors.black} />
      <Rect x={70} y={95} width={60} height={35} rx={3} fill={colors.white} stroke={colors.black} strokeWidth={1.5} transform="rotate(-12 100 112)" />
      <Rect x={110} y={100} width={50} height={30} rx={3} fill={colors.white} stroke={colors.black} strokeWidth={1.5} transform="rotate(8 135 115)" />
      <Path d="M30 130 Q50 120 70 130" stroke={colors.black} strokeWidth={1} fill="none" opacity={0.3} strokeDasharray="4 4" />
      <Path d="M130 125 Q150 115 170 125" stroke={colors.black} strokeWidth={1} fill="none" opacity={0.3} strokeDasharray="4 4" />
    </Svg>
  );
}
