import Constants from 'expo-constants';

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readConfig(): FirebasePublicConfig | null {
  const extra = Constants.expoConfig?.extra as
    | { firebase?: Partial<FirebasePublicConfig> }
    | undefined;

  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra?.firebase?.apiKey ?? '';
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra?.firebase?.projectId ?? '';

  if (!apiKey || !projectId) {
    return null;
  }

  return {
    apiKey,
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra?.firebase?.authDomain ?? '',
    projectId,
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra?.firebase?.storageBucket ?? '',
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      extra?.firebase?.messagingSenderId ??
      '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra?.firebase?.appId ?? '',
  };
}

export const firebaseConfig = readConfig();

export function hasFirebaseConfig(): boolean {
  return firebaseConfig !== null;
}
