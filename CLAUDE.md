# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
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

This is an **Expo + React Native** app using **Expo Router** (file-based navigation, same conventions as Next.js App Router) targeting iOS, Android, and web.

### Mixed codebase warning

The `app/` directory contains two distinct sets of files:

1. **Expo Router files** (active): `app/(tabs)/`, `app/modal.tsx`, `app/+not-found.tsx`, `app/+html.tsx`
2. **Next.js-style files** (not wired up — `next` is absent from `package.json`): `app/page.tsx`, `app/billets/[id]/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx`, `app/api/auth/*/route.ts`

`app/_layout.tsx` currently contains a Next.js `BilletPage` component (imports `next/navigation`) instead of an Expo Router root layout — this breaks Expo Router's root layout and must be replaced before the app routes work correctly.

### Backend API

The backend is a Laravel app using **Sanctum Bearer Token** auth, hosted at `https://www.ryanfonseca.fr/b2lp/api`. All endpoints and base URLs are centralised in `app/lib/api-config.ts`. The API returns the auth token as **raw plain text** (e.g. `"12|xyz..."`), not JSON — the Next.js proxy routes in `app/api/auth/` normalise this to `{ auth_token: "..." }`.

### Key files

| Path | Purpose |
|---|---|
| `app/lib/api-config.ts` | All API/proxy endpoint constants (`API_BASE_URL`, `ENDPOINTS`, `PROXY_ENDPOINTS`) |
| `app/lib/auth.ts` | `TOKEN_KEY`, `isLoggedIn()`, `getAuthToken()` — reads from `localStorage` |
| `app/services/billetService.ts` | `BilletService` static class — single place for all API calls; adds Bearer token automatically via internal `request()` helper |
| `app/types.ts` | Shared types: `Billet`, `BilletDetail`, `Commentaire`, `CurrentUser` |
| `components/Themed.tsx` | `Text` and `View` wrappers that apply light/dark theme colors |
| `constants/Colors.ts` | Light/dark palette |

### Auth flow

Token is stored in `localStorage` under the key exported from `app/lib/auth.ts` (`TOKEN_KEY`). `BilletService.login()` calls the local Next.js proxy (`/api/auth/login`) rather than the Laravel API directly, to handle the CSRF handshake server-side. `BilletService.logout()` just removes the token from `localStorage`.

### Path alias

`@/` resolves to the repo root (configured in `tsconfig.json`), so `@/components/Themed` maps to `components/Themed.tsx`.
