import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { persistProfileAvatar } from '../lib/profileImages';
import { UserProfile } from '../lib/profileStorage';
import { AccountPinSheet } from './AccountPinSheet';
import { ProfileAvatar } from './ProfileAvatar';
import { colors, layout, radius, spacing } from '../theme';
import { font, text } from '../theme/text';

type ProfilePatch = Pick<UserProfile, 'displayName' | 'greeting'> & {
  avatarUri?: string | null;
};

type Props = {
  visible: boolean;
  profile: UserProfile;
  circlePin?: string;
  onClose: () => void;
  onSave: (patch: ProfilePatch) => Promise<void>;
  onVerifyAccountPin: (pin: string) => Promise<boolean>;
  onChangeAccountPin: (newPin: string) => Promise<void>;
  onResetAccountPin: () => Promise<void>;
  onShareInvite?: () => void;
};

export function EditProfileSheet({
  visible,
  profile,
  circlePin,
  onClose,
  onSave,
  onVerifyAccountPin,
  onChangeAccountPin,
  onResetAccountPin,
  onShareInvite,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * 0.82);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [greeting, setGreeting] = useState(profile.greeting);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile.avatarUri ?? null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pinMode, setPinMode] = useState<'change' | 'reset' | null>(null);

  const previewUri = pendingAvatarUri ?? avatarUri;

  useEffect(() => {
    if (visible) {
      setDisplayName(profile.displayName);
      setGreeting(profile.greeting);
      setAvatarUri(profile.avatarUri ?? null);
      setPendingAvatarUri(null);
    }
  }, [visible, profile]);

  const handlePickAvatar = async () => {
    if (picking || saving) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Akses galeri', 'Izinkan akses foto buat ganti foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setPendingAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedAvatarUri: string | null = avatarUri;

      if (pendingAvatarUri) {
        savedAvatarUri = await persistProfileAvatar(pendingAvatarUri, profile.username);
      }

      await onSave({
        displayName,
        greeting,
        avatarUri: savedAvatarUri,
      });
      onClose();
    } catch {
      Alert.alert('Gagal simpan', 'Coba lagi ya.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
          <View
            style={[
              styles.sheet,
              {
                maxHeight: sheetMaxHeight,
                paddingBottom: insets.bottom + spacing.lg,
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: sheetMaxHeight - insets.bottom - spacing.lg * 2 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              bounces
              nestedScrollEnabled
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Profil</Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Feather name="x" size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.avatarSection}>
                <Pressable
                  style={styles.avatarTap}
                  onPress={handlePickAvatar}
                  disabled={picking || saving}
                  testID="edit-avatar-pick"
                >
                  <ProfileAvatar size={88} showOnline={false} avatarUri={previewUri} />
                  <View style={styles.avatarBadge}>
                    <Feather name="camera" size={14} color={colors.white} />
                  </View>
                </Pressable>
                <View style={styles.avatarActions}>
                  <Pressable
                    style={styles.avatarBtn}
                    onPress={handlePickAvatar}
                    disabled={picking || saving}
                  >
                    <Text style={styles.avatarBtnText}>Ganti foto</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Nama tampilan</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Nama kamu"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={32}
                  testID="edit-display-name"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Sapaan</Text>
                <TextInput
                  style={styles.input}
                  value={greeting}
                  onChangeText={setGreeting}
                  placeholder="Halo lagi 👋"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={48}
                  testID="edit-greeting"
                />
              </View>

              <Text style={styles.hint}>Username: @{profile.username}</Text>

              <View style={styles.pinSection}>
                <Text style={styles.label}>PIN akun</Text>
                <View style={styles.pinRow}>
                  <View style={styles.pinValue}>
                    <Text style={styles.pinDots}>••••</Text>
                  </View>
                  <Pressable
                    style={styles.pinBtn}
                    onPress={() => setPinMode('change')}
                    testID="profile-change-pin"
                  >
                    <Text style={styles.pinBtnText}>Ubah PIN</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => setPinMode('reset')} testID="profile-reset-pin">
                  <Text style={styles.resetPin}>Reset PIN akun</Text>
                </Pressable>
              </View>

              {circlePin ? (
                <View style={styles.pinSection}>
                  <Text style={styles.label}>PIN circle</Text>
                  <View style={[styles.pinRow, styles.pinRowLocked]} pointerEvents="none">
                    <View style={styles.pinValueLocked}>
                      <Feather name="lock" size={14} color={colors.textTertiary} />
                      <Text style={styles.pinLockedText}>{circlePin}</Text>
                    </View>
                    <Text style={styles.pinLockedHint}>Admin circle</Text>
                  </View>
                </View>
              ) : null}

              {onShareInvite ? (
                <Pressable
                  style={styles.shareInviteBtn}
                  onPress={onShareInvite}
                  testID="profile-share-invite"
                >
                  <Feather name="share-2" size={16} color={colors.primary} />
                  <Text style={styles.shareInviteText}>Bagikan invite ke temen</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving || !displayName.trim()}
                testID="edit-profile-save"
              >
                <Text style={text.button}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AccountPinSheet
        visible={pinMode !== null}
        mode={pinMode ?? 'change'}
        onClose={() => setPinMode(null)}
        onVerifyCurrent={onVerifyAccountPin}
        onChangePin={onChangeAccountPin}
        onResetPin={onResetAccountPin}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.pageWarm,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenPad,
    paddingTop: spacing.lg,
  },
  sheetContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...font('bold', 20),
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatarTap: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
  },
  avatarBtnText: {
    ...font('semibold', 13, colors.primary),
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...font('semibold', 13, colors.textSecondary),
  },
  input: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.base,
    ...font('regular', 15),
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    ...font('regular', 12, colors.textTertiary),
  },
  pinSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pinRowLocked: {
    opacity: 0.72,
  },
  pinValue: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinDots: {
    ...font('bold', 18, colors.textPrimary),
    letterSpacing: 4,
  },
  pinBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
  },
  pinBtnText: {
    ...font('semibold', 13, colors.primary),
  },
  resetPin: {
    ...font('medium', 13, colors.textSecondary),
    textDecorationLine: 'underline',
  },
  pinValueLocked: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinLockedText: {
    ...font('semibold', 15, colors.textTertiary),
    letterSpacing: 2,
  },
  pinLockedHint: {
    ...font('regular', 12, colors.textTertiary),
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  shareInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    marginTop: spacing.xs,
  },
  shareInviteText: {
    ...font('semibold', 14, colors.primary),
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
});
