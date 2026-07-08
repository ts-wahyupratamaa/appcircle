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

export type NavTab = 'feed' | 'budget' | 'chat';

type Props = {
  active?: NavTab;
  onFeedPress?: () => void;
  onBudgetPress?: () => void;
  onChatPress?: () => void;
};

const BAR_H = 62;
const FLOAT_SIDE = spacing.base;
const FLOAT_GAP = spacing.sm;
const INDICATOR_INSET = 5;
const CENTER_SIZE = 52;

const SLIDE_SPRING = { damping: 20, stiffness: 220, mass: 0.75 };

/** Tinggi area yang ditempati nav (float + bar) untuk padding konten */
export const NAV_CONTENT_HEIGHT = BAR_H + FLOAT_GAP + spacing.sm + 12;

export function magicNavBottomInset(insetBottom: number): number {
  return NAV_CONTENT_HEIGHT + Math.max(insetBottom, spacing.xs) + FLOAT_GAP;
}

function tabIndex(tab: NavTab) {
  if (tab === 'feed') return 0;
  if (tab === 'budget') return 1;
  return 2;
}

type TabItemProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  disabled: boolean;
};

function SideTabItem({ icon, label, isActive, onPress, disabled }: TabItemProps) {
  return (
    <Pressable style={styles.sideTab} onPress={onPress} disabled={disabled} hitSlop={6}>
      <Feather
        name={icon}
        size={22}
        color={isActive ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function BottomNav({
  active = 'feed',
  onFeedPress,
  onBudgetPress,
  onChatPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const [locked, setLocked] = useState(false);
  const tabWidth = useSharedValue(0);
  const activeIndex = useSharedValue(tabIndex(active));
  const skipActiveEffect = useRef(false);

  const runAction = useCallback(
    (tab: NavTab) => {
      if (tab === 'feed') onFeedPress?.();
      else if (tab === 'budget') onBudgetPress?.();
      else onChatPress?.();
    },
    [onBudgetPress, onChatPress, onFeedPress],
  );

  const springTo = useCallback(
    (tab: NavTab, onDone?: () => void) => {
      setLocked(true);
      activeIndex.value = withSpring(tabIndex(tab), SLIDE_SPRING, (finished) => {
        if (!finished) return;
        if (onDone) runOnJS(onDone)();
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
    if (w > 0) tabWidth.value = w / 3;
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const w = Math.max(tabWidth.value - INDICATOR_INSET * 2, 0);
    return {
      width: w,
      transform: [{ translateX: activeIndex.value * tabWidth.value + INDICATOR_INSET }],
    };
  });

  const handlePress = (tab: NavTab) => {
    if (locked) return;
    if (tab === active) {
      runAction(tab);
      return;
    }
    skipActiveEffect.current = true;
    springTo(tab, () => runAction(tab));
  };

  const safeBottom = Math.max(insets.bottom, spacing.xs);
  const budgetActive = active === 'budget';

  return (
    <View
      style={[styles.outer, { paddingBottom: safeBottom + FLOAT_GAP }]}
      pointerEvents="box-none"
    >
      <View style={styles.shell}>
        <View style={styles.bar} onLayout={onBarLayout}>
          <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />

          <SideTabItem
            icon="home"
            label="feed"
            isActive={active === 'feed'}
            disabled={locked}
            onPress={() => handlePress('feed')}
          />

          <View style={styles.centerSlot}>
            <Pressable
              style={[styles.centerBtn, budgetActive && styles.centerBtnActive]}
              onPress={() => handlePress('budget')}
              disabled={locked}
              testID="nav-budget"
            >
              <Text style={styles.centerEmoji}>💸</Text>
            </Pressable>
            <Text style={[styles.centerLabel, budgetActive && styles.centerLabelActive]}>
              duit
            </Text>
          </View>

          <SideTabItem
            icon="message-circle"
            label="chat"
            isActive={active === 'chat'}
            disabled={locked}
            onPress={() => handlePress('chat')}
          />
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
    alignItems: 'center',
    borderRadius: radius.pill,
    overflow: 'visible',
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
  },
  sideTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  tabLabel: {
    ...font('medium', 11, colors.textSecondary),
    letterSpacing: 0.2,
    textTransform: 'lowercase',
  },
  tabLabelActive: {
    ...font('semibold', 11, colors.primary),
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
    marginTop: -18,
    gap: 2,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.fab,
  },
  centerBtnActive: {
    backgroundColor: colors.black,
    transform: [{ scale: 1.06 }],
  },
  centerEmoji: {
    fontSize: 22,
  },
  centerLabel: {
    ...font('bold', 10, colors.textSecondary),
    textTransform: 'lowercase',
    letterSpacing: 0.3,
  },
  centerLabelActive: {
    ...font('bold', 10, colors.primary),
  },
});
