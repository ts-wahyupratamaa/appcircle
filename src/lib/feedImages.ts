import { persistMediaImage } from './mediaUpload';

export async function persistFeedImage(localUri: string, circleId = 'misc'): Promise<string> {
  return persistMediaImage(localUri, `circles/${circleId}/feed`);
}
