#!/usr/bin/env node
/**
 * Wrangler Pages mengabaikan path `node_modules` + `@scope`.
 * Pindah assets ke /assets/vendor/ dan patch referensi di bundle.
 */
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const fromModules = join(dist, 'assets', 'node_modules');
const toVendor = join(dist, 'assets', 'vendor');

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkFiles(path, out);
    else out.push(path);
  }
  return out;
}

if (!existsSync(fromModules)) {
  console.log('prepare-web-dist: no assets/node_modules, skip');
  process.exit(0);
}

if (existsSync(toVendor)) {
  console.warn('prepare-web-dist: assets/vendor already exists');
} else {
  renameSync(fromModules, toVendor);
  console.log('renamed assets/node_modules → assets/vendor');
}

const scopeRenames = [
  ['@expo-google-fonts', '_expo-google-fonts'],
  ['@expo', '_expo'],
  ['@react-navigation', '_react-navigation'],
];

for (const [from, to] of scopeRenames) {
  const src = join(toVendor, from);
  const dest = join(toVendor, to);
  if (existsSync(src) && !existsSync(dest)) {
    renameSync(src, dest);
    console.log(`renamed ${from} → ${to}`);
  }
}

const replacements = [
  ['assets/node_modules', 'assets/vendor'],
  ...scopeRenames,
];

let patched = 0;
for (const file of walkFiles(dist)) {
  if (!/\.(js|html|css|json|webmanifest)$/.test(file)) continue;
  const before = readFileSync(file, 'utf8');
  let next = before;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== before) {
    writeFileSync(file, next);
    patched += 1;
  }
}

const fileCount = walkFiles(dist).length;
console.log(`prepare-web-dist: patched ${patched} files, ${fileCount} files ready`);

