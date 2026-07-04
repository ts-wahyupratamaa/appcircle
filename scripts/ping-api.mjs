#!/usr/bin/env node
/** Cek Worker API — npm run worker:ping */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

function readApiUrl() {
  if (!existsSync(envPath)) return '';
  const match = readFileSync(envPath, 'utf8').match(/^EXPO_PUBLIC_API_URL=(.+)$/m);
  return (match?.[1] ?? '').trim();
}

const apiUrl = readApiUrl();
if (!apiUrl) {
  console.log('EXPO_PUBLIC_API_URL belum diisi di .env');
  console.log('Deploy dulu: npm run worker:install && npm run worker:deploy');
  process.exit(1);
}

const res = await fetch(apiUrl);
const body = await res.text();
console.log(`${res.status} ${apiUrl}`);
console.log(body);
