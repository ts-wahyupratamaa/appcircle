import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Proporsi UI dari referensi — basis lebar layar */
export const layout = {
  screenW: SCREEN_W,
  screenH: SCREEN_H,
  screenPad: 20,

  /** Onboarding */
  onboardingIllustrationMinH: SCREEN_H * 0.42,
  heroSize: 44,
  heroLineGap: 2,

  /** Header home */
  avatar: 44,
  headerGap: 24,

  /** Event circles */
  eventCircle: 56,
  eventGap: 20,

  /** Post card home — proporsi referensi: kartu besar, media dominan */
  wishCardRadius: 28,
  wishIllustrationH: SCREEN_H * 0.34,
  postCaptionH: 60,
  wishInfoH: 76,
  wishCardGap: 16,
  wishPeek: 12,

  /** Bottom nav — docked bar */
  fab: 60,
  fabLift: 18,
  navBarH: 52,
  navFloatRadius: 28,
  navFloatMarginH: 16,

  /** Detail screen */
  screenTitleSize: 30,
  segmentMinW: 108,
  detailCardH: SCREEN_H * 0.52,
  detailCardRadius: 32,

  /** Code input */
  codeBox: 52,
  codeBoxH: 60,

  /** Swipe track */
  swipeTrackH: 60,
  swipeThumb: 52,
} as const;

export function wishCardWidth(fullBleed = true) {
  if (fullBleed) {
    return SCREEN_W - layout.screenPad * 2;
  }
  return SCREEN_W - layout.screenPad * 2 - layout.wishPeek;
}
