import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemeMode } from '../theme/palettes';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DURATION = 2600;

type FogBlob = {
  left: number;
  top: number;
  size: number;
  color: string;
  delay: number;
  driftY: number;
  driftX: number;
};

const LIGHT_BLOBS: FogBlob[] = [
  { left: -80, top: SCREEN_H * 0.08, size: 280, color: 'rgba(255,255,255,0.92)', delay: 0, driftY: -28, driftX: 18 },
  { left: SCREEN_W * 0.35, top: SCREEN_H * 0.22, size: 240, color: 'rgba(240,235,255,0.88)', delay: 120, driftY: -36, driftX: -12 },
  { left: -40, top: SCREEN_H * 0.48, size: 320, color: 'rgba(255,255,255,0.9)', delay: 220, driftY: -20, driftX: 24 },
  { left: SCREEN_W * 0.2, top: SCREEN_H * 0.62, size: 260, color: 'rgba(232,221,255,0.85)', delay: 300, driftY: -32, driftX: -16 },
  { left: SCREEN_W * 0.55, top: SCREEN_H * 0.38, size: 220, color: 'rgba(255,255,255,0.78)', delay: 180, driftY: -24, driftX: 10 },
];

const DARK_BLOBS: FogBlob[] = [
  { left: -80, top: SCREEN_H * 0.08, size: 280, color: 'rgba(18,14,28,0.92)', delay: 0, driftY: -28, driftX: 18 },
  { left: SCREEN_W * 0.35, top: SCREEN_H * 0.22, size: 240, color: 'rgba(40,28,68,0.88)', delay: 120, driftY: -36, driftX: -12 },
  { left: -40, top: SCREEN_H * 0.48, size: 320, color: 'rgba(12,10,20,0.9)', delay: 220, driftY: -20, driftX: 24 },
  { left: SCREEN_W * 0.2, top: SCREEN_H * 0.62, size: 260, color: 'rgba(56,36,96,0.82)', delay: 300, driftY: -32, driftX: -16 },
  { left: SCREEN_W * 0.55, top: SCREEN_H * 0.38, size: 220, color: 'rgba(24,18,38,0.78)', delay: 180, driftY: -24, driftX: 10 },
];

type Props = {
  mode: ThemeMode;
  onComplete: () => void;
};

function FogBlobView({ blob }: { blob: FogBlob }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.82);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(
      blob.delay,
      withTiming(1, { duration: DURATION * 0.72, easing }),
    );
    translateY.value = withDelay(
      blob.delay,
      withTiming(blob.driftY, { duration: DURATION, easing }),
    );
    translateX.value = withDelay(
      blob.delay,
      withTiming(blob.driftX, { duration: DURATION, easing }),
    );
    scale.value = withDelay(
      blob.delay,
      withTiming(1.12, { duration: DURATION, easing }),
    );
  }, [blob, opacity, scale, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          left: blob.left,
          top: blob.top,
          width: blob.size,
          height: blob.size,
          borderRadius: blob.size / 2,
          backgroundColor: blob.color,
        },
        style,
      ]}
    />
  );
}

export function FogEnterTransition({ mode, onComplete }: Props) {
  const wash = useSharedValue(0);
  const blobs = mode === 'dark' ? DARK_BLOBS : LIGHT_BLOBS;
  const washColor = mode === 'dark' ? 'rgba(10,10,10,0.96)' : 'rgba(250,248,255,0.96)';

  useEffect(() => {
    wash.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      onComplete();
    }, DURATION + 180);

    return () => clearTimeout(timer);
  }, [onComplete, wash]);

  const washStyle = useAnimatedStyle(() => ({
    opacity: wash.value,
  }));

  return (
    <View style={styles.overlay} pointerEvents="none" testID="fog-enter-transition">
      {blobs.map((blob, index) => (
        <FogBlobView key={index} blob={blob} />
      ))}
      <Animated.View style={[styles.wash, { backgroundColor: washColor }, washStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
});
