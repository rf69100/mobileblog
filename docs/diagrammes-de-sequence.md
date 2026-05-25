# Diagrammes de séquence

Ce document décrit les interactions entre l'application mobile, le stockage local (AsyncStorage) et l'API backend Laravel pour chaque fonctionnalité.

---

## 1. Consultation de la liste des billets

```
Utilisateur          App (AllPosts)           API Laravel
    |                      |                       |
    |   Ouvre l'accueil    |                       |
    |--------------------->|                       |
    |                      |  GET /billets         |
    |                      |---------------------->|
    |                      |                       |
    |                      |   200 OK              |
    |                      |   [Billet[]]           |
    |                      |<----------------------|
    |                      |                       |
    |   Affiche la liste   |                       |
    |<---------------------|                       |
```

**Notes** : Aucune authentification requise. La liste est accessible publiquement.

---

## 2. Inscription

```
Utilisateur          App (Register)           API Laravel
    |                      |                       |
    |  Remplit le form     |                       |
    |  (nom, email, mdp)   |                       |
    |--------------------->|                       |
    |                      |  POST /register       |
    |                      |  {name, email,        |
    |                      |   password}           |
    |                      |---------------------->|
    |                      |                       |
    |                      |   200 OK              |
    |                      |<----------------------|
    |                      |                       |
    |  Redirigé vers       |                       |
    |  /login              |                       |
    |<---------------------|                       |
```

**Erreurs possibles** :
- `422` : Validation échouée (email déjà pris, champs manquants)

---

## 3. Connexion (Login)

```
Utilisateur          App (Login)         AsyncStorage        API Laravel
    |                      |                   |                   |
    |  Saisit email + mdp  |                   |                   |
    |--------------------->|                   |                   |
    |                      |  POST /login      |                   |
    |                      |  {email, password} |                  |
    |                      |---------------------------------------->|
    |                      |                   |                   |
    |                      |                   |   200 OK          |
    |                      |                   |   "12|abc..."     |
    |                      |                   |   (texte brut)    |
    |                      |<----------------------------------------|
    |                      |                   |                   |
    |                      |  setItem(         |                   |
    |                      |   "auth_token",   |                   |
    |                      |    token)         |                   |
    |                      |------------------>|                   |
    |                      |                   |                   |
    |  Redirigé vers /     |                   |                   |
    |<---------------------|                   |                   |
```

**Points importants** :
- Le token est retourné en **texte brut** (pas JSON)
- Le token contient le séparateur `|` (ex: `"12|xyzABC..."`)
- Le token est stocké dans AsyncStorage sous la clé `auth_token`

**Erreurs possibles** :
- `401` : Identifiants invalides

---

## 4. Consultation d'un billet (détail + commentaires)

```
Utilisateur          App (Post)          AsyncStorage        API Laravel
    |                      |                   |                   |
    |  Clique sur un       |                   |                   |
    |  billet              |                   |                   |
    |--------------------->|                   |                   |
    |                      |  getItem(         |                   |
    |                      |   "auth_token")   |                   |
    |                      |------------------>|                   |
    |                      |   token           |                   |
    |                      |<------------------|                   |
    |                      |                   |                   |
    |                      |  [En parallèle]   |                   |
    |                      |                   |                   |
    |                      |  GET /billets/{id}                    |
    |                      |  Authorization: Bearer <token>        |
    |                      |---------------------------------------->|
    |                      |                   |                   |
    |                      |  GET /user        |                   |
    |                      |  Authorization: Bearer <token>        |
    |                      |---------------------------------------->|
    |                      |                   |                   |
    |                      |   200 BilletDetail                    |
    |                      |   (billet + commentaires)             |
    |                      |<----------------------------------------|
    |                      |                   |                   |
    |                      |   200 CurrentUser                     |
    |                      |<----------------------------------------|
    |                      |                   |                   |
    |  Affiche billet +    |                   |                   |
    |  commentaires +      |                   |                   |
    |  formulaire          |                   |                   |
    |<---------------------|                   |                   |
```

**Notes** :
- Les deux appels API (`/billets/{id}` et `/user`) sont exécutés en **parallèle** (`Promise.all`)
- Si l'utilisateur n'est pas connecté, il est redirigé vers `/login`

---

## 5. Publication d'un commentaire (StoreCommentaire)

```
Utilisateur          App (Post)          AsyncStorage        API Laravel
    |                      |                   |                   |
    |  Rédige commentaire  |                   |                   |
    |  (max 200 car.)      |                   |                   |
    |  Appuie "Publier"    |                   |                   |
    |--------------------->|                   |                   |
    |                      |  getItem(         |                   |
    |                      |   "auth_token")   |                   |
    |                      |------------------>|                   |
    |                      |   token           |                   |
    |                      |<------------------|                   |
    |                      |                   |                   |
    |                      |  POST /commentaires                   |
    |                      |  Authorization: Bearer <token>        |
    |                      |  {                                    |
    |                      |    COM_CONTENU: "...",                |
    |                      |    billet_id: 5,                      |
    |                      |    user_id: 12                        |
    |                      |  }                                    |
    |                      |---------------------------------------->|
    |                      |                   |                   |
    |                      |                   |   201 Created     |
    |                      |                   |   {               |
    |                      |                   |     Date,         |
    |                      |                   |     Auteur,       |
    |                      |                   |     Contenu       |
    |                      |                   |   }               |
    |                      |<----------------------------------------|
    |                      |                   |                   |
    |                      |  GET /billets/{id}                    |
    |                      |  (rafraîchit les commentaires)        |
    |                      |---------------------------------------->|
    |                      |                   |                   |
    |                      |   200 BilletDetail                    |
    |                      |<----------------------------------------|
    |                      |                   |                   |
    |  Liste commentaires  |                   |                   |
    |  mise à jour         |                   |                   |
    |<---------------------|                   |                   |
```

**Données envoyées** (JSON body) :

| Champ | Type | Description |
|---|---|---|
| `COM_CONTENU` | string (max 200) | Message du commentaire |
| `billet_id` | integer | ID du billet concerné |
| `user_id` | integer | ID de l'utilisateur authentifié |

**Données reçues** (réponse serveur) :

| Champ | Description |
|---|---|
| `Date` | Date de création (définie côté serveur) |
| `Auteur` | Nom de l'auteur |
| `Contenu` | Message du commentaire |

**Codes de réponse** :
- `201` : Commentaire créé avec succès
- `422` : Validation échouée (contenu vide, dépassement 200 caractères, user_id ne correspond pas)
- `500` : Erreur serveur

**Comportement post-envoi** : Après un 201, l'application recharge le détail du billet (`GET /billets/{id}`) pour afficher la liste de commentaires mise à jour.

---

## 6. Déconnexion

```
Utilisateur          App (Header)         AsyncStorage
    |                      |                   |
    |  Appuie Déconnexion  |                   |
    |--------------------->|                   |
    |                      |  removeItem(      |
    |                      |   "auth_token")   |
    |                      |------------------>|
    |                      |                   |
    |  Redirigé vers /     |                   |
    |<---------------------|                   |
```

**Notes** : La déconnexion est **uniquement locale** (suppression du token). Aucun appel API n'est effectué côté serveur.
