import { colors } from '../theme';

export type PostIllustration = 'dog' | 'polaroid' | 'gift';

export type PostItem = {
  id: string;
  tag: string;
  caption: string;
  cardColor: string;
  illustration: PostIllustration;
};

export const HOME_POSTS: PostItem[] = [
  {
    id: '1',
    tag: '#temendekat',
    caption: 'weekend vibes only. no productivity allowed 🛋️',
    cardColor: colors.cardMint,
    illustration: 'dog',
  },
  {
    id: '2',
    tag: '#circle-wahyu',
    caption: 'circle closed — yang punya code doang yang boleh liat wkwk 🔒',
    cardColor: colors.cardLavender,
    illustration: 'polaroid',
  },
  {
    id: '3',
    tag: '#random',
    caption: 'mabar sampai pagi, siapa ikut? drop emoji 👇',
    cardColor: colors.cardYellow,
    illustration: 'gift',
  },
];

export const DETAIL_POSTS: PostItem[] = [
  {
    id: 'd1',
    tag: '#temendekat',
    caption: 'foto random tapi vibes-nya 100/10 ✨',
    cardColor: colors.cardYellow,
    illustration: 'polaroid',
  },
  {
    id: 'd2',
    tag: '#circle-wahyu',
    caption: 'throwback liburan — kangen banget plis 🏝️',
    cardColor: colors.cardBlue,
    illustration: 'dog',
  },
  {
    id: 'd3',
    tag: '#random',
    caption: 'POV: lagi ngobrol sampe subuh terus ketawa doang wkwk',
    cardColor: colors.cardLavender,
    illustration: 'gift',
  },
];

/** @deprecated use PostItem */
export type WishItem = PostItem;

/** @deprecated use HOME_POSTS */
export const HOME_WISHES = HOME_POSTS;

/** @deprecated use DETAIL_POSTS */
export const DETAIL_WISHES = DETAIL_POSTS;
