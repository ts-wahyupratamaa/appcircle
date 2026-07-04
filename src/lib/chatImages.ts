import { persistMediaImage } from './mediaUpload';

export async function persistChatImage(localUri: string, circleId: string): Promise<string> {
  return persistMediaImage(localUri, `circles/${circleId}/chat`);
}
