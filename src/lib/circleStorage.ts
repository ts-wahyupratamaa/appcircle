import { isCloudBackend } from './cloudMode';
import { HATERS_ASIA_ID } from '../data/circles';
import { pushCircleMeta } from './firebaseProfiles';
import {
  clearActiveAccount,
  hasActiveAccount,
  loadActiveAccount,
  saveActiveAccount,
} from './activeAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types/circle';

export { clearActiveAccount, hasActiveAccount, loadActiveAccount, saveActiveAccount };

export async function loadCircleNames(): Promise<Record<string, string>> {
  if (isCloudBackend()) {
    return {};
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.circleNames);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function saveCircleName(circleId: string, name: string): Promise<void> {
  if (isCloudBackend()) {
    try {
      await pushCircleMeta(circleId, { name: name.trim() });
      return;
    } catch (error) {
      console.warn('[innerly] pushCircleMeta(name) failed', error);
    }
  }
  const names = await loadCircleNames();
  names[circleId] = name.trim();
  await AsyncStorage.setItem(STORAGE_KEYS.circleNames, JSON.stringify(names));
}

export async function loadCircleDescriptions(): Promise<Record<string, string>> {
  if (isCloudBackend()) {
    return {};
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.circleDescriptions);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function saveCircleDescription(circleId: string, description: string): Promise<void> {
  if (isCloudBackend()) {
    try {
      await pushCircleMeta(circleId, { description: description.trim() });
      return;
    } catch (error) {
      console.warn('[innerly] pushCircleMeta(description) failed', error);
    }
  }
  const descriptions = await loadCircleDescriptions();
  descriptions[circleId] = description.trim();
  await AsyncStorage.setItem(STORAGE_KEYS.circleDescriptions, JSON.stringify(descriptions));
}

/** @deprecated pakai activeAccount */
export const HATERS_ASIA_CIRCLE_ID = HATERS_ASIA_ID;
