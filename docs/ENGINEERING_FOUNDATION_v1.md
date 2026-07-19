# DigitalESF Market — Engineering Foundation v1
### Rôle : CTO préparant le socle technique avant tout code produit
### Pré-requis validé : PRD v1.1

---

## 0. Décisions structurantes (à valider avant de lire le détail)

Trois choix qui engagent tout le reste, avec justification courte :

1. **Monorepo**, pas polyrepo. Une seule équipe (vous + moi), du code partagé (types, validation) entre frontend et backend. Un polyrepo n'apporterait aucun bénéfice à ce stade et ajouterait de la friction de synchronisation. On repasse en polyrepo seulement si une équipe backend et une équipe frontend séparées apparaissent un jour.
2. **Pas de NgRx, pas de framework de state management lourd au MVP.** Angular moderne (signals) + services suffisent pour la taille du produit. NgRx est la complexité qu'on a explicitement décidé d'éviter (§ "Avoid unnecessary complexity" de votre brief). On réévalue seulement si l'état partagé devient réellement difficile à tracer.
3. **Zod comme unique source de vérité de validation**, partagée entre frontend et backend via le package `shared`. Ça évite le bug classique "le frontend valide un format, le backend en valide un autre".

Si vous n'êtes pas d'accord sur l'un de ces trois points, dites-le avant qu'on avance — ce sont les décisions les plus coûteuses à inverser plus tard.

---

## 1. Architecture du repository (monorepo)

```
digitalesf-market/
├── apps/
│   ├── web/                     # Angular (frontend)
│   └── api/                     # Express (backend)
├── packages/
│   └── shared/                  # Types, schémas Zod, constantes partagées
├── infra/
│   ├── docker/                  # Dockerfiles dev/prod
│   └── ci/                      # Config CI (GitHub Actions)
├── docs/
│   ├── PRD_DigitalESF_Market_v1.1.md
│   └── ENGINEERING_FOUNDATION_v1.md
├── .env.example
├── package.json                 # workspaces npm
├── tsconfig.base.json
└── README.md
```

**Pourquoi ce découpage :**
- `packages/shared` contient les schémas Zod des entités (`Product`, `User`, `Order`...) et les types TypeScript dérivés. Le frontend et le backend importent depuis ce package — un seul endroit où la forme d'un `Product` est définie.
- `infra/` isole tout ce qui est déploiement/CI du code applicatif — permet de faire évoluer l'infra sans toucher au code métier.
- npm workspaces plutôt que Nx/Turborepo au MVP : Nx apporte de la valeur à partir de plusieurs équipes ou plusieurs apps frontend. Pour deux apps (web + api), c'est un outil de plus à apprendre pour un bénéfice marginal. **On documente ce choix pour le revisiter explicitement si le repo grossit** (ex. ajout d'une app mobile native, d'un site marketing séparé).

---

## 2. Architecture Frontend (Angular)

```
apps/web/src/app/
├── core/                        # Singleton services, guards, interceptors
│   ├── auth/                    # AuthService, AuthGuard, JWT interceptor
│   ├── http/                    # ApiClient wrapper, error interceptor
│   └── config/                  # Environment tokens
├── shared/                      # Composants réutilisables, sans logique métier
│   ├── ui/                      # Boutons, cards, growth-score-widget, etc.
│   └── pipes/
├── features/
│   ├── auth/                    # Login, signup
│   ├── products/                # Création produit, édition, optimiseur IA
│   ├── growth-score/            # Composant Growth Score™ (réutilisé partout)
│   ├── checkout/                # Page produit publique + paiement
│   └── dashboard/                # Vue vendeur (ventes, revenus)
├── app.config.ts
└── app.routes.ts
```

**Principes :**
- **Standalone components** (pas de NgModules) — c'est le standard Angular moderne, moins de boilerplate.
- **Lazy loading par feature** dès le MVP (`loadComponent`/`loadChildren`), important pour le score PWA/Lighthouse et le mobile-first.
- Le composant `growth-score` vit dans `features/growth-score` mais est conçu comme un composant autonome réutilisable (input = données de score, output = aucun) — cohérent avec l'ambition de §7 du PRD d'en faire un élément de marque affiché à plusieurs endroits.
- **Mobile-first réel :** breakpoints Tailwind pensés du plus petit écran vers le plus grand, jamais l'inverse. Le dashboard vendeur doit être pleinement utilisable au doigt sur un écran de 5 pouces — c'est un critère d'acceptation de recette, pas un vœu pieux.
- **PWA :** `@angular/pwa` ajouté dès le sprint 1 (manifest + service worker avec stratégie cache "network-first" pour les données, "cache-first" pour les assets statiques). Pas de mode offline fonctionnel pour le checkout — juste installabilité et rapidité de chargement.

