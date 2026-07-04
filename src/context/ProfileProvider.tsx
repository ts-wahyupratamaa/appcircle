import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearAccountPinOverride,
  resolveAccountPin,
  setAccountPinOverride,
} from '../lib/accountPinStorage';
import { isCloudBackend } from '../lib/cloudMode';
import { pushProfile, watchAllProfiles } from '../lib/firebaseProfiles';
import {
  defaultProfileForAccount,
  loadProfile,
  saveProfile,
  UserProfile,
} from '../lib/profileStorage';

type ProfilePatch = Pick<UserProfile, 'displayName' | 'greeting'> & {
  avatarUri?: string | null;
};

type ProfileContextValue = {
  profile: UserProfile;
  accountId: string | null;
  ready: boolean;
  profileFor: (accountId: string) => UserProfile;
  signInAs: (accountId: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  verifyAccountPin: (pin: string) => Promise<boolean>;
  changeAccountPin: (newPin: string) => Promise<void>;
  resetAccountPin: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const GUEST_PROFILE: UserProfile = {
  username: 'guest',
  displayName: 'guest',
  greeting: 'Halo lagi 👋',
  avatarUri: null,
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (!isCloudBackend()) {
      return;
    }
    return watchAllProfiles(setProfiles);
  }, []);

  /** Live profile by account id — milik sendiri dari state lokal (setelah edit), orang lain dari Firestore watch */
  const profileFor = useCallback(
    (id: string): UserProfile => {
      if (id === accountId || id === profile.username) {
        return profile;
      }
      return profiles[id] ?? defaultProfileForAccount(id);
    },
    [accountId, profile, profiles],
  );

  const signInAs = useCallback(async (nextAccountId: string) => {
    const loaded = await loadProfile(nextAccountId);
    const next: UserProfile = { ...loaded, username: nextAccountId };
    setAccountId(nextAccountId);
    setProfile(next);
    setProfiles((current) => ({ ...current, [nextAccountId]: next }));
    setReady(true);
    // pastikan doc accounts/{id} ada di Firestore biar teman lihat nama/foto
    if (isCloudBackend()) {
      void pushProfile(nextAccountId, next).catch((error) => {
        console.warn('[innerly] ensure profile failed', error);
      });
    }
  }, []);

  const signOut = useCallback(() => {
    setAccountId(null);
    setProfile(GUEST_PROFILE);
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!accountId) {
        return;
      }
      const fallback = defaultProfileForAccount(accountId);
      const next: UserProfile = {
        username: accountId,
        displayName: patch.displayName.trim() || fallback.displayName,
        greeting: patch.greeting.trim() || fallback.greeting,
        avatarUri: patch.avatarUri !== undefined ? patch.avatarUri : profile.avatarUri ?? null,
      };
      // update UI dulu — jangan ditimpa snapshot lama
      setProfile(next);
      setProfiles((current) => ({ ...current, [accountId]: next }));
      await saveProfile(accountId, next);
    },
    [accountId, profile],
  );

  const verifyAccountPin = useCallback(
    async (pin: string) => {
      if (!accountId) {
        return false;
      }
      const current = await resolveAccountPin(accountId);
      return current === pin;
    },
    [accountId],
  );

  const changeAccountPin = useCallback(
    async (newPin: string) => {
      if (!accountId || newPin.length !== 4) {
        return;
      }
      await setAccountPinOverride(accountId, newPin);
    },
    [accountId],
  );

  const resetAccountPin = useCallback(async () => {
    if (!accountId) {
      return;
    }
    await clearAccountPinOverride(accountId);
  }, [accountId]);

  const value = useMemo(
    () => ({
      profile,
      accountId,
      ready,
      profileFor,
      signInAs,
      signOut,
      updateProfile,
      verifyAccountPin,
      changeAccountPin,
      resetAccountPin,
    }),
    [
      profile,
      accountId,
      ready,
      profileFor,
      signInAs,
      signOut,
      updateProfile,
      verifyAccountPin,
      changeAccountPin,
      resetAccountPin,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
