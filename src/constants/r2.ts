/** Public R2 config — secrets stay in Worker / .env on server only */

export const R2_BUCKET = process.env.EXPO_PUBLIC_R2_BUCKET ?? 'innerly-media';

/** r2.dev atau custom domain — diisi setelah bucket + public access aktif */
export const R2_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL ?? '';

export function r2ObjectUrl(key: string): string | null {
  if (!R2_PUBLIC_BASE_URL) return null;
  const base = R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${base}/${key}`;
}
