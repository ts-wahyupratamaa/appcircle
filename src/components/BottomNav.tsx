import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '../theme';
import { font } from '../theme/text';

export type NavTab = 'feed' | 'chat';

type Props = {
  active?: NavTab;
  onFeedPress?: () => void;
  onChatPress?: () => void;
};

const TABS: { key: NavTab; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { key: 'feed', icon: 'home', label: 'Feed' },
  { key: 'chat', icon: 'message-circle', label: 'Chat' },
];

const BAR_H = 62;
const FLOAT_SIDE = spacing.base;
const FLOAT_GAP = spacing.sm;
const INDICATOR_INSET = 5;

const SLIDE_SPRING = { damping: 20, stiffness: 220, mass: 0.75 };

/** Tinggi area yang ditempati nav (float + bar) untuk padding konten */
export const NAV_CONTENT_HEIGHT = BAR_H + FLOAT_GAP + spacing.sm;

export function magicNavBottomInset(insetBottom: number): number {
  return NAV_CONTENT_HEIGHT + Math.max(insetBottom, spacing.xs) + FLOAT_GAP;
}

function tabIndex(tab: NavTab) {
  return TABS.findIndex((item) => item.key === tab);
}

type TabItemProps = {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
  disabled: boolean;
};

function TabItem({ tab, isActive, onPress, disabled }: TabItemProps) {
  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      disabled={disabled}
      testID={`nav-${tab.key}`}
      hitSlop={6}
    >
      <Feather
        name={tab.icon}
        size={22}
        color={isActive ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

export function BottomNav({
  active = 'feed',
  onFeedPress,
  onChatPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const [locked, setLocked] = useState(false);
  const tabWidth = useSharedValue(0);
  const activeIndex = useSharedValue(tabIndex(active));
  const skipActiveEffect = useRef(false);

  const runAction = useCallback(
    (tab: NavTab) => {
      if (tab === 'feed') {
        onFeedPress?.();
      } else {
        onChatPress?.();
      }
    },
    [onChatPress, onFeedPress],
  );

  const springTo = useCallback(
    (tab: NavTab, onDone?: () => void) => {
      setLocked(true);
      activeIndex.value = withSpring(tabIndex(tab), SLIDE_SPRING, (finished) => {
        if (!finished) {
          return;
        }
        if (onDone) {
          runOnJS(onDone)();
        }
        runOnJS(setLocked)(false);
      });
    },
    [activeIndex],
  );

  useEffect(() => {
    if (skipActiveEffect.current) {
      skipActiveEffect.current = false;
      return;
    }
    springTo(active);
  }, [active, springTo]);

  const onBarLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0) {
      tabWidth.value = w / TABS.length;
    }
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const w = Math.max(tabWidth.value - INDICATOR_INSET * 2, 0);
    return {
      width: w,
      transform: [{ translateX: activeIndex.value * tabWidth.value + INDICATOR_INSET }],
    };
  });

  const handlePress = (tab: NavTab) => {
    if (locked) {
      return;
    }
    if (tab === active) {
      runAction(tab);
      return;
    }
    skipActiveEffect.current = true;
    springTo(tab, () => runAction(tab));
  };

  const safeBottom = Math.max(insets.bottom, spacing.xs);

  return (
    <View
      style={[styles.outer, { paddingBottom: safeBottom + FLOAT_GAP }]}
      pointerEvents="box-none"
    >
      <View style={styles.shell}>
        <View style={styles.bar} onLayout={onBarLayout}>
          <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
          {TABS.map((tab) => (
            <TabItem
              key={tab.key}
              tab={tab}
              isActive={active === tab.key}
              disabled={locked}
              onPress={() => handlePress(tab.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: FLOAT_SIDE,
    backgroundColor: 'transparent',
  },
  shell: {
    ...shadows.card,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bar: {
    height: BAR_H,
    flexDirection: 'row',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  tabLabel: {
    ...font('medium', 11, colors.textSecondary),
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    ...font('semibold', 11, colors.primary),
  },
});
