# Fiche technique — MonBlog Mobile

## Informations générales

| Propriété | Valeur |
|---|---|
| Nom de l'application | MonBlog |
| Type | Application mobile cross-platform |
| Version | 1.0.0 |
| Plateformes cibles | iOS, Android, Web |
| Langage | TypeScript (strict mode) |
| Framework | Expo SDK 54 + React Native 0.81 |
| Backend | API REST Laravel (Sanctum) |
| URL de l'API | `https://www.ryanfonseca.fr/b2lp/api` |

---

## Stack technique détaillée

### Frontend (Application mobile)

| Technologie | Version | Rôle |
|---|---|---|
| Expo | ~54.0.33 | Plateforme de développement React Native |
| Expo Router | ~6.0.23 | Navigation file-based (Stack) |
| React | 19.1.0 | Bibliothèque UI |
| React Native | 0.81.5 | Rendu natif iOS/Android |
| NativeWind | ^4.2.3 | Tailwind CSS pour React Native (`className`) |
| Tailwind CSS | ^3.4.19 | Moteur de classes utilitaires |
| TypeScript | ~5.9.2 | Typage statique |
| AsyncStorage | 2.2.0 | Stockage local persistant (token) |
| React Native Reanimated | ~4.1.1 | Animations natives |
| React Native Screens | ~4.16.0 | Gestion native des écrans |
| React Native Safe Area | ~5.6.0 | Gestion des zones sûres (notch, etc.) |

### Backend (API)

| Technologie | Rôle |
|---|---|
| Laravel | Framework PHP pour l'API REST |
| Laravel Sanctum | Authentification par Bearer Token |
| Base de données | Stockage des billets, commentaires, utilisateurs |

---

## Architecture applicative

### Pattern architectural

L'application suit une architecture **Screen / Component / Service** :

- **Screens** (`app/`) : Fichiers de routes Expo Router. Chaque écran est un wrapper minimal (`SafeAreaView` + `Header`) qui délègue à un composant.
- **Components** (`components/`) : Contiennent toute la logique UI et le data-fetching.
- **Services** (`services/`) : Couche d'accès à l'API. Classe statique `BilletService` centralisant tous les appels HTTP.
- **Lib** (`lib/`) : Utilitaires transversaux (auth, config, helpers).

### Navigation

| Route | Écran | Accès |
|---|---|---|
| `/` | Liste des billets | Public |
| `/login` | Formulaire de connexion | Public |
| `/register` | Formulaire d'inscription | Public |
| `/billets/:id` | Détail billet + commentaires | Authentifié |

Navigation de type **Stack** (pile d'écrans) gérée par Expo Router. Pas de tabs ni de drawer.

---

## Authentification et sécurité

### Mécanisme

| Propriété | Détail |
|---|---|
| Protocole | HTTPS |
| Méthode d'auth | Laravel Sanctum — Bearer Token |
| Format du token | Texte brut : `"<id>\|<hash>"` (ex: `"12\|xyzABC..."`) |
| Stockage client | AsyncStorage (clé : `auth_token`) |
| Injection | Header `Authorization: Bearer <token>` sur chaque requête authentifiée |
| Déconnexion | Suppression locale du token (pas de révocation serveur) |

### Flux d'authentification

1. L'utilisateur soumet ses identifiants via `POST /login`
2. L'API retourne le token Sanctum en **texte brut** (pas JSON)
3. Le token est stocké dans AsyncStorage
4. Pour chaque requête protégée, le token est lu depuis AsyncStorage et injecté dans le header `Authorization`
5. La déconnexion supprime le token du stockage local

---

## Endpoints API consommés

### Routes publiques

| Nom | Méthode | URL | Code réponse | Description |
|---|---|---|---|---|
| ListBillets | GET | `/billets` | 200 | Liste de tous les billets |
| Login | POST | `/login` | 200, 401 | Authentification |
| Register | POST | `/register` | 200, 422 | Inscription |

### Routes authentifiées (Bearer Token requis)

| Nom | Méthode | URL | Code réponse | Description |
|---|---|---|---|---|
| ShowBillet | GET | `/billets/{id}` | 200, 401 | Détail billet + commentaires |
| CurrentUser | GET | `/user` | 200, 401 | Utilisateur connecté |
| StoreCommentaire | POST | `/commentaires` | 201, 422, 500 | Création d'un commentaire |

### Détail — StoreCommentaire

**Données envoyées** (JSON body) :

| Champ | Type | Contraintes | Description |
|---|---|---|---|
| `COM_CONTENU` | string | max 200 caractères | Message du commentaire |
| `billet_id` | integer | existant en BDD | ID du billet concerné |
| `user_id` | integer | = utilisateur authentifié | ID de l'auteur |

**Données reçues** (réponse 201) :

| Champ | Type | Description |
|---|---|---|
| `Date` | string | Date de création (définie côté serveur) |
| `Auteur` | string | Nom de l'auteur |
| `Contenu` | string | Message du commentaire |

---

## Modèle de données (côté client)

### Billet

```typescript
type Billet = {
  id: string | number;
  Titre?: string;
  Contenu?: string;
  Date?: string;
};
```

### BilletDetail

```typescript
type BilletDetail = Billet & {
  Commentaires?: Commentaire[];
};
```

### Commentaire

```typescript
type Commentaire = {
  id?: string | number;
  Auteur?: string;
  Contenu?: string;
  Date?: string;
};
```

### CurrentUser

```typescript
type CurrentUser = {
  id: number;
  nom: string;
  email: string;
};
```

---

## Styling

| Propriété | Détail |
|---|---|
| Approche | Utility-first (Tailwind CSS) |
| Implémentation | NativeWind v4 — classes via prop `className` |
| Aucun usage de `StyleSheet` | Tout le styling passe par les classes Tailwind |
| Palette | Violet (primaire), Slate (texte/fond), Emerald (succès), Red (erreur) |
| Thème | Défini dans `constants/theme.ts` |

### Configuration NativeWind

Trois fichiers doivent rester synchronisés :

| Fichier | Rôle |
|---|---|
| `metro.config.js` | Wraps Metro avec `withNativeWind`, lit `./global.css` |
| `babel.config.js` | Preset `nativewind/babel` + `jsxImportSource: "nativewind"` |
| `tailwind.config.js` | Content paths (`app/`, `components/`), preset `nativewind/preset` |

---

## Gestion des erreurs

| Scénario | Comportement |
|---|---|
| API injoignable | Message d'erreur affiché dans un encadré rouge |
| Token expiré / invalide | Erreur 401 remontée, l'utilisateur est redirigé vers `/login` |
| Validation commentaire (422) | Message d'erreur serveur affiché sous le formulaire |
| Erreur serveur (500) | Message générique "Erreur API 500" |
| Champs de formulaire vides | Bouton de soumission désactivé |

---

## Contraintes et limitations

- **Expo Go requis** : L'application fonctionne via Expo Go (pas de build natif standalone)
- **Réseau** : Le device doit être sur le même réseau Wi-Fi que la machine de développement
- **WSL2** : Si le dev server tourne dans WSL2, un port forwarding Windows (`netsh portproxy`) est nécessaire pour que le device mobile y accède
- **Pas de mode hors-ligne** : Toutes les données proviennent de l'API en temps réel
- **Pas de pagination** : La liste des billets charge tous les billets en une seule requête
- **Déconnexion locale uniquement** : Le token n'est pas révoqué côté serveur
