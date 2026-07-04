import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../context/ThemeProvider';
import { colors, layout, radius } from '../theme';
import { font } from '../theme/text';

type Props = {
  onComplete: () => void;
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  compact?: boolean;
  subtle?: boolean;
  accent?: boolean;
  hideIcon?: boolean;
  direction?: 'forward' | 'back';
  /** 0–1, berapa jauh harus digeser (default 0.85). Logout pakai kecil biar gampang. */
  completeRatio?: number;
  /** Kalau true, thumb bisa di-reset setelah onComplete (mis. alert dibatalin) */
  confirmOnComplete?: boolean;
  resetKey?: number;
};

const THUMB = layout.swipeThumb;
const THUMB_COMPACT = 34;
const PADDING = 4;

const SPRING_BACK = { toValue: 0, useNativeDriver: false, friction: 5, tension: 90 } as const;

// ponytail: logout swipe — hampir pudar, masih kebaca
const ACCENT_TRACK = 'rgba(232, 222, 255, 0.82)';
const ACCENT_BORDER = 'rgba(204, 188, 234, 0.42)';
const ACCENT_THUMB = 'rgba(89, 36, 202, 0.38)';
const ACCENT_LABEL = 'rgba(89, 36, 202, 0.66)';

export function SwipeToEnter({
  onComplete,
  label = 'Swipe untuk masuk',
  icon,
  compact = false,
  subtle = false,
  accent = false,
  hideIcon = false,
  direction = 'forward',
  completeRatio = 0.85,
  confirmOnComplete = false,
  resetKey = 0,
}: Props) {
  const { palette } = useTheme();
  const isBack = direction === 'back';
  const resolvedIcon = icon ?? (isBack ? 'arrow-left' : 'chevrons-right');
  const isBackRef = useRef(isBack);
  isBackRef.current = isBack;
  const completeRatioRef = useRef(completeRatio);
  completeRatioRef.current = completeRatio;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const confirmRef = useRef(confirmOnComplete);
  confirmRef.current = confirmOnComplete;
  const [trackWidth, setTrackWidth] = useState(0);
  const dragX = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const maxDragRef = useRef(0);

  const thumbSize = compact ? THUMB_COMPACT : THUMB;
  const trackH = compact ? 40 : layout.swipeTrackH;

  const maxDrag = Math.max(trackWidth - thumbSize - PADDING * 2, 0);
  maxDragRef.current = maxDrag;

  const springBack = () => {
    Animated.spring(dragX, SPRING_BACK).start();
  };

  const finishSwipe = (limit: number, toValue: number) => {
    Animated.timing(dragX, {
      toValue,
      duration: 100,
      useNativeDriver: false,
    }).start(() => onCompleteRef.current());
    if (!confirmRef.current) {
      completed.current = true;
    }
  };

  const shouldComplete = (dx: number, vx: number, limit: number) => {
    if (limit <= 0) {
      return false;
    }
    const ratio = Math.min(Math.max(completeRatioRef.current, 0.12), 1);
    const need = Math.max(limit * ratio, 16);
    if (isBackRef.current) {
      return dx <= -need || (vx < -0.35 && dx < -8);
    }
    return dx >= need || (vx > 0.35 && dx > 8);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !completed.current,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !completed.current && Math.abs(gesture.dx) > 2 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        const limit = maxDragRef.current;
        if (isBackRef.current) {
          dragX.setValue(Math.min(Math.max(gesture.dx, -limit), 0));
          return;
        }
        dragX.setValue(Math.min(Math.max(gesture.dx, 0), limit));
      },
      onPanResponderRelease: (_, gesture) => {
        const limit = maxDragRef.current;
        if (shouldComplete(gesture.dx, gesture.vx, limit)) {
          finishSwipe(limit, isBackRef.current ? -limit : limit);
          return;
        }
        springBack();
      },
      onPanResponderTerminate: () => {
        springBack();
      },
    }),
  ).current;

  useEffect(() => {
    dragX.setValue(0);
    completed.current = false;
  }, [trackWidth, dragX]);

  useEffect(() => {
    if (resetKey === 0) {
      return;
    }
    completed.current = false;
    springBack();
  }, [resetKey, dragX]);

  const labelOpacity = dragX.interpolate({
    inputRange: isBack ? [-Math.max(maxDrag * 0.5, 1), 0] : [0, Math.max(maxDrag * 0.5, 1)],
    outputRange: isBack ? [0, 1] : [1, 0],
    extrapolate: 'clamp',
  });

  const trackBg = accent
    ? ACCENT_TRACK
    : subtle
      ? 'rgba(0,0,0,0.035)'
      : palette.swipeTrack;
  const trackBorder = accent ? ACCENT_BORDER : subtle ? 'rgba(0,0,0,0.06)' : palette.swipeBorder;
  const thumbBg = accent ? ACCENT_THUMB : subtle ? 'rgba(0,0,0,0.1)' : palette.swipeThumb;
  const labelColor = accent ? ACCENT_LABEL : subtle ? palette.textMuted : palette.text;
  const iconColor = accent ? colors.white : subtle ? palette.textMuted : palette.swipeIcon;

  return (
    <View
      style={[
        styles.track,
        { height: trackH },
        {
          borderColor: trackBorder,
          backgroundColor: trackBg,
        },
      ]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
      testID="swipe-track"
    >
      <Animated.Text
        style={[
          styles.label,
          compact && hideIcon && styles.labelBesideThumb,
          compact
            ? font('medium', 12, labelColor)
            : font('semibold', 14, labelColor),
          subtle && styles.labelSubtle,
          accent ? styles.labelAccent : { opacity: labelOpacity },
        ]}
        pointerEvents="none"
      >
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          styles.thumb,
          isBack ? styles.thumbBack : styles.thumbForward,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            top: (trackH - thumbSize) / 2 - PADDING / 2,
            backgroundColor: thumbBg,
            transform: [{ translateX: dragX }],
          },
        ]}
        pointerEvents="none"
        testID="swipe-thumb"
      >
        {hideIcon ? null : (
          <Feather name={resolvedIcon} size={compact ? 16 : 20} color={iconColor} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
  },
  labelBesideThumb: {
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingLeft: THUMB_COMPACT + PADDING * 3,
    paddingRight: PADDING,
  },
  labelAccent: {
    opacity: 1,
  },
  labelSubtle: {
    opacity: 0.72,
  },
  thumb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbForward: {
    left: PADDING,
  },
  thumbBack: {
    right: PADDING,
  },
});
