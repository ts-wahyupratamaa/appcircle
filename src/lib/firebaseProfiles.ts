import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { findAccountById } from '../data/accounts';
import { getDb, hasFirebase } from './firebase';
import type { UserProfile } from './profileStorage';

function fallbackProfile(accountId: string): UserProfile {
  const label = findAccountById(accountId)?.email ?? accountId;
  return {
    username: accountId,
    displayName: label,
    greeting: 'Halo lagi 👋',
    avatarUri: null,
  };
}

function docToProfile(accountId: string, data: Record<string, unknown>): UserProfile {
  const fallback = fallbackProfile(accountId);
  return {
    username: accountId,
    displayName: String(data.displayName ?? fallback.displayName).trim() || fallback.displayName,
    greeting: String(data.greeting ?? fallback.greeting).trim() || fallback.greeting,
    avatarUri: data.avatarUrl ? String(data.avatarUrl) : null,
  };
}

export async function fetchProfile(accountId: string): Promise<UserProfile> {
  const snap = await getDoc(doc(getDb(), 'accounts', accountId));
  if (!snap.exists()) {
    return fallbackProfile(accountId);
  }
  return docToProfile(accountId, snap.data());
}

export async function pushProfile(accountId: string, profile: UserProfile): Promise<void> {
  await setDoc(
    doc(getDb(), 'accounts', accountId),
    {
      displayName: profile.displayName,
      greeting: profile.greeting,
      avatarUrl: profile.avatarUri ?? null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export function watchAllProfiles(
  onData: (profiles: Record<string, UserProfile>) => void,
): () => void {
  return onSnapshot(collection(getDb(), 'accounts'), (snap) => {
    const profiles: Record<string, UserProfile> = {};
    for (const docSnap of snap.docs) {
      profiles[docSnap.id] = docToProfile(docSnap.id, docSnap.data());
    }
    onData(profiles);
  });
}

export async function fetchCircleMeta(
  circleId: string,
): Promise<{ name?: string; description?: string }> {
  const snap = await getDoc(doc(getDb(), 'circles', circleId));
  if (!snap.exists()) {
    return {};
  }
  const data = snap.data();
  return {
    name: data.name ? String(data.name) : undefined,
    description: data.description ? String(data.description) : undefined,
  };
}

export async function pushCircleMeta(
  circleId: string,
  patch: { name?: string; description?: string },
): Promise<void> {
  await setDoc(doc(getDb(), 'circles', circleId), patch, { merge: true });
}

export function watchCircleMeta(
  circleId: string,
  onData: (meta: { name?: string; description?: string }) => void,
): () => void {
  return onSnapshot(doc(getDb(), 'circles', circleId), (snap) => {
    if (!snap.exists()) {
      onData({});
      return;
    }
    const data = snap.data();
    onData({
      name: data.name ? String(data.name) : undefined,
      description: data.description ? String(data.description) : undefined,
    });
  });
}

export { hasFirebase };
