import { hasFirebase } from './firebaseDb';

/** Firestore + R2 — lokal cuma active account id + offline queue + PIN override */
export function isCloudBackend(): boolean {
  return hasFirebase();
}
