# MonBlog — Application mobile

Application mobile de blog développée avec **Expo + React Native**, ciblant iOS, Android et le web.

## Stack technique

- **Expo** ~54 / **Expo Router** ~6 (navigation fichier, Stack)
- **React Native** 0.81 + **React** 19
- **NativeWind** v4 (Tailwind CSS via `className`)
- **TypeScript** strict
- Backend : Laravel + **Sanctum Bearer Token** sur `https://www.ryanfonseca.fr/b2lp/api`

## Lancer le projet

```bash
npm install
npm start          # Expo DevTools — choisir la plateforme
npm run android    # Android direct
npm run ios        # iOS direct
npm run web        # Navigateur
```

## Vérifications

```bash
npx tsc --noEmit   # Vérification des types
npx jest           # Tests
```

## Structure

```
app/
  _layout.tsx          # Root layout Expo Router (fonts, splash, Stack)
  index.tsx            # Écran d'accueil — liste des billets
  login.tsx            # Écran de connexion
  register.tsx         # Écran d'inscription
  billets/[id].tsx     # Détail d'un billet + commentaires
  lib/
    api-config.ts      # API_BASE_URL et ENDPOINTS
    auth.ts            # Gestion du token (AsyncStorage)
    utils.ts           # Utilitaires (formatDate…)
  services/
    billetService.ts   # Tous les appels API (classe statique)
  types.ts             # Types partagés

components/            # UI réutilisable (Header, AllPosts, Post, Login, Register…)
constants/
  theme.ts             # Palette de couleurs
  Colors.ts            # Thème clair/sombre
```

## Authentification

Le token Sanctum est stocké dans `AsyncStorage` (clé `auth_token`). La connexion appelle directement l'API Laravel — pas de proxy CSRF nécessaire en Bearer Token. Le token est retourné en texte brut (`"12|xyz..."`).
