import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type ImagePreset = 'feed' | 'avatar' | 'chat';

/** ponytail: satu preset per use-case — cukup untuk 5 orang, ~80% lebih kecil dari RAW */
const PRESETS: Record<ImagePreset, { maxWidth: number; quality: number }> = {
  feed: { maxWidth: 1280, quality: 0.82 },
  avatar: { maxWidth: 512, quality: 0.85 },
  chat: { maxWidth: 1280, quality: 0.82 },
};

export function presetFromScope(scope: string): ImagePreset {
  if (scope.startsWith('avatars/')) {
    return 'avatar';
  }
  if (scope.includes('/chat')) {
    return 'chat';
  }
  return 'feed';
}

/**
 * Foto → WebP resize sebelum upload R2.
 * Bukan SVG (vector, bukan foto). Tidak bisa "balik HD" dari file kecil —
 * kualitas layar HP dijaga lewat maxWidth + quality ini.
 */
export async function compressForUpload(
  localUri: string,
  preset: ImagePreset = 'feed',
): Promise<string> {
  const { maxWidth, quality } = PRESETS[preset];
  const result = await manipulateAsync(
    localUri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: SaveFormat.WEBP },
  );
  return result.uri;
}

export const UPLOAD_FORMAT = 'webp' as const;
export const UPLOAD_MIME = 'image/webp';
