import AsyncStorage from '@react-native-async-storage/async-storage';

import { ACCOUNTS, findAccountById } from '../data/accounts';

const STORAGE_KEY = '@instaintrov/account-pins';

export async function loadPinOverrides(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function savePinOverrides(overrides: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function defaultPinForAccount(accountId: string): string | null {
  return findAccountById(accountId)?.pin ?? null;
}

export async function resolveAccountPin(accountId: string): Promise<string | null> {
  const overrides = await loadPinOverrides();
  return overrides[accountId] ?? defaultPinForAccount(accountId);
}

export async function findAccountIdByPin(pin: string): Promise<string | null> {
  const overrides = await loadPinOverrides();
  for (const account of ACCOUNTS) {
    if ((overrides[account.id] ?? account.pin) === pin) {
      return account.id;
    }
  }
  return null;
}

export async function setAccountPinOverride(accountId: string, pin: string): Promise<void> {
  const overrides = await loadPinOverrides();
  overrides[accountId] = pin;
  await savePinOverrides(overrides);
}

export async function clearAccountPinOverride(accountId: string): Promise<void> {
  const overrides = await loadPinOverrides();
  delete overrides[accountId];
  await savePinOverrides(overrides);
}
