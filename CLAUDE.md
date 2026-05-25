# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start the dev server (opens Expo DevTools — choose platform from there)
npm start

# Start directly on a platform
npm run android
npm run ios
npm run web

# Run tests
npx jest

# Type-check
npx tsc --noEmit
```

No lint script is configured in `package.json`. TypeScript strict mode is enabled.

## Architecture

This is an **Expo + React Native** app using **Expo Router** (file-based, Stack navigation) targeting iOS, Android, and web. Styling is done exclusively with **NativeWind** (Tailwind CSS via `className` props — no StyleSheet usage). The app UI and API responses are in **French**.

### Routes

| File | Route |
|---|---|
| `app/index.tsx` | `/` — home, lists all billets |
| `app/login.tsx` | `/login` |
| `app/register.tsx` | `/register` |
| `app/billets/[id].tsx` | `/billets/:id` — billet detail + comments |

`app/_layout.tsx` is the Expo Router root layout: loads fonts, hides splash screen, wraps everything in `SafeAreaProvider`, and registers all Stack screens with `headerShown: false`.

### Screen / Component split

Each route file is a thin screen wrapper (`SafeAreaView` + `Header`). All real UI and data-fetching logic lives in `components/`:

- `Header` — nav bar, auth state (re-reads on every `pathname` change), login/logout buttons
- `AllPosts` — fetches billet list, renders `BilletCard` items
- `Post` — fetches billet detail (id from `useLocalSearchParams`) and its comments
- `Login` / `Register` — form components
- `Footer` — branding and copyright bar

### Backend API

Laravel app at `https://www.ryanfonseca.fr/b2lp/api` using **Sanctum Bearer Token** auth. All endpoint constants are in `lib/api-config.ts` (`API_BASE_URL`, `ENDPOINTS`).

The login endpoint returns the token as **raw plain text** (e.g. `"12|xyz..."`), not JSON. `BilletService.login()` calls the Laravel API directly (no proxy needed — Bearer Token auth has no CSRF requirement on mobile).

### Key files

Non-route utility files live at the project root (outside `app/`) to avoid Expo Router treating them as routes.

| Path | Purpose |
|---|---|
| `lib/api-config.ts` | `API_BASE_URL` and `ENDPOINTS` constants |
| `lib/auth.ts` | `TOKEN_KEY`, `isLoggedIn()`, `getAuthToken()`, `setAuthToken()`, `removeAuthToken()` — all async, backed by `AsyncStorage` |
| `lib/utils.ts` | `formatDate()` helper |
| `services/billetService.ts` | `BilletService` static class — all API calls; internal `request()` helper injects `Bearer` token when `{ auth: true }` |
| `types.ts` | Shared types: `Billet`, `BilletDetail`, `Commentaire`, `CurrentUser` |
| `constants/theme.ts` | Named color palette (violet / slate / emerald / red) — use these when NativeWind class names aren't expressive enough |

### Auth flow

Token is stored in `AsyncStorage` under `TOKEN_KEY` (exported from `lib/auth.ts`). `BilletService.login()` posts credentials, reads the raw-text token, and calls `setAuthToken()`. `BilletService.logout()` calls `removeAuthToken()` — no server round-trip.

### NativeWind toolchain

NativeWind requires configuration in three places — all already wired up:
- `metro.config.js` — wraps default config with `withNativeWind`, reads `./global.css`
- `babel.config.js` — uses `nativewind/babel` preset with `jsxImportSource: "nativewind"`
- `tailwind.config.js` — content paths cover `app/` and `components/`, uses `nativewind/preset`

### Path alias

`@/` resolves to the repo root (`tsconfig.json`), so `@/components/Header` maps to `components/Header.tsx`.
