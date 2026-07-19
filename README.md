# DigitalESF Market

AI sales growth platform for digital creators — monorepo (npm workspaces).

## Structure

```
apps/web       Angular (frontend, PWA)
apps/api       Express + TypeScript (backend)
packages/shared Zod schemas partagés (contrat frontend/backend)
infra/docker   Docker Compose (Mongo local)
docs/          PRD + fondation d'ingénierie
```

## Setup local

```bash
npm install
cp .env.example apps/api/.env.local   # remplir MONGO_URI, secrets JWT (voir .env.example)
docker compose -f infra/docker/docker-compose.yml up -d   # Mongo local

npm run build --workspace=@digitalesf/shared   # à builder avant l'api/web
npm run dev:api     # démarre Express sur :4000
npm run dev:web     # démarre Angular sur :4200
```

## Sprint 1 — état actuel

- ✅ Monorepo + workspaces
- ✅ Package `shared` (schémas Zod : User, Auth, Product)
- ✅ API : config validée au boot, Mongo + transactions helper, module Auth complet
  (register/login/logout/me, JWT httpOnly cookie, argon2, rate limiting)
- ✅ Web : Angular standalone + signals (pas de NgRx), PWA, Tailwind mobile-first,
  routes login/register/dashboard avec lazy loading + authGuard
- ⏳ À suivre : module Produit + upload R2, module IA, module Paiement (Stripe)

Voir `docs/ENGINEERING_FOUNDATION_v1.md` pour le détail de l'architecture et le plan de sprint complet.
