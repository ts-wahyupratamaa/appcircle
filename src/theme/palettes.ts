import { colors } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type ThemePalette = {
  mode: ThemeMode;
  background: string;
  backgroundOrb1: string;
  backgroundOrb2: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderActive: string;
  swipeTrack: string;
  swipeBorder: string;
  swipeThumb: string;
  swipeIcon: string;
  padKey: string;
  padKeyBorder: string;
  padKeyText: string;
  codeBox: string;
  codeBoxActive: string;
  error: string;
  statusBar: 'light' | 'dark';
};

export const lightPalette: ThemePalette = {
  mode: 'light',
  background: '#FAF8FF',
  backgroundOrb1: colors.primaryMuted,
  backgroundOrb2: colors.primaryLight,
  text: colors.textPrimary,
  textMuted: colors.textSecondary,
  textSubtle: 'rgba(0,0,0,0.42)',
  surface: colors.white,
  surfaceMuted: colors.pillTrack,
  border: colors.borderStrong,
  borderActive: colors.primary,
  swipeTrack: colors.primaryMuted,
  swipeBorder: colors.primaryLight,
  swipeThumb: colors.primary,
  swipeIcon: colors.white,
  padKey: colors.white,
  padKeyBorder: colors.border,
  padKeyText: colors.textPrimary,
  codeBox: colors.white,
  codeBoxActive: colors.primaryMuted,
  error: '#E85D4C',
  statusBar: 'dark',
};

export const darkPalette: ThemePalette = {
  mode: 'dark',
  background: '#0A0A0A',
  backgroundOrb1: 'rgba(89,36,202,0.25)',
  backgroundOrb2: 'rgba(204,188,234,0.2)',
  text: colors.textOnDark,
  textMuted: 'rgba(255,255,255,0.75)',
  textSubtle: 'rgba(255,255,255,0.4)',
  surface: 'rgba(255,255,255,0.08)',
  surfaceMuted: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.35)',
  borderActive: colors.white,
  swipeTrack: 'rgba(255,255,255,0.06)',
  swipeBorder: colors.onboardingDarkBorder,
  swipeThumb: colors.white,
  swipeIcon: colors.black,
  padKey: 'rgba(255,255,255,0.08)',
  padKeyBorder: 'rgba(255,255,255,0.1)',
  padKeyText: colors.textOnDark,
  codeBox: 'rgba(255,255,255,0.08)',
  codeBoxActive: 'rgba(255,255,255,0.14)',
  error: colors.illustrationCoral,
  statusBar: 'light',
};

export function getPalette(mode: ThemeMode): ThemePalette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

export function getDoodleInk(mode: ThemeMode): string {
  return mode === 'dark' ? colors.textOnDark : colors.doodleInk;
}

export function getDoodleFill(mode: ThemeMode): string {
  return mode === 'dark' ? darkPalette.codeBox : colors.white;
}
