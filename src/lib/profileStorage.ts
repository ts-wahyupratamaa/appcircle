import AsyncStorage from '@react-native-async-storage/async-storage';

import { isCloudBackend } from './cloudMode';
import { fetchProfile, pushProfile } from './firebaseProfiles';
import { findAccountById } from '../data/accounts';

function profileKey(accountId: string): string {
  return `@instaintrov/profile/${accountId}`;
}

export type UserProfile = {
  username: string;
  displayName: string;
  greeting: string;
  avatarUri?: string | null;
};

export function defaultProfileForAccount(accountId: string): UserProfile {
  const account = findAccountById(accountId);
  const label = account?.email ?? accountId;
  return {
    username: accountId,
    displayName: label,
    greeting: 'Halo lagi 👋',
    avatarUri: null,
  };
}

export async function loadProfile(accountId: string): Promise<UserProfile> {
  if (isCloudBackend()) {
    try {
      return await fetchProfile(accountId);
    } catch {
      return defaultProfileForAccount(accountId);
    }
  }

  const raw = await AsyncStorage.getItem(profileKey(accountId));
  if (!raw) {
    return defaultProfileForAccount(accountId);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const fallback = defaultProfileForAccount(accountId);
    return {
      username: accountId,
      displayName: parsed.displayName?.trim() || fallback.displayName,
      greeting: parsed.greeting?.trim() || fallback.greeting,
      avatarUri: parsed.avatarUri ?? null,
    };
  } catch {
    return defaultProfileForAccount(accountId);
  }
}

export async function saveProfile(accountId: string, profile: UserProfile): Promise<void> {
  const payload = JSON.stringify({ ...profile, username: accountId });

  if (isCloudBackend()) {
    await pushProfile(accountId, profile);
    // mirror lokal biar reload cepat
    try {
      await AsyncStorage.setItem(profileKey(accountId), payload);
    } catch {
      // web storage penuh — cloud sudah cukup
    }
    return;
  }

  await AsyncStorage.setItem(profileKey(accountId), payload);
}
