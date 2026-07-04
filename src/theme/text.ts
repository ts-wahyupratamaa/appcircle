import { StyleSheet, TextStyle } from 'react-native';

import { colors, typography } from '../theme';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const family: Record<Weight, string> = {
  regular: typography.fontFamily.regular,
  medium: typography.fontFamily.medium,
  semibold: typography.fontFamily.semibold,
  bold: typography.fontFamily.bold,
  extrabold: typography.fontFamily.extrabold,
};

export function font(
  weight: Weight,
  size: number,
  color: string = colors.textPrimary,
): TextStyle {
  return {
    fontFamily: family[weight],
    fontSize: size,
    color,
  };
}

export const text = StyleSheet.create({
  hero: {
    ...font('extrabold', typography.size.hero),
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
  },
  heroDark: {
    ...font('extrabold', typography.size.hero, colors.textOnDark),
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
  },
  heroSub: {
    ...font('regular', typography.size.lg, colors.textOnDark),
    lineHeight: typography.size.lg * typography.lineHeight.snug,
  },
  screenTitle: {
    ...font('extrabold', typography.size['2xl']),
    letterSpacing: typography.letterSpacing.tight,
  },
  section: {
    ...font('bold', typography.size.lg),
  },
  greeting: {
    ...font('regular', typography.size.sm, colors.textSecondary),
  },
  name: {
    ...font('bold', typography.size.lg),
    letterSpacing: -0.3,
  },
  body: {
    ...font('regular', typography.size.base),
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  link: {
    ...font('medium', typography.size.sm, colors.textSecondary),
  },
  button: {
    ...font('semibold', typography.size.base, colors.white),
  },
  buttonDark: {
    ...font('semibold', typography.size.base, colors.textOnDark),
  },
  wishTitle: {
    ...font('bold', typography.size.md),
  },
  caption: {
    ...font('medium', typography.size.sm),
    flex: 1,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  wishPrice: {
    ...font('bold', typography.size.md),
  },
  eventLabel: {
    ...font('medium', typography.size.xs),
    textAlign: 'center',
  },
  tag: {
    ...font('semibold', typography.size.sm),
  },
  segmentActive: {
    ...font('semibold', typography.size.sm, colors.white),
  },
  segmentInactive: {
    ...font('medium', typography.size.sm),
  },
  navLabel: {
    ...font('medium', typography.size.xs),
  },
  url: {
    ...font('regular', typography.size.sm, colors.textLink),
  },
});
