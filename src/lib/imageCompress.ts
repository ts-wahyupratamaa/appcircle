import { FlipType, manipulateAsync, SaveFormat } from 'expo-image-manipulator';

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

export type CompressOptions = {
  /** Front camera sering mirror — flip biar sesuai arah kamera asli */
  flipHorizontal?: boolean;
};

/**
 * Foto → WebP resize sebelum upload R2.
 * Bukan SVG (vector, bukan foto). Tidak bisa "balik HD" dari file kecil —
 * kualitas layar HP dijaga lewat maxWidth + quality ini.
 */
export async function compressForUpload(
  localUri: string,
  preset: ImagePreset = 'feed',
  options: CompressOptions = {},
): Promise<string> {
  const { maxWidth, quality } = PRESETS[preset];
  const actions: Parameters<typeof manipulateAsync>[1] = [{ resize: { width: maxWidth } }];
  if (options.flipHorizontal) {
    actions.unshift({ flip: FlipType.Horizontal });
  }

  try {
    const result = await manipulateAsync(localUri, actions, {
      compress: quality,
      format: SaveFormat.WEBP,
    });
    return result.uri;
  } catch (error) {
    console.warn('[innerly] compress failed, using original', error);
    if (options.flipHorizontal) {
      try {
        const flipped = await manipulateAsync(localUri, [{ flip: FlipType.Horizontal }], {
          compress: 1,
        });
        return flipped.uri;
      } catch {
        // fall through
      }
    }
    return localUri;
  }
}

export const UPLOAD_FORMAT = 'webp' as const;
export const UPLOAD_MIME = 'image/webp';
