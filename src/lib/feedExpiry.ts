import { deleteDoc, doc } from 'firebase/firestore';

import { API_URL, hasMediaApi } from '../constants/api';
import { CircleFeedItem } from '../types/circle';
import { isCircleFeedExpired } from '../constants/feedTtl';
import { getDb, hasFirebase } from './firebase';

export function filterActiveCircleFeed(items: CircleFeedItem[]): CircleFeedItem[] {
  return items.filter((item) => !isCircleFeedExpired(item.createdAt));
}

function r2KeyFromUrl(imageUri: string): string | null {
  try {
    const path = new URL(imageUri).pathname;
    const prefix = '/files/';
    if (!path.startsWith(prefix)) {
      return null;
    }
    return decodeURIComponent(path.slice(prefix.length));
  } catch {
    return null;
  }
}

async function deleteR2File(imageUri: string | undefined): Promise<void> {
  if (!imageUri || !hasMediaApi()) {
    return;
  }
  const key = r2KeyFromUrl(imageUri);
  if (!key) {
    return;
  }
  try {
    await fetch(`${API_URL}/files/${encodeURIComponent(key)}`, { method: 'DELETE' });
  } catch {
    // ponytail: orphan R2 file lebih aman daripada block UI
  }
}

/** Hapus dari Firestore + R2 — siapa pun yang buka app bisa trigger */
export async function purgeExpiredCircleFeed(
  circleId: string,
  items: CircleFeedItem[],
): Promise<void> {
  const expired = items.filter((item) => isCircleFeedExpired(item.createdAt));
  if (expired.length === 0) {
    return;
  }

  if (!hasFirebase()) {
    return;
  }

  await Promise.all(
    expired.map(async (item) => {
      try {
        await deleteDoc(doc(getDb(), 'circles', circleId, 'feed', item.id));
      } catch {
        // ponytail: race delete antar device
      }
      await deleteR2File(item.imageUri);
    }),
  );
}
