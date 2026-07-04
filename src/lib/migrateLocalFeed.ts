import AsyncStorage from '@react-native-async-storage/async-storage';

import { isCloudBackend } from './cloudMode';
import { STORAGE_KEYS } from '../types/circle';

const MIGRATED_KEY = '@instaintrov/cloud-feed-cleared';

/** Hapus seed + cache feed lokal sekali — data hidup di Firestore */
export async function clearLocalFeedCacheOnce(): Promise<void> {
  if (!isCloudBackend()) {
    return;
  }
  if (await AsyncStorage.getItem(MIGRATED_KEY)) {
    return;
  }

  await AsyncStorage.multiRemove([
    STORAGE_KEYS.posts,
    STORAGE_KEYS.seeded,
    STORAGE_KEYS.circleFeed,
    STORAGE_KEYS.circleFeedSeeded,
    STORAGE_KEYS.comments,
    STORAGE_KEYS.commentsSeeded,
    STORAGE_KEYS.chats,
    STORAGE_KEYS.chatsSeeded,
    STORAGE_KEYS.session,
    STORAGE_KEYS.circleNames,
    STORAGE_KEYS.circleDescriptions,
  ]);
  await AsyncStorage.setItem(MIGRATED_KEY, '1');
}
