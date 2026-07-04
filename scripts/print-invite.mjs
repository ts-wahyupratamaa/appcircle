#!/usr/bin/env node
/** Cetak teks invite untuk dishare ke WA/Telegram — jalankan: npm run invite */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shareSrc = readFileSync(join(root, 'src/constants/share.ts'), 'utf8');
const pwaMatch = shareSrc.match(/pwaUrl:\s*'([^']+)'/);
const apkMatch = shareSrc.match(/apkUrl:\s*'([^']+)'/);
const pwaUrl = pwaMatch?.[1] ?? 'https://innerly.pages.dev';
const apkUrl = apkMatch?.[1] ?? 'https://expo.dev/accounts/wahyupratama/projects/instaintrov/builds';

const accountsBlock = [
  '• aody.dev → PIN 1001',
  '• piki.dev → PIN 1002',
  '• sarah.qa → PIN 1003',
  '• meita.bl → PIN 1004',
  '• sshdkey.dev → PIN 1005',
].join('\n');

const message = `innerly — circle kita (5 orang)

🌐 Buka (iPhone + Android):
${pwaUrl}

iPhone (Safari): Share → Add to Home Screen
Android (Chrome): menu → Install app / Add to Home screen

🔑 Masuk:
1. Geser buat mulai
2. PIN akun (1 per orang):
${accountsBlock}
3. PIN circle #haters-asia: 8888

☁️ Butuh internet — data sync realtime.

(Opsional APK Android: ${apkUrl})`;

console.log(message);