---

## 3. Architecture Backend (Express)

```
apps/api/src/
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.repository.ts
│   ├── products/
│   ├── ai/
│   │   ├── ai.service.ts        # Interface AIService
│   │   ├── providers/
│   │   │   ├── openai.provider.ts
│   │   │   └── claude.provider.ts
│   │   └── growth-score/        # Logique de calcul du score (pure, testable)
│   ├── payments/
│   │   ├── payment.service.ts   # Interface PaymentProvider
│   │   └── providers/
│   │       └── stripe.provider.ts
│   └── dashboard/
├── core/
│   ├── middlewares/              # auth, error handler, rate limiter
│   ├── config/                   # config validée par Zod au boot
│   └── db/                       # connexion Mongo, gestion des transactions
├── jobs/                         # Queue (BullMQ) pour les appels IA async
└── server.ts
```

**Principes :**
- **Couches par module :** route → controller (HTTP only) → service (logique métier) → repository (accès Mongo). Un controller ne parle jamais directement à Mongoose — ça garde la logique métier testable sans base de données réelle.
- **Pas de framework DI lourd** (pas de NestJS, pas d'InversifyJS) au MVP — injection par constructeur simple. NestJS serait justifié si l'équipe grossissait fortement ; pour l'instant c'est de la structure en plus pour un bénéfice qu'on n'a pas encore besoin de payer.
- **AIService et PaymentProvider comme interfaces internes** (conforme au PRD v1.1) : le reste du code applicatif ne connaît jamais `openai` ou `stripe` directement, seulement l'interface. Changement de fournisseur = nouvelle classe qui implémente l'interface, zéro changement ailleurs.
- **Sécurité (non négociable dès le sprint 1), voir aussi §4 :**
  - `helmet` + rate limiting (`express-rate-limit`) sur toutes les routes, plus strict sur `/auth/*`.
  - Validation Zod sur **chaque** payload entrant, avant tout accès service/DB.
  - JWT en httpOnly cookie (pas de localStorage) pour réduire l'exposition XSS.
  - Logs structurés (pino) avec un identifiant de corrélation par requête, indispensable pour tracer un problème de paiement.

---

## 4. Schéma MongoDB v1

```typescript
// users
{
  _id: ObjectId,
  email: string,          // unique, index
  passwordHash?: string,   // optionnel si authProvider = google
  authProvider: "email" | "google",
  country: string,
  role: "seller" | "admin",
  profile: { displayName: string, bio?: string, avatarRef?: string },
  createdAt: Date, updatedAt: Date
}

// products
{
  _id: ObjectId,
  sellerId: ObjectId,      // index
  title: string,
  description: string,
  priceAmount: number,
  priceCurrency: string,
  category: string,        // index (utilisé pour la médiane du Growth Score)
  fileRef: string,         // clé R2
  imageRef?: string,
  videoRef?: string,
  status: "draft" | "published" | "archived",
  seoMeta: { slug: string, metaDescription: string },  // slug unique, index
  growthScore: { value: number, breakdown: object[], calculatedAt: Date },
  createdAt: Date, updatedAt: Date
}

// orders
{
  _id: ObjectId,
  productId: ObjectId,     // index
  sellerId: ObjectId,      // index — dénormalisé volontairement pour les requêtes dashboard
  buyerEmail: string,
  amount: number,
  currency: string,
  status: "pending" | "paid" | "failed" | "refunded",
  createdAt: Date, updatedAt: Date
}

// payments
{
  _id: ObjectId,
  orderId: ObjectId,       // index
  provider: "stripe",
  providerRef: string,     // index unique — id de charge Stripe
  idempotencyKey: string,  // index unique
  status: "succeeded" | "failed" | "refunded",
  amount: number,
  currency: string,
  createdAt: Date          // append-only, jamais d'update destructif
}

// payouts (structure prête, non activé avant qu'un vrai flux de retrait existe)
{
  _id: ObjectId,
  sellerId: ObjectId,
  amount: number, currency: string,
  method: "stripe_connect",
  status: "pending" | "paid",
  createdAt: Date
}
```

**Notes techniques :**
- `providerRef` et `idempotencyKey` en index unique = rempart concret contre le double-crédit en cas de retry webhook.
- Toute écriture qui modifie `orders` ET `payments` ensemble passe par une **session Mongo avec transaction** (`withTransaction`), pas deux écritures séparées.
- Validation de schéma **`$jsonSchema`** au niveau Mongo en plus de Zod côté applicatif, sur `payments` et `orders` en priorité — la donnée financière est le seul endroit où on accepte cette redondance de validation.

---

## 5. Stratégie de configuration d'environnement

- Trois environnements : `local`, `staging`, `production`. Chacun a son propre `.env` (jamais commité), généré à partir de `.env.example` versionné.
- **Validation de config au boot** : un schéma Zod (`config.schema.ts`) valide toutes les variables d'environnement au démarrage du serveur. Si une variable manquante ou mal typée, le serveur refuse de démarrer avec une erreur explicite — préférable à un crash silencieux en production trois heures plus tard.
- Secrets (clés Stripe, clés IA, secret JWT) jamais dans le repo, jamais dans les logs. En local : `.env`. En staging/prod : gestion via les secrets du provider d'hébergement (ex. variables d'environnement chiffrées de la plateforme choisie).
- Feature flags simples via variables d'environnement pour activer/désactiver un provider IA ou de paiement sans redeploiement complet du code (juste un changement de config + restart).

