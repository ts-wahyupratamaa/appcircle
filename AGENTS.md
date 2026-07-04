# InstaIntrov

App mobile pribadi (React Native + Expo SDK 57). Bukan untuk Play Store / App Store — distribusi via APK share ke teman.

## Stack

- Expo ~57, React Native 0.86, TypeScript
- Offline: `@react-native-async-storage/async-storage`
- Online detection: `@react-native-community/netinfo`
- Build & share: EAS (`eas.json` profile `preview` → APK Android)

## Arsitektur

- Draft intro disimpan lokal dulu (`src/lib/introStorage.ts`)
- Sync saat online (`src/lib/syncService.ts`) — placeholder API, ganti nanti
- Network banner + auto-sync di `src/screens/HomeScreen.tsx`

## Design system (WAJIB)

Referensi visual: `assets/reference/` (2 screenshot). Style: **soft pop / pastel minimalist**.

Semua UI pakai `src/theme/tokens.ts` — jangan hardcode warna.

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `primary` | `#5924CA` | Tombol utama (pill purple) |
| `black` / `white` | `#000000` / `#FFFFFF` | Text, FAB, pill active, onboarding dark |
| `cardMint` | `#C8F0D8` | Wish card (variant 1) |
| `cardLavender` | `#E0D1F8` | Wish card (variant 2) |
| `cardYellow` | `#FFE9A6` | Detail / slideshow card |
| `cardBlue` | `#DFF3FA` | Detail card alternatif |
| `splashBlue` | `#E4FCFF` | Onboarding illustration bg |
| `textSecondary` | `#8E8E93` | Subtitle, "show all", link |

**Typography:** Poppins (400–800). Heading hero bold 40px, section 18px bold.

**Radius:** card 28–32px, button pill 999px, event circle 56px.

**Shadow:** soft diffused (opacity ~0.06, blur 16).

**Komponen kunci:** onboarding dark + outlined btn, home dashboard, wish card pastel+white footer, segmented pill, FAB hitam center nav.


## Skills terpasang (`.agents/skills/`)

| Skill | Untuk |
|-------|-------|
| `ponytail` | Kode minimal, YAGNI |
| `frontend-design` | UI/UX intentional |
| `building-native-ui` | Screen, navigasi, animasi |
| `native-data-fetching` | API, cache, offline |
| `expo-dev-client` | Dev build & TestFlight |
| `expo-deployment` | EAS build, APK, submit |
| + semua skill resmi `expo/skills` | Upgrade, native module, Tailwind, dll |

## Perintah

```bash
npm start              # dev (Expo Go)
npm run build:android  # APK untuk share
```
