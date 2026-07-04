import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

import { useTheme } from '../../context/ThemeProvider';
import { colors, layout, spacing } from '../../theme';
import { getDoodleInk } from '../../theme/palettes';
import { font } from '../../theme/text';

const STROKE = 1.8;
const PIN_WORD = 42;

type ScatterItem = {
  text: string;
  highlight?: boolean;
  top: number;
  left?: number;
  right?: number;
  rotate: number;
};

type PinScatterTitleProps = {
  items: ScatterItem[];
};

export function PinScatterTitle({ items }: PinScatterTitleProps) {
  const { mode } = useTheme();
  const ink = getDoodleInk(mode);

  return (
    <View style={styles.scatterTitle}>
      {items.map((item) => (
        <Text
          key={item.text}
          style={[
            item.highlight ? styles.scatterHighlight : styles.scatterWord,
            {
              color: item.highlight ? colors.primary : ink,
              top: item.top,
              left: item.left,
              right: item.right,
              transform: [{ rotate: `${item.rotate}deg` }],
            },
          ]}
        >
          {item.text}
        </Text>
      ))}
    </View>
  );
};

type PinScatterSubtitleProps = {
  lines: { text: string; align: 'left' | 'center' | 'right'; rotate: number; offsetX?: number }[];
  style?: StyleProp<ViewStyle>;
};

export function PinScatterSubtitle({ lines, style }: PinScatterSubtitleProps) {
  const { palette } = useTheme();

  return (
    <View style={[styles.scatterSubtitle, style]}>
      {lines.map((line) => (
        <Text
          key={line.text}
          style={[
            styles.scatterSubLine,
            {
              color: palette.textMuted,
              alignSelf:
                line.align === 'left' ? 'flex-start' : line.align === 'right' ? 'flex-end' : 'center',
              marginLeft: line.align === 'left' ? (line.offsetX ?? 0) : 0,
              marginRight: line.align === 'right' ? (line.offsetX ?? 0) : 0,
              transform: [{ rotate: `${line.rotate}deg` }],
            },
          ]}
        >
          {line.text}
        </Text>
      ))}
    </View>
  );
}

type FooterProps = {
  width?: number;
  height?: number;
};

export function DoodleFooter({ width = layout.screenW, height = 120 }: FooterProps) {
  const { mode } = useTheme();
  const ink = getDoodleInk(mode);

  return (
    <View style={[styles.footerWrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 390 120">
        <Path d="M0 95 Q48 82 96 95 T192 95 T288 95 T390 95" stroke={ink} strokeWidth={STROKE} fill="none" opacity={0.25} />

        <Path d="M24 88 L40 72 L56 88" stroke={ink} strokeWidth={STROKE} fill={colors.illustrationYellow} />
        <Circle cx={88} cy={82} r={10} stroke={ink} strokeWidth={STROKE} fill="none" />
        <Path d="M82 80 Q88 88 94 80" stroke={ink} strokeWidth={1.4} fill="none" />

        <Path d="M128 78 Q148 62 168 78" stroke={ink} strokeWidth={STROKE} fill="none" />
        <Line x1={148} y1={78} x2={148} y2={94} stroke={ink} strokeWidth={STROKE} />

        <Path d="M200 86 L216 70 L232 86" stroke={ink} strokeWidth={STROKE} fill="none" />
        <Ellipse cx={272} cy={76} rx={16} ry={10} stroke={ink} strokeWidth={STROKE} fill={colors.cardBlue} />
        <Line x1={266} y1={82} x2={268} y2={90} stroke={ink} strokeWidth={1.4} />
        <Line x1={272} y1={84} x2={272} y2={92} stroke={ink} strokeWidth={1.4} />
        <Line x1={278} y1={82} x2={276} y2={90} stroke={ink} strokeWidth={1.4} />

        <Path d="M312 88 L328 72 L344 88" stroke={ink} strokeWidth={STROKE} fill={colors.cardYellow} />
        <Circle cx={368} cy={80} r={12} stroke={ink} strokeWidth={STROKE} fill="none" />

        <Circle cx={56} cy={38} r={3} fill={ink} opacity={0.5} />
        <Circle cx={180} cy={32} r={2.5} fill={ink} opacity={0.4} />
        <Circle cx={310} cy={36} r={3} fill={ink} opacity={0.5} />
      </Svg>
    </View>
  );
}

const scatterWordBase: TextStyle = {
  ...font('extrabold', PIN_WORD),
  letterSpacing: -1,
  lineHeight: PIN_WORD * 1.22,
  position: 'absolute',
};

const styles = StyleSheet.create({
  footerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.85,
  },
  scatterTitle: {
    height: 182,
    marginBottom: spacing.sm,
    overflow: 'visible',
  },
  scatterWord: scatterWordBase,
  scatterHighlight: {
    ...scatterWordBase,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'visible',
  },
  scatterSubtitle: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 92,
    overflow: 'visible',
  },
  scatterSubLine: {
    ...font('semibold', 18),
    lineHeight: 26,
    maxWidth: '92%',
    includeFontPadding: false,
  },
});
