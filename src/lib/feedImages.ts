import { CompressOptions } from './imageCompress';
import { persistMediaImage } from './mediaUpload';

export async function persistFeedImage(
  localUri: string,
  circleId = 'misc',
  options: CompressOptions = {},
): Promise<string> {
  return persistMediaImage(localUri, `circles/${circleId}/feed`, options);
}
