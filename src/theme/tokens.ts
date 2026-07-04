/**
 * InstaIntrov Design System
 * Ekstraksi dari referensi UI (wishlist app — soft pop / pastel minimalist).
 * Semua screen HARUS pakai token ini, jangan hardcode hex di komponen.
 */

export const colors = {
  /** Base */
  black: '#000000',
  white: '#FFFFFF',
  page: '#FFFFFF',
  pageWarm: '#F5F3F1',

  /** Primary action — pill button (light onboarding variant) */
  primary: '#5924CA',
  primaryHover: '#5A29B8',
  primaryLight: '#CCBCEA',
  primaryMuted: '#E8DEFF',

  /** Onboarding dark variant */
  onboardingDark: '#000000',
  onboardingDarkText: '#FFFFFF',
  onboardingDarkBorder: '#FFFFFF',

  /** Card pastels — wish / event cards */
  cardMint: '#C8F0D8',
  cardMintDeep: '#ABF0C4',
  cardLavender: '#E0D1F8',
  cardLavenderSoft: '#F0E8FF',
  cardYellow: '#FFE9A6',
  cardYellowSoft: '#FEF6D2',
  cardBlue: '#DFF3FA',
  cardBlueSoft: '#E6F4FF',
  cardPeach: '#ECDFC7',

  /** Onboarding illustration splash */
  splashBlue: '#E4FCFF',
  splashBlueSoft: '#E6FBFF',

  /** Event category circles */
  eventWedding: '#E5E9EA',
  eventBirthday: '#DFDED8',
  eventNewYear: '#F5FBF6',
  eventWomensDay: '#FCF0F4',

  /** Illustration accents (line-art doodles) */
  illustrationMint: '#A8E6CF',
  illustrationYellow: '#FFE082',
  illustrationCoral: '#FFB4A2',

  /** Onboarding doodle poster — active PIN box */
  doodleHighlight: '#E8DEFF',
  doodlePink: '#FFC8E8',
  doodleInk: '#000000',

  /** Text */
  textPrimary: '#000000',
  textOnDark: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textLink: '#9CA3AF',

  /** UI chrome */
  border: '#F0F0F0',
  borderStrong: '#E5E5EA',
  pillTrack: '#F2F2F7',
  pillActive: '#000000',
  dotActive: '#000000',
  dotInactive: '#D1D1D6',
  navBar: '#FFFFFF',
  /** Magic nav indicator — ungu primary */
  navIndicator: '#5924CA',
  fab: '#000000',
  fabIcon: '#FFFFFF',

  /** Semantic (tetap selaras palet) */
  success: '#ABF0C4',
  warning: '#FFE9A6',
  offline: '#FFF0C4',
  online: '#C8F0D8',
} as const;

export const typography = {
  /** Geometric sans — match Poppins / Montserrat dari referensi */
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extrabold: 'Poppins_800ExtraBold',
    /** Fallback sebelum font load */
    system: 'System',
  },

  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 30,
    '3xl': 34,
    hero: 44,
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.55,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  screen: 20,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  '2xl': 32,
  pill: 999,
  circle: 9999,
  event: 9999,
  fab: 9999,
} as const;

export const shadows = {
  /** Soft diffused — cards "pop" off white bg */
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  fab: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  nav: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

/** Preset komponen — copy paste ke StyleSheet */
export const components = {
  screen: {
    flex: 1,
    backgroundColor: colors.page,
  },
  screenDark: {
    flex: 1,
    backgroundColor: colors.onboardingDark,
  },
  screenPadding: {
    paddingHorizontal: spacing.screen,
  },

  /** Heading besar seperti "Make your wish" / "My wishes" */
  headingHero: {
    fontSize: typography.size.hero,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
  },
  headingHeroDark: {
    fontSize: typography.size.hero,
    fontWeight: '800' as const,
    color: colors.textOnDark,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
  },
  headingSection: {
    fontSize: typography.size.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.size.base,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  caption: {
    fontSize: typography.size.sm,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  link: {
    fontSize: typography.size.sm,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },

  /** Primary CTA — purple pill (light mode onboarding) */
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonPrimaryText: {
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: '600' as const,
  },

  /** Outlined CTA — dark onboarding "Start wishing" */
  buttonOutlineDark: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.onboardingDarkBorder,
    borderRadius: radius.pill,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonOutlineDarkText: {
    color: colors.textOnDark,
    fontSize: typography.size.base,
    fontWeight: '600' as const,
  },

  /** Segmented pill — "Slide show" | "List" */
  segmentTrack: {
    flexDirection: 'row' as const,
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  segmentActive: {
    backgroundColor: colors.pillActive,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  segmentActiveText: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: '600' as const,
  },
  segmentInactiveText: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: '500' as const,
  },

  /** Wish card — pastel top + white info bottom */
  wishCard: {
    borderRadius: radius.xl,
    overflow: 'hidden' as const,
    ...shadows.card,
  },
  wishCardInfo: {
    backgroundColor: colors.white,
    padding: spacing.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  wishCardTitle: {
    fontSize: typography.size.md,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  wishCardPrice: {
    fontSize: typography.size.md,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },

  /** Event circle icon */
  eventCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.circle,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  eventLabel: {
    fontSize: typography.size.xs,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center' as const,
  },

  /** FAB center nav */
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.fab,
    backgroundColor: colors.fab,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...shadows.fab,
  },

  /** Tag chip — "Birthday" */
  tag: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start' as const,
  },
  tagText: {
    fontSize: typography.size.sm,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },

  /** Carousel dots */
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
} as const;

/** Mapping card pastel by kategori / index */
export const cardPastels = [
  colors.cardMint,
  colors.cardLavender,
  colors.cardYellow,
  colors.cardBlue,
  colors.cardPeach,
] as const;

export const eventPastels = {
  wedding: colors.eventWedding,
  birthday: colors.eventBirthday,
  newYear: colors.eventNewYear,
  womensDay: colors.eventWomensDay,
} as const;

export type CardPastel = (typeof cardPastels)[number];
export type EventType = keyof typeof eventPastels;
