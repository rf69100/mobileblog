# MobileBlog — Application Mobile

Application mobile de blog développée avec **Expo + React Native**, ciblant iOS, Android et le web.
Elle consomme une API REST Laravel pour afficher des billets, gérer l'authentification et permettre aux utilisateurs connectés de poster des commentaires.

---

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

---

## Prérequis

- **Node.js** >= 18
- **npm** >= 9

---

## Installation

```bash
git clone <url-du-repo>
cd mobileblog
npm install
```

---

## Lancer le projet (développement)

```bash
npm start          # Expo DevTools — choisir la plateforme
npm run android    # Android direct
npm run ios        # iOS direct
npm run web        # Navigateur
```

```bash
npx tsc --noEmit   # Vérification des types
npx jest           # Tests
```

---

## Build & déploiement

### Android (APK)

L'APK est généré dans le cloud via **EAS Build** (Expo Application Services).

```bash
npx eas-cli login                                  # Se connecter à Expo
npx eas-cli build -p android --profile preview     # Lancer le build APK
```

Le build prend ~10-15 min. Un lien de téléchargement de l'APK est fourni à la fin.

**Dernier build** : [expo.dev/accounts/zerefou/projects/mobileblog](https://expo.dev/accounts/zerefou/projects/mobileblog)

| Propriété | Valeur |
|---|---|
| Application ID | `ryanfonseca.mobileblog` |
| Format | `.apk` (installation directe) |
| Profil EAS | `preview` |

### iOS

Pas de build standalone (nécessite un compte Apple Developer à 99 $/an).  
Pour tester sur iPhone : installer **Expo Go** depuis l'App Store, puis scanner le QR code affiché par `npm start`.

---

## Arborescence

```
mobileblog/
├── app/
│   ├── _layout.tsx          # Root layout (fonts, SafeAreaProvider, Stack)
│   ├── index.tsx            # / — liste des billets
│   ├── login.tsx            # /login
│   ├── register.tsx         # /register
│   ├── billets/
│   │   └── [id].tsx         # /billets/:id — détail + commentaires
│   ├── +html.tsx            # Shell HTML web (Expo Router)
│   └── +not-found.tsx       # Page 404
├── components/
│   ├── Header.tsx           # Barre de navigation + état auth
│   ├── Footer.tsx           # Pied de page
│   ├── AllPosts.tsx         # Liste des billets (+ BilletCard)
│   ├── Post.tsx             # Détail billet + commentaires + formulaire
│   ├── Login.tsx            # Formulaire de connexion
│   └── Register.tsx         # Formulaire d'inscription
├── services/
│   └── billetService.ts     # BilletService — tous les appels API
├── lib/
│   ├── api-config.ts        # API_BASE_URL + ENDPOINTS
│   ├── auth.ts              # Gestion token AsyncStorage
│   └── utils.ts             # formatDate()
├── types.ts                 # Types partagés (Billet, BilletDetail, Commentaire, CurrentUser)
├── constants/
│   └── theme.ts             # Palette de couleurs (violet/slate/emerald/red)
├── assets/
│   ├── fonts/               # SpaceMono-Regular.ttf
│   └── images/              # icon.png, splash-icon.png, etc.
├── docs/
│   ├── diagrammes-de-sequence.md
│   └── fiche-technique.md
├── .env                     # EXPO_PUBLIC_APP_NAME=MobileBlog
├── app.json                 # Config Expo (name: MobileBlog)
├── tailwind.config.js       # NativeWind — content paths + preset
├── babel.config.js          # nativewind/babel + jsxImportSource
├── metro.config.js          # withNativeWind + global.css
├── global.css               # Point d'entrée Tailwind
└── tsconfig.json            # strict: true, "@/" → "."
```

> Les fichiers `lib/`, `services/`, `types.ts` sont placés **hors de `app/`** pour ne pas être interprétés comme des routes par Expo Router.

---

## Architecture

L'application suit un pattern **Screen / Component / Service** :

- **Screens** (`app/`) — wrappers minimalistes (`SafeAreaView` + `Header`) qui délèguent à un composant
- **Components** (`components/`) — logique UI et data-fetching
- **Services** (`services/`) — classe statique `BilletService` centralisant tous les appels HTTP
- **Lib** (`lib/`) — utilitaires transversaux (auth, config, helpers)

---

## API Backend

L'application communique avec `https://www.ryanfonseca.fr/b2lp/api`.

### Routes publiques

| Méthode | Endpoint | Réponse | Description |
|---|---|---|---|
| GET | `/billets` | `200` `Billet[]` | Liste tous les billets |
| POST | `/login` | `200` token texte brut | Authentification |
| POST | `/register` | `200` | Inscription |

### Routes authentifiées (Bearer Token requis)

| Méthode | Endpoint | Réponse | Description |
|---|---|---|---|
| GET | `/billets/{id}` | `200` `BilletDetail` | Détail billet + commentaires |
| GET | `/user` | `200` `CurrentUser` | Utilisateur connecté |
| POST | `/commentaires` | `201` `Commentaire` | Créer un commentaire |

### POST `/commentaires` — détail

**Body JSON envoyé :**

| Champ | Type | Contrainte |
|---|---|---|
| `COM_CONTENU` | string | max 200 caractères |
| `billet_id` | integer | ID du billet existant |
| `user_id` | integer | = utilisateur authentifié |

**Réponse `201` :**

| Champ | Description |
|---|---|
| `Date` | Date de création (serveur) |
| `Auteur` | Nom de l'auteur |
| `Contenu` | Message du commentaire |

Codes d'erreur : `422` validation, `500` erreur serveur.

### Particularité — token texte brut

`POST /login` retourne le token en **texte brut** (pas JSON), ex : `"12|xyzABC..."`.  
`BilletService.login()` lit le corps avec `res.text()` et valide la présence du séparateur `|`.

---

## Authentification

- **Mécanisme** : Laravel Sanctum — Bearer Token
- **Stockage** : `AsyncStorage` sous la clé `auth_token`
- **Flux** : Login → API retourne token brut → stocké dans AsyncStorage → injecté dans les headers `Authorization: Bearer <token>` pour les routes protégées
- **Déconnexion** : suppression du token local uniquement (aucun appel serveur)

---

## Modèles de données (TypeScript)

```typescript
type Billet = { id: string|number; Titre?: string; Contenu?: string; Date?: string };

type BilletDetail = Billet & { Commentaires?: Commentaire[] };

type Commentaire = { id?: string|number; Auteur?: string; Contenu?: string; Date?: string };

type CurrentUser = { id: number; nom: string; email: string };
```

---

## Cas d'utilisation

### Acteurs
- **Visiteur** : utilisateur non authentifié
- **Membre** : utilisateur avec token valide dans AsyncStorage

### UC1 — Consulter la liste des billets
- **Acteur** : Visiteur ou Membre
- **Déclencheur** : Ouverture de l'app (`/`)
- **Flux** : `AllPosts` → `GET /billets` → affiche les cartes cliquables
- **Extensions** : Erreur réseau → encadré rouge ; liste vide → message "Aucun billet"

### UC2 — Créer un compte
- **Acteur** : Visiteur
- **Déclencheur** : Clic "Créer un compte"
- **Flux** : Formulaire Register → `POST /register` → redirection `/login`
- **Extensions** : `422` (email déjà pris, champs invalides) → message d'erreur

### UC3 — Se connecter
- **Acteur** : Visiteur
- **Déclencheur** : Navigation vers `/login`
- **Flux** : Formulaire Login → `POST /login` → token stocké → redirection `/`
- **Extensions** : `401` → "identifiants invalides"

### UC4 — Lire un billet avec ses commentaires
- **Acteur** : Membre (redirection `/login` si non connecté)
- **Déclencheur** : Clic sur une carte
- **Flux** : `Promise.all([GET /billets/{id}, GET /user])` → affiche billet + commentaires + formulaire
- **Extensions** : `401` → redirection `/login` ; erreur réseau → encadré rouge

### UC5 — Publier un commentaire
- **Acteur** : Membre
- **Déclencheur** : Saisie dans le champ + clic "Publier"
- **Préconditions** : Champ non vide (max 200 car.), `currentUser` chargé
- **Flux** : `POST /commentaires` → recharge `GET /billets/{id}` → liste mise à jour
- **Extensions** : `422` → erreur affichée sous le formulaire

### UC6 — Se déconnecter
- **Acteur** : Membre
- **Déclencheur** : Clic "Déconnexion" dans le Header
- **Flux** : `AsyncStorage.removeItem("auth_token")` → état mis à jour → redirection `/`

---

## Diagrammes de séquence

### 1. Consultation de la liste des billets (public)

```
Utilisateur       AllPosts               API Laravel
     |                |                       |
     | Ouvre /        |                       |
     |--------------->|                       |
     |                | GET /billets          |
     |                |---------------------->|
     |                | 200 OK  Billet[]      |
     |                |<----------------------|
     | Affiche liste  |                       |
     |<---------------|                       |
```

### 2. Inscription

```
Utilisateur       Register               API Laravel
     |                |                       |
     | Remplit form   |                       |
     | (nom,email,mdp)|                       |
     |--------------->|                       |
     |                | POST /register        |
     |                | {name,email,password} |
     |                |---------------------->|
     |                | 200 OK                |
     |                |<----------------------|
     | Redirigé /login|                       |
     |<---------------|                       |
```

Erreur possible : `422` (email déjà pris, champs manquants).

### 3. Connexion

```
Utilisateur       Login          AsyncStorage      API Laravel
     |                |               |                 |
     | email + mdp    |               |                 |
     |--------------->|               |                 |
     |                | POST /login   |                 |
     |                | {email,password}                |
     |                |--------------------------------->|
     |                | 200  "12|abc..." (texte brut)   |
     |                |<---------------------------------|
     |                | setItem("auth_token", token)    |
     |                |-------------->|                 |
     | Redirigé /     |               |                 |
     |<---------------|               |                 |
```

Erreur possible : `401` (identifiants invalides).

### 4. Détail d'un billet (authentifié)

```
Utilisateur       Post           AsyncStorage      API Laravel
     |                |               |                 |
     | Clique billet  |               |                 |
     |--------------->|               |                 |
     |                | getItem("auth_token")           |
     |                |-------------->|                 |
     |                | token         |                 |
     |                |<--------------|                 |
     |                |         [en parallèle]          |
     |                | GET /billets/{id}               |
     |                | Authorization: Bearer <token>   |
     |                |--------------------------------->|
     |                | GET /user                       |
     |                | Authorization: Bearer <token>   |
     |                |--------------------------------->|
     |                | 200 BilletDetail                |
     |                |<---------------------------------|
     |                | 200 CurrentUser                 |
     |                |<---------------------------------|
     | Billet +       |               |                 |
     | commentaires   |               |                 |
     |<---------------|               |                 |
```

Si non connecté → redirection immédiate vers `/login`.  
Les deux appels sont lancés en **parallèle** via `Promise.all`.

### 5. Publication d'un commentaire

```
Utilisateur       Post           AsyncStorage      API Laravel
     |                |               |                 |
     | Saisit texte   |               |                 |
     | Appuie Publier |               |                 |
     |--------------->|               |                 |
     |                | getItem("auth_token")           |
     |                |-------------->|                 |
     |                | token         |                 |
     |                |<--------------|                 |
     |                | POST /commentaires              |
     |                | Authorization: Bearer <token>   |
     |                | {COM_CONTENU,billet_id,user_id} |
     |                |--------------------------------->|
     |                | 201 Created {Date,Auteur,Contenu}
     |                |<---------------------------------|
     |                | GET /billets/{id}  (refresh)    |
     |                |--------------------------------->|
     |                | 200 BilletDetail                |
     |                |<---------------------------------|
     | Liste màj      |               |                 |
     |<---------------|               |                 |
```

### 6. Déconnexion

```
Utilisateur       Header         AsyncStorage
     |                |               |
     | Déconnexion    |               |
     |--------------->|               |
     |                | removeItem("auth_token")
     |                |-------------->|
     | Redirigé /     |               |
     |<---------------|               |
```

Déconnexion **locale uniquement** — aucun appel API.

---

## Fonctionnalités

- Consultation de la liste des billets (accès public)
- Consultation du détail d'un billet avec ses commentaires (authentifié)
- Publication de commentaires (max 200 caractères, authentifié)
- Inscription / Connexion / Déconnexion
- Interface responsive (iOS, Android, Web)

---

## Contraintes et limitations

- **Déconnexion locale** : le token n'est pas révoqué côté serveur
- **Pas de pagination** : `GET /billets` retourne tous les billets en une requête
- **`/billets/{id}` protégé** : accès non authentifié → redirection `/login`
- **WSL2** : si le serveur de dev tourne dans WSL2, un port forwarding (`netsh portproxy`) est nécessaire pour accéder depuis un device physique
- **Pas de mode hors-ligne** : toutes les données proviennent de l'API en temps réel
