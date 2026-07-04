import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig, hasFirebaseConfig } from '../constants/firebaseEnv';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

if (hasFirebaseConfig() && firebaseConfig) {
  app = getApps()[0] ?? initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export function hasFirebase(): boolean {
  return !!app && !!db;
}

export function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore not configured');
  }
  return db;
}
