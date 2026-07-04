import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendCodeInput } from '../src/components/FriendCodeInput';
import { FogEnterTransition } from '../src/components/FogEnterTransition';
import { SwipeToEnter } from '../src/components/SwipeToEnter';
import {
  DoodleFooter,
  PinScatterSubtitle,
  PinScatterTitle,
} from '../src/components/onboarding/OnboardingDoodles';
import { useCircle } from '../src/context/CircleProvider';
import { useTheme } from '../src/context/ThemeProvider';
import { bottomPadding, topPadding } from '../src/theme/safeArea';
import { colors, getDoodleInk, layout, radius, spacing } from '../src/theme';
import { font } from '../src/theme/text';

type Step = 'swipe' | 'account' | 'circle';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toggleMode, mode, palette } = useTheme();
  const { ready, hasSession, validateAccountPin, enterCircle } = useCircle();
  const [step, setStep] = useState<Step>('swipe');
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [fogEntering, setFogEntering] = useState(false);

  useEffect(() => {
    if (ready && hasSession && !fogEntering) {
      router.replace('/home');
    }
  }, [ready, hasSession, fogEntering, router]);

  const ink = getDoodleInk(mode);

  if (!ready || (hasSession && !fogEntering)) {
    return (
      <View style={[styles.screen, styles.loading, { backgroundColor: palette.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.statusBar} />
      <DoodleFooter />

      <View style={[styles.topBar, { paddingTop: topPadding(insets.top) }]}>
        <Pressable
          style={[styles.themeBtn, { backgroundColor: palette.surface, borderColor: ink }]}
          onPress={toggleMode}
          hitSlop={12}
          testID="theme-toggle"
        >
          <Feather name={mode === 'light' ? 'moon' : 'sun'} size={18} color={palette.text} />
        </Pressable>
      </View>

      <View style={[styles.content, { paddingBottom: bottomPadding(insets.bottom) }]}>
        {step === 'swipe' ? (
          <View style={styles.swipeBlock}>
            <View style={styles.swipeCopy}>
              <Text style={[styles.heroTitle, { color: ink }]}>
                Bebas{'\n'}
                <Text style={styles.heroHighlight}>bereksprasi</Text>
                {'\n'}
                bersama circle{'\n'}
                terdekat terpilih
              </Text>
              <Text style={[styles.doodleLead, { color: palette.textMuted }]}>
                Ruang pribadi buat share cerita, foto, dan chat bareng orang yang kamu pilih.
              </Text>
            </View>
            <SwipeToEnter
              label="Geser buat mulai →"
              icon="arrow-right"
              onComplete={() => setStep('account')}
            />
          </View>
        ) : (
          <>
            <View style={styles.heroPin}>
              {step === 'account' ? (
                <PinScatterTitle
                  items={[
                    { text: 'Masuk', top: 0, left: 4, rotate: -5 },
                    { text: 'akun', highlight: true, top: 52, right: 8, rotate: 4 },
                    { text: 'kamu', top: 108, left: 36, rotate: -2 },
                  ]}
                />
              ) : (
                <PinScatterTitle
                  items={[
                    { text: 'Circle', top: 4, right: 12, rotate: 3 },
                    { text: 'terpilih', highlight: true, top: 58, left: 0, rotate: -4 },
                  ]}
                />
              )}
            </View>

            {step === 'account' ? (
              <View style={styles.pinBlock}>
                <PinScatterSubtitle
                  lines={[
                    { text: 'PIN akun —', align: 'left', rotate: -3, offsetX: 6 },
                    { text: 'cuma buat kamu', align: 'right', rotate: 2, offsetX: 10 },
                    { text: 'dan temen yang diundang', align: 'left', rotate: -1.5, offsetX: 20 },
                  ]}
                />
                <FriendCodeInput
                  key="pin-account"
                  variant="doodle"
                  hideTitle
                  hideSubtitle
                  checkingText="Cek PIN akun..."
                  style={styles.pinInput}
                  onValidate={async (pin) => {
                    const accountId = await validateAccountPin(pin);
                    if (!accountId) {
                      return false;
                    }
                    setPendingAccountId(accountId);
                    return true;
                  }}
                  onSuccess={() => setStep('circle')}
                />
                <View style={styles.pinBack}>
                  <SwipeToEnter
                    direction="back"
                    label="← Geser buat balik"
                    icon="arrow-left"
                    onComplete={() => {
                      setPendingAccountId(null);
                      setStep('swipe');
                    }}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.pinBlock}>
                <PinScatterSubtitle
                  lines={[
                    { text: 'PIN circle —', align: 'right', rotate: 2, offsetX: 4 },
                    { text: 'gabung ruang', align: 'left', rotate: -2.5, offsetX: 8 },
                    { text: 'bareng orang terdekatmu', align: 'center', rotate: 1.5 },
                  ]}
                />
                <FriendCodeInput
                  key="pin-circle"
                  variant="doodle"
                  hideTitle
                  hideSubtitle
                  checkingText="Masuk circle..."
                  style={styles.pinInput}
                  onValidate={async (pin) => {
                    if (!pendingAccountId) {
                      return false;
                    }
                    return enterCircle(pin, pendingAccountId);
                  }}
                  onSuccess={() => setFogEntering(true)}
                />
                <View style={styles.pinBack}>
                  <SwipeToEnter
                    direction="back"
                    label="← Geser buat balik"
                    icon="arrow-left"
                    onComplete={() => {
                      setPendingAccountId(null);
                      setStep('account');
                    }}
                  />
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {fogEntering ? (
        <FogEnterTransition mode={mode} onComplete={() => router.replace('/home')} />
      ) : null}
    </View>
  );
}

const HERO = 34;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: layout.screenPad,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  swipeBlock: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  swipeCopy: {
    gap: spacing.md,
  },
  heroPin: {
    paddingTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...font('extrabold', HERO),
    letterSpacing: -0.8,
    lineHeight: HERO * 1.15,
    marginBottom: spacing.md,
  },
  heroHighlight: {
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    ...font('extrabold', HERO),
    letterSpacing: -0.8,
    lineHeight: HERO * 1.2,
    paddingVertical: 2,
  },
  doodleLead: {
    ...font('regular', 15),
    lineHeight: 22,
    maxWidth: 300,
  },
  pinBlock: {
    flex: 1,
  },
  pinInput: {
    flexGrow: 0,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  pinBack: {
    marginTop: 'auto',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
});