---

## 6. Workflow de développement

- **Branches :** `main` toujours déployable. Une branche par feature (`feature/auth-module`), merge via Pull Request, jamais de push direct sur `main`.
- **Convention de commit :** Conventional Commits (`feat:`, `fix:`, `chore:`...) — utile pour générer un changelog automatique plus tard, coût nul à mettre en place maintenant.
- **Qualité automatique :** ESLint + Prettier en pre-commit (Husky), CI GitHub Actions qui lance lint + build + tests sur chaque PR. Pas de PR mergeable si la CI est rouge.
- **Tests :** on ne vise pas 100% de couverture au MVP — priorité absolue aux tests sur : calcul du Growth Score (fonction pure, facile et critique à tester), le module paiement (idempotency, webhooks), et la validation Zod des schémas partagés. Le reste peut attendre.
- **Environnement local :** Docker Compose pour Mongo local (pas besoin de dépendre d'Atlas pour développer), variables d'env locales pointant vers les comptes Stripe/IA en mode test/sandbox.

---

## 7. Plan du premier sprint

**Objectif du sprint 1 : un vendeur peut s'inscrire, créer un produit, et le voir apparaître dans son dashboard — sans IA, sans paiement encore.** On construit le squelette avant d'ajouter l'intelligence et l'argent, pour valider l'architecture sur le chemin le plus simple d'abord.

**Durée suggérée : 1 semaine (ajustable selon votre disponibilité réelle).**

| Tâche | Détail | Definition of Done |
|---|---|---|
| Setup monorepo | Structure §1, workspaces npm, tsconfig partagé, ESLint/Prettier, Husky | `npm install` à la racine installe tout, `npm run build` passe sur les deux apps |
| CI de base | GitHub Actions : lint + build sur chaque PR | Une PR avec une erreur de lint échoue visiblement |
| Config + validation d'env | `config.schema.ts` Zod, `.env.example` | Le serveur refuse de démarrer si une variable requise manque |
| Package `shared` | Schémas Zod `User`, `Product` (v1) + types dérivés | Importable depuis `apps/web` et `apps/api` sans erreur de build |
| Module Auth (email + Google) | Signup, login, JWT httpOnly cookie, hashing argon2 | Un utilisateur peut s'inscrire et se reconnecter ; mot de passe jamais en clair en base ou en log |
| Module Produit (CRUD de base, sans IA/upload réel) | Création, édition, liste des produits d'un vendeur | Un vendeur connecté crée un produit (titre, prix, catégorie) et le voit dans une liste |
| Dashboard vendeur (coquille) | Page listant les produits du vendeur connecté | Route protégée par AuthGuard, accessible uniquement après login |
| PWA de base | Manifest + service worker minimal | L'app est installable sur mobile (test Lighthouse PWA basique) |

**Explicitement hors sprint 1 :** upload de fichier réel sur R2, appel IA, Stripe, Growth Score calculé. Ces éléments arrivent sprint 2 et 3, une fois le squelette Auth + Produit stable — inutile de brancher l'IA et l'argent sur une fondation pas encore testée.

---

## Prochaine étape

Validez ce document (ou amendez les 3 décisions structurantes de §0). Une fois validé, je commence l'implémentation du sprint 1, module par module, en commençant par le setup du monorepo.
