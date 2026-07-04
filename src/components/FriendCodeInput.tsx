import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../context/ThemeProvider';
import { colors, radius, spacing } from '../theme';
import { getDoodleFill, getDoodleInk, lightPalette } from '../theme/palettes';
import { font } from '../theme/text';

type Props = {
  line1?: string;
  line2?: string;
  subtitle?: string;
  hint?: string;
  checkingText?: string;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  variant?: 'default' | 'doodle';
  /** Pakai palette light (sheet profil / ubah PIN) — tidak ikut dark mode */
  forceLight?: boolean;
  style?: StyleProp<ViewStyle>;
  onSuccess: () => void;
  onValidate: (code: string) => Promise<boolean>;
};

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export function FriendCodeInput({
  line1 = 'Masuk',
  line2 = 'circle',
  subtitle = 'Ketik kode yang dikasih temen kamu',
  hint,
  checkingText = 'Memverifikasi...',
  hideTitle = false,
  hideSubtitle = false,
  variant = 'default',
  forceLight = false,
  style,
  onSuccess,
  onValidate,
}: Props) {
  const theme = useTheme();
  const mode = forceLight ? 'light' : theme.mode;
  const palette = forceLight ? lightPalette : theme.palette;
  const doodle = variant === 'doodle';
  const ink = getDoodleInk(mode);
  const doodleFill = getDoodleFill(mode);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const shakeError = () => {
    setError(true);
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setTimeout(() => setError(false), 1500));
  };

  const verifyCode = async (value: string) => {
    setChecking(true);
    try {
      const ok = await onValidate(value);
      if (ok) {
        onSuccess();
      } else {
        setCode('');
        shakeError();
      }
    } finally {
      setChecking(false);
    }
  };

  const applyDigit = (digit: string) => {
    if (checking || code.length >= 4) {
      return;
    }
    const next = `${code}${digit}`;
    setCode(next);
    setError(false);
    if (next.length === 4) {
      verifyCode(next);
    }
  };

  const handlePadPress = (key: (typeof PAD_KEYS)[number]) => {
    if (key === '') {
      return;
    }
    if (key === 'del') {
      setCode((prev) => prev.slice(0, -1));
      setError(false);
      return;
    }
    applyDigit(key);
  };

  const textColor = doodle ? ink : palette.text;
  const mutedColor = palette.textMuted;
  const subtleColor = palette.textSubtle;

  return (
    <View style={[styles.wrap, doodle && styles.wrapDoodle, style]} testID="friend-code-input">
      <View style={styles.top}>
        {hideTitle ? null : (
          <>
            <Text style={[styles.heroLine, { color: textColor }]}>{line1}</Text>
            <Text style={[styles.heroLine, { color: textColor }]}>{line2}</Text>
          </>
        )}
        {hideSubtitle || !subtitle ? null : (
          <Text style={[styles.subtitle, { color: mutedColor }, hideTitle && styles.subtitleTight]}>
            {subtitle}
          </Text>
        )}

        <Animated.View style={[styles.boxes, { transform: [{ translateX: shake }] }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              testID={error ? 'code-error' : undefined}
              style={[
                styles.box,
                !doodle && { borderColor: palette.border, backgroundColor: palette.codeBox },
                !doodle && code.length === i && {
                  borderColor: palette.borderActive,
                  backgroundColor: palette.codeBoxActive,
                },
                doodle && {
                  borderColor: ink,
                  backgroundColor: doodleFill,
                  borderWidth: 1.5,
                },
                doodle && code.length === i && {
                  borderColor: ink,
                  backgroundColor: colors.doodleHighlight,
                },
                error && {
                  borderColor: palette.error,
                  backgroundColor: 'rgba(232, 93, 76, 0.14)',
                },
              ]}
            >
              <Text style={[styles.digit, { color: textColor }]}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </Animated.View>

        {checking ? (
          <Text style={[styles.status, { color: subtleColor }]}>{checkingText}</Text>
        ) : hint ? (
          <Text style={[styles.hint, { color: subtleColor }]}>{hint}</Text>
        ) : null}
      </View>

      <View style={[styles.pad, doodle && styles.padDoodle]}>
        {PAD_KEYS.map((key, index) => (
          <Pressable
            key={`${key}-${index}`}
            style={[
              styles.padKey,
              doodle && key !== '' && {
                backgroundColor: doodleFill,
                borderColor: ink,
                borderWidth: 1.5,
              },
              !doodle && key !== '' && {
                backgroundColor: palette.padKey,
                borderColor: palette.padKeyBorder,
              },
              key === '' && styles.padKeyEmpty,
            ]}
            onPress={() => handlePadPress(key)}
            disabled={key === '' || checking}
            testID={key === 'del' ? 'code-delete' : key ? `code-key-${key}` : undefined}
          >
            {key === 'del' ? (
              <Text style={[styles.padKeyText, { color: doodle ? ink : palette.padKeyText }]}>⌫</Text>
            ) : key ? (
              <Text style={[styles.padKeyText, { color: doodle ? ink : palette.padKeyText }]}>{key}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  wrapDoodle: {
    flex: 0,
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  top: {
    gap: spacing.sm,
  },
  heroLine: {
    ...font('extrabold', 36),
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    ...font('regular', 15),
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  subtitleTight: {
    marginTop: 0,
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 56,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    ...font('bold', 22),
  },
  status: {
    ...font('medium', 13),
    textAlign: 'center',
  },
  hint: {
    ...font('medium', 12),
    textAlign: 'center',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  padDoodle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  padKey: {
    width: '30%',
    maxWidth: 100,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  padKeyEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  padKeyText: {
    ...font('semibold', 20),
  },
});
