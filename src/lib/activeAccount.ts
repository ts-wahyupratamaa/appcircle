import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@instaintrov/active-account';

/** Cuma ingat akun mana yang login — bukan session object */
export async function loadActiveAccount(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function saveActiveAccount(accountId: string): Promise<void> {
  await AsyncStorage.setItem(KEY, accountId);
}

export async function clearActiveAccount(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function hasActiveAccount(accountId: string | null): boolean {
  return Boolean(accountId);
}
