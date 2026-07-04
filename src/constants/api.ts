import Constants from 'expo-constants';

/** Worker API — isi EXPO_PUBLIC_API_URL setelah `npm run worker:deploy` */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  ''
).replace(/\/$/, '');

export function hasMediaApi(): boolean {
  return API_URL.length > 0;
}
