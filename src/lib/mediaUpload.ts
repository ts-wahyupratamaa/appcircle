import * as FileSystem from 'expo-file-system/legacy';

import { API_URL, hasMediaApi } from '../constants/api';
import {
  compressForUpload,
  CompressOptions,
  presetFromScope,
  UPLOAD_FORMAT,
  UPLOAD_MIME,
} from './imageCompress';
import { isCloudBackend } from './cloudMode';

const LOCAL_DIRS: Record<string, string> = {
  feed: 'feed-images',
  avatar: 'profile-avatars',
  chat: 'chat-images',
};

async function copyLocal(localUri: string, dirName: string): Promise<string> {
  const base = FileSystem.documentDirectory;
  // web / PWA: tidak ada documentDirectory — cloud wajib
  if (!base) {
    return localUri;
  }
  const dir = `${base}${dirName}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const dest = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${UPLOAD_FORMAT}`;
  await FileSystem.copyAsync({ from: localUri, to: dest });
  return dest;
}

async function uploadToR2(localUri: string, scope: string): Promise<string> {
  const blob = await fetch(localUri).then((res) => res.blob());
  if (!blob.size) {
    throw new Error('upload empty blob');
  }

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': blob.type || UPLOAD_MIME,
      'X-Scope': scope,
      'X-Ext': UPLOAD_FORMAT,
    },
    body: blob,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`upload ${res.status} ${body}`.trim());
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new Error('upload missing url');
  }
  return data.url;
}

/** Kompres WebP → R2 (cloud wajib kalau backend cloud). */
export async function persistMediaImage(
  localUri: string,
  scope: string,
  options: CompressOptions = {},
): Promise<string> {
  const preset = presetFromScope(scope);
  const compressedUri = await compressForUpload(localUri, preset, options);

  if (hasMediaApi()) {
    return uploadToR2(compressedUri, scope);
  }

  if (isCloudBackend()) {
    throw new Error('Media API URL belum di-set');
  }

  const dir = scope.startsWith('avatars/')
    ? LOCAL_DIRS.avatar
    : scope.includes('/chat')
      ? LOCAL_DIRS.chat
      : LOCAL_DIRS.feed;

  return copyLocal(compressedUri, dir);
}

export async function pingMediaApi(): Promise<boolean> {
  if (!hasMediaApi()) return false;
  try {
    const res = await fetch(API_URL);
    const data = (await res.json()) as { ok?: boolean };
    return res.ok && data.ok === true;
  } catch {
    return false;
  }
}
