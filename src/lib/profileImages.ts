import { persistMediaImage } from './mediaUpload';

export async function persistProfileAvatar(localUri: string, accountId: string): Promise<string> {
  return persistMediaImage(localUri, `avatars/${accountId}`);
}
