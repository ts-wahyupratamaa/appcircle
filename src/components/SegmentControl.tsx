import { Pressable, StyleSheet, Text, View } from 'react-native';

import { layout, colors, radius, spacing } from '../theme';
import { text } from '../theme/text';

type Mode = 'slideshow' | 'list';

type Props = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

export function SegmentControl({ value, onChange }: Props) {
  return (
    <View style={styles.track} testID="segment-control">
      <Pressable
        style={[styles.segment, value === 'slideshow' && styles.segmentActive]}
        onPress={() => onChange('slideshow')}
        testID="segment-slideshow"
      >
        <Text style={value === 'slideshow' ? text.segmentActive : text.segmentInactive}>
          Slide show
        </Text>
      </Pressable>
      <Pressable
        style={[styles.segment, value === 'list' && styles.segmentActive]}
        onPress={() => onChange('list')}
        testID="segment-list"
      >
        <Text style={value === 'list' ? text.segmentActive : text.segmentInactive}>
          List
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    alignSelf: 'flex-start',
    minWidth: layout.segmentMinW * 2 + 8,
  },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: layout.segmentMinW * 0.35,
    borderRadius: radius.pill,
    minWidth: layout.segmentMinW,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.pillActive,
  },
});
