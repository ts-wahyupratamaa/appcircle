import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendCodeInput } from './FriendCodeInput';
import { colors, layout, spacing } from '../theme';
import { lightPalette } from '../theme/palettes';

type Mode = 'change' | 'reset';

type Props = {
  visible: boolean;
  mode: Mode;
  onClose: () => void;
  onVerifyCurrent: (pin: string) => Promise<boolean>;
  onChangePin: (newPin: string) => Promise<void>;
  onResetPin: () => Promise<void>;
};

type Step = 'current' | 'new' | 'confirm';

export function AccountPinSheet({
  visible,
  mode,
  onClose,
  onVerifyCurrent,
  onChangePin,
  onResetPin,
}: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('current');
  const [draftPin, setDraftPin] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('current');
      setDraftPin('');
    }
  }, [visible, mode]);

  const handleClose = () => {
    setStep('current');
    setDraftPin('');
    onClose();
  };

  const titles =
    step === 'current'
      ? { line1: 'PIN', line2: 'sekarang' }
      : step === 'new'
        ? { line1: 'PIN', line2: 'baru' }
        : { line1: 'Ulangi', line2: 'PIN baru' };

  const subtitle =
    step === 'current'
      ? mode === 'reset'
        ? 'Verifikasi dulu buat reset PIN akun'
        : 'Masukin PIN akun yang sekarang'
      : step === 'new'
        ? 'Pilih PIN akun baru (4 digit)'
        : 'Ketik ulang PIN baru';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View
        style={[
          styles.wrap,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: lightPalette.background,
          },
        ]}
      >
        <Pressable
          style={[styles.close, { backgroundColor: lightPalette.surface }]}
          onPress={handleClose}
          hitSlop={12}
          testID="pin-sheet-close"
        >
          <Feather name="x" size={22} color={lightPalette.text} />
        </Pressable>

        <FriendCodeInput
          key={`${mode}-${step}`}
          forceLight
          line1={titles.line1}
          line2={titles.line2}
          subtitle={subtitle}
          checkingText="Memverifikasi..."
          onValidate={async (pin) => {
            if (step === 'current') {
              return onVerifyCurrent(pin);
            }
            if (step === 'new') {
              setDraftPin(pin);
              return true;
            }
            if (pin !== draftPin) {
              return false;
            }
            await onChangePin(pin);
            return true;
          }}
          onSuccess={() => {
            if (step === 'current') {
              if (mode === 'reset') {
                void onResetPin().then(handleClose);
              } else {
                setStep('new');
              }
              return;
            }
            if (step === 'new') {
              setStep('confirm');
              return;
            }
            handleClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: layout.screenPad,
  },
  close: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
