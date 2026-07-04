/** Circle feed strip (foto horizontal) — hapus otomatis 24 jam dari waktu post */
export const CIRCLE_FEED_TTL_MS = 24 * 60 * 60 * 1000;

export function isCircleFeedExpired(createdAt: string, now = Date.now()): boolean {
  const posted = new Date(createdAt).getTime();
  if (Number.isNaN(posted)) {
    return false;
  }
  return now - posted >= CIRCLE_FEED_TTL_MS;
}

export function circleFeedExpiresAt(createdAt: string): Date {
  return new Date(new Date(createdAt).getTime() + CIRCLE_FEED_TTL_MS);
}
