import { ACCOUNTS } from '../data/accounts';
import { HATERS_ASIA } from '../data/circles';

export const DEV_SERVER = {
  port: 8084,
  /** Update kalau IP WiFi berubah — atau jalankan `npm run invite` */
  lanHost: '192.168.0.112',
  get lanUrl() {
    return `exp://${this.lanHost}:${this.port}`;
  },
} as const;

export const EAS_PROJECT = {
  slug: 'instaintrov',
  owner: 'wahyupratama',
  projectId: '0458115e-7a30-46a8-9d30-f36aed8656e9',
  buildsUrl: 'https://expo.dev/accounts/wahyupratama/projects/instaintrov/builds',
} as const;

export const FRIEND_SHARE = {
  appName: 'innerly',
  memberCount: ACCOUNTS.length,
  circleName: HATERS_ASIA.name,
  circleTag: HATERS_ASIA.tag,
  circlePin: HATERS_ASIA.pin,
  /** PWA — primary share (Android + iPhone, laptop boleh mati) */
  pwaUrl: 'https://innerly-5nx.pages.dev',
  apkUrl: 'https://expo.dev/accounts/wahyupratama/projects/instaintrov/builds/49504fd0-2b4a-4cfb-8bc4-8e6c3d18b25a',
  accountPins: ACCOUNTS.map((account) => ({
    id: account.id,
    pin: account.pin,
  })),
} as const;

/** @deprecated use FRIEND_SHARE */
export const DEV_SHARE = FRIEND_SHARE;

export function buildShareMessage(
  pwaUrl = FRIEND_SHARE.pwaUrl,
  apkUrl = FRIEND_SHARE.apkUrl,
): string {
  const accounts = FRIEND_SHARE.accountPins
    .map((item) => `• ${item.id} → PIN ${item.pin}`)
    .join('\n');

  return `${FRIEND_SHARE.appName} — ${FRIEND_SHARE.circleName} (${FRIEND_SHARE.memberCount} orang)

🌐 Buka (iPhone + Android, gratis):
${pwaUrl}

iPhone (Safari): Share → Add to Home Screen
Android (Chrome): menu → Install app / Add to Home screen

🔑 Masuk app:
1. Geser buat mulai
2. PIN akun kamu (pilih yang kamu — jangan dobel):
${accounts}
3. PIN circle ${FRIEND_SHARE.circleTag}: ${FRIEND_SHARE.circlePin}

☁️ Butuh internet. Feed, postingan, chat grup, dan profile sync realtime.

(Opsional Android APK native: ${apkUrl})

Kalau ada masalah, kabarin ya.`;
}

export function buildExpoGoMessage(lanUrl = DEV_SERVER.lanUrl): string {
  return `innerly — testing cepat (Expo Go)

1. Install Expo Go (SDK 54)
2. WiFi harus sama dengan host
3. Buka: ${lanUrl}

Host jalankan: npm run share:lan`;
}
