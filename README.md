# MonBlog — Application Mobile

Application mobile de blog développée avec **Expo + React Native**, ciblant iOS, Android et le web.
Elle consomme une API REST Laravel pour afficher des billets, gérer l'authentification et permettre aux utilisateurs connectés de poster des commentaires.

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Expo (SDK 54) | ~54.0.33 |
| Navigation | Expo Router (file-based, Stack) | ~6.0.23 |
| UI | React Native | 0.81.5 |
| Réactivité | React | 19.1.0 |
| Styling | NativeWind (Tailwind CSS via `className`) | ^4.2.3 |
| Langage | TypeScript (strict mode) | ~5.9.2 |
| Stockage local | AsyncStorage | 2.2.0 |
| Backend | API REST Laravel + Sanctum Bearer Token | — |

## Prérequis

- **Node.js** >= 18
- **npm** >= 9

## Installation

```bash
git clone <url-du-repo>
cd mobileblog
npm install
```

## Lancer le projet (développement)

```bash
npm start          # Expo DevTools — choisir la plateforme
npm run android    # Android direct
npm run ios        # iOS direct
npm run web        # Navigateur
```

## Vérifications

```bash
npx tsc --noEmit   # Vérification des types
npx jest            # Tests
```

## Build & Installation

### Android (APK)

L'APK est généré dans le cloud via **EAS Build** (Expo Application Services).

```bash
npx eas-cli login                            # Se connecter à Expo
npx eas-cli build -p android --profile preview   # Lancer le build APK
```

Le build prend ~10-15 min. Une fois terminé, un lien de téléchargement de l'APK est fourni.
L'APK peut être installé directement sur un appareil Android ou un émulateur (LDPlayer, etc.).

**Dernier build** : [expo.dev/accounts/zerefou/projects/mobileblog](https://expo.dev/accounts/zerefou/projects/mobileblog)

| Propriété | Valeur |
|---|---|
| Application ID | `ryanfonseca.mobileblog` |
| Format | `.apk` (installation directe) |
| Profil EAS | `preview` |

### iOS

Pas de build standalone (nécessite un compte Apple Developer payant à 99$/an).
Pour tester sur iPhone : installer **Expo Go** depuis l'App Store, puis scanner le QR code affiché par `npm start`.

## Structure du projet

```
mobileblog/
├── app/                        # Routes Expo Router
│   ├── _layout.tsx             # Root layout (fonts, splash, SafeAreaProvider, Stack)
│   ├── index.tsx               # / — liste des billets
│   ├── login.tsx               # /login
│   ├── register.tsx            # /register
│   ├── billets/[id].tsx        # /billets/:id — détail + commentaires
│   └── +not-found.tsx          # 404
├── components/                 # Composants UI
│   ├── Header.tsx              # Barre de navigation + état auth
│   ├── AllPosts.tsx            # Liste des billets (BilletCard)
│   ├── Post.tsx                # Détail billet + commentaires + formulaire
│   ├── Login.tsx               # Formulaire de connexion
│   ├── Register.tsx            # Formulaire d'inscription
│   └── Footer.tsx              # Pied de page
├── lib/                        # Utilitaires
│   ├── api-config.ts           # API_BASE_URL et ENDPOINTS
│   ├── auth.ts                 # Gestion token (AsyncStorage)
│   └── utils.ts                # Helpers (formatDate)
├── services/
│   └── billetService.ts        # Classe statique — tous les appels API
├── types.ts                    # Types partagés (Billet, Commentaire, CurrentUser)
├── constants/
│   ├── theme.ts                # Palette couleurs (violet/slate/emerald/red)
│   └── Colors.ts               # Thème clair/sombre
├── docs/
│   ├── diagrammes-de-sequence.md   # Diagrammes de séquence de chaque fonctionnalité
│   └── fiche-technique.md          # Fiche technique complète du projet
├── eas.json                    # Configuration EAS Build
├── tailwind.config.js          # Config Tailwind + preset NativeWind
├── metro.config.js             # Metro + NativeWind
├── babel.config.js             # Babel + NativeWind
└── global.css                  # Directives @tailwind
```

> Les fichiers utilitaires (`lib/`, `services/`, `types.ts`) sont placés **hors du dossier `app/`** pour ne pas être interprétés comme des routes par Expo Router.

## API Backend

L'application communique avec une API REST Laravel hébergée sur `https://www.ryanfonseca.fr/b2lp/api`.

| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/billets` | GET | Non | Liste tous les billets |
| `/billets/{id}` | GET | Oui | Détail d'un billet + commentaires |
| `/commentaires` | POST | Oui | Créer un commentaire (201, 422, 500) |
| `/user` | GET | Oui | Utilisateur connecté |
| `/login` | POST | Non | Connexion (retourne token en texte brut) |
| `/register` | POST | Non | Inscription |

### StoreCommentaire — POST `/commentaires`

**Données envoyées** (JSON body) :

| Champ | Type | Contraintes | Description |
|---|---|---|---|
| `COM_CONTENU` | string | max 200 caractères | Message du commentaire |
| `billet_id` | integer | existant en BDD | ID du billet concerné |
| `user_id` | integer | = utilisateur authentifié | ID de l'auteur |

**Données reçues** (réponse 201) :

| Champ | Description |
|---|---|
| `Date` | Date de création (définie côté serveur) |
| `Auteur` | Nom de l'auteur |
| `Contenu` | Message du commentaire |

## Authentification

- **Mécanisme** : Laravel Sanctum — Bearer Token
- **Stockage** : `AsyncStorage` sous la clé `auth_token`
- **Flux** : Login > API retourne token brut (`"12|xyz..."`) > stocké dans AsyncStorage > injecté dans les headers `Authorization: Bearer <token>` pour les routes protégées
- **Déconnexion** : suppression du token local (pas d'appel serveur)

## Fonctionnalités

- Consultation de la liste des billets (accès public)
- Consultation du détail d'un billet avec ses commentaires (authentifié)
- Publication de commentaires (max 200 caractères, authentifié)
- Inscription / Connexion / Déconnexion
- Interface responsive (iOS, Android, Web)

## Documentation

- [Diagrammes de séquence](docs/diagrammes-de-sequence.md) — flux détaillés de chaque fonctionnalité
- [Fiche technique](docs/fiche-technique.md) — spécifications techniques complètes
