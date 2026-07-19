# PRD — DigitalESF Market
### Version 1.1 — Rédigé par Claude (rôle CTO/Architecte produit)
### Domaine : market.digitalesf.com

### Changelog v1.0 → v1.1 (décisions Product Lead)
1. Positionnement affiné : "AI sales growth platform, not a marketplace."
2. Avantage concurrentiel reformulé : workflow IA + insights propriétaires, pas "meilleure IA".
3. Introduction du **DigitalESF Growth Score™** (facteurs, logique de calcul, UX).
4. Paiements MVP simplifiés : Stripe uniquement au lancement, Mobile Money en V1.5.
5. Ajout d'une exigence PWA.
6. Architecture IA agnostique au fournisseur (OpenAI / Claude / futurs modèles locaux).
7. Monétisation : Freemium + commission hybride.
8. Ajout d'une stratégie de validation MVP avec les 10 premiers vendeurs.

**Point de vigilance du CTO sur le changement #4 :** voir §0bis ci-dessous — Stripe-only au MVP a une conséquence directe sur le marché réellement adressé au lancement, à assumer explicitement plutôt qu'à ignorer.

---

## 0. Note de méthode (à lire avant tout)

Ce PRD ne fait pas 100 pages parce que 100 pages n'est pas un objectif — c'est un piège. Un PRD trop long dilue les décisions importantes dans du remplissage. Ce document est volontairement **dense et actionnable**. Chaque section répond à une décision réelle, pas à une case à cocher.

**Hypothèses verrouillées suite à notre échange :**
- Stack : Angular + Node.js/Express + MongoDB Atlas + Cloudflare R2 + Stripe (confirmé, avec mitigation technique sur Mongo — voir §8).
- Marché : architecture **globale dès le jour 1** (multi-devise, multi-langue), GTM de lancement concentré sur **Europe francophone + Afrique francophone** (hypothèse à confirmer définitivement — voir §3).
- Positionnement : copilote IA de vente, pas une marketplace de plus.

### 0bis. Conséquence assumée du choix "Stripe-only" au MVP

Décision actée : simplicité de lancement > couverture géographique complète.

Conséquence directe, à ne pas maquiller en interne ou en communication externe : **le MVP est de fait un lancement international/Europe**, pas un lancement Afrique. <cite index="22-1">Un acheteur qui ne dispose que du Mobile Money ne pourra pas payer sur la plateforme avant la V1.5</cite>. Ce que ça implique concrètement :

- Les 10 premiers vendeurs pilotes (§ stratégie de validation) doivent être choisis en fonction de **leur propre audience d'acheteurs**, pas seulement de leur pays de résidence — un vendeur basé à Dakar mais dont les acheteurs paient par carte reste un bon candidat MVP ; un vendeur dont 80% de son audience paie en Mobile Money ne verra aucune traction avec Stripe seul, et on risque de conclure à tort que "le produit ne marche pas".
- Ne pas afficher Mobile Money ou "Fait pour l'Afrique" dans le marketing avant que ce soit vrai. C'est le genre de décalage qui casse la confiance d'un vendeur qui recrute ensuite ses propres acheteurs vers une page de paiement qui les rejette.
- Mobile Money reste sur la roadmap V1.5, non négociable, pas repoussé indéfiniment — c'est un différenciateur réel face à Gumroad/Lemon Squeezy pour une partie du marché francophone.

---

## 1. Executive Summary

**Positionnement (v1.1) : DigitalESF Market is an AI sales growth platform, not a marketplace.**

Phrase interne de référence : *"We don't host products. We help creators grow businesses."*

DigitalESF Market est une plateforme SaaS qui aide les créateurs de produits numériques à publier, optimiser et vendre leurs produits grâce à l'IA. Contrairement à Gumroad, Lemon Squeezy, Payhip ou Chariow, dont la proposition de valeur centrale reste **l'hébergement + l'encaissement**, DigitalESF Market positionne l'IA comme **le produit lui-même** : un copilote qui diagnostique pourquoi un produit ne vend pas et propose des actions concrètes.

**Précision importante sur la nature de l'avantage concurrentiel (arbitrage Product Lead) :** l'avantage n'est pas "on a une meilleure IA" — n'importe quel concurrent peut brancher un nouveau modèle demain. L'avantage est **workflow + données propriétaires** : à mesure que des vendeurs utilisent la plateforme, le Growth Score et les recommandations s'affinent sur des données réelles de conversion que Chariow ou Gumroad n'ont pas structurées de cette façon. Face à une page produit générique ("voici votre page"), on répond par un diagnostic ("voici pourquoi ça ne vend pas et voici 3 actions"). C'est un avantage qui se construit avec l'usage, pas un avantage figé dans un choix de modèle IA.

Le risque principal de ce projet n'est pas technique. C'est la **dilution** : vouloir servir tout le monde, tous les pays, toutes les fonctionnalités, dès le MVP. Ce PRD définit un MVP volontairement étroit pour valider une seule hypothèse : *les vendeurs reviennent-ils sur la plateforme parce que le copilote IA les aide réellement à vendre plus ?*

---

## 2. Analyse de marché (mise à jour 2026)

### Gumroad
<cite index="9-1">Les ventes directes coûtent 10% + 0,50$ par transaction, contre 30% pour les ventes via la marketplace Discover</cite>. <cite index="6-1">La plateforme n'a jamais été pensée pour la facturation par abonnement, les licences par utilisateur ou les produits à base de clé API</cite>. **Faiblesse exploitable :** aucune intelligence produit — Gumroad délivre le fichier, il n'aide pas à le vendre mieux.

### Lemon Squeezy (racheté par Stripe)
<cite index="11-1">Stripe a racheté Lemon Squeezy en juillet 2024, une équipe de 13 personnes</cite>, <cite index="16-1">et développe désormais "Stripe Managed Payments", une nouvelle offre de merchant of record</cite>. <cite index="13-1">Les retours utilisateurs 2026 signalent un support quasi inexistant, avec parfois des semaines de silence</cite>. **Faiblesse exploitable :** l'indie-friendliness historique s'érode post-acquisition ; les créateurs cherchent une alternative avec un vrai support et une identité produit propre.

### Chariow (le concurrent le plus pertinent pour notre GTM Afrique)
C'est le concurrent qu'il faut prendre le plus au sérieux, pas le sous-estimer. <cite index="21-1">Chariow gère la conversion des devises et centralise les fonds dans un portefeuille numérique, avec retrait vers compte bancaire ou Mobile Money</cite>. <cite index="22-1">La plateforme agit comme un agrégateur universel acceptant le Mobile Money de tous les opérateurs majeurs ainsi que les cartes bancaires internationales sur une même page de commande</cite>. <cite index="28-1">Chariow prélève 15% par vente, un taux qui peut descendre à 10% selon le volume, sans frais caché ni abonnement</cite>. Un point critique : <cite index="27-1">Chariow intègre déjà de l'IA et un système d'affiliation en 2026</cite> — ce n'est plus un simple "Gumroad africain", ils avancent déjà vers le copilote. **Notre marge de manœuvre réelle n'est donc pas "faire de l'IA en Afrique" (déjà en cours chez eux), mais faire une IA plus profonde et plus actionnable que la leur** — un vrai diagnostic de vente, pas juste de la génération de texte.

### Payhip
Positionnement no-code simple, frais autour de 5% + gestion de la TVA UE, sans les capacités IA ni l'agrégation mobile money. Faible sur la découvrabilité organique.

### Shopify (digital products) / Etsy (digital)
Écosystèmes puissants mais génériques — ni l'un ni l'autre n'est pensé spécifiquement pour le vendeur solo de produit numérique qui a besoin d'aide sur le marketing, pas sur la logistique.

### Conclusion marché
Le terrain "hébergement + paiement" est saturé et commoditisé (les frais convergent tous vers 5-15%). Le terrain "copilote de vente actionnable" est **encore ouvert**, mais Chariow s'y engage déjà. Notre fenêtre se resserre — d'où l'urgence de ne pas passer 6 mois sur un PRD de 100 pages avant de shipper.

---

## 3. Personas

**1. Amina, 27 ans, créatrice de templates Notion (Dakar/Paris)**
Vend déjà sur Gumroad et Chariow en parallèle. Frustrée de ne pas savoir pourquoi certains produits vendent et d'autres non. Veut du Mobile Money ET des cartes internationales.

**2. Karim, 34 ans, formateur en ligne (Casablanca)**
A une audience TikTok/Instagram mais ne sait pas transformer les vues en ventes. A besoin qu'on lui dise concrètement quoi améliorer, pas d'un dashboard analytics de plus.

**3. Léa, 24 ans, créatrice de presets Lightroom (Lyon)**
Techniquement à l'aise, déjà sur Etsy. Cherche une plateforme avec de meilleures marges et un vrai SEO automatisé pour être trouvée sur Google, pas seulement sur la marketplace interne.

*(Assumption à valider : ces trois personas confirment le double marché Europe + Afrique francophone évoqué en §0. Si le vendeur cible réel est différent — ex. anglophone international — les priorités mobile money changent fortement.)*

---

## 4. Parcours utilisateur clé (MVP)

1. Inscription (email ou Google) → 2 minutes.
2. Création du premier produit : upload fichier + prix + catégorie.
3. Clic "Optimiser avec l'IA" → génération titre, description, SEO, slug.
4. Le vendeur voit un **score de vente basé sur des règles vérifiables** (pas un chiffre inventé — voir §7) avec 1 à 3 actions concrètes.
5. Publication → lien de vente partageable.
6. Première vente → paiement Stripe/PayPal ou Mobile Money selon le pays de l'acheteur.
7. Retour au dashboard : le vendeur voit ses ventes et une nouvelle recommandation IA.

Ce parcours doit être bouclable en **moins de 10 minutes**, du premier clic à la publication. C'est le benchmark à tester en interne avant tout lancement public.

---

## 5. Définition du MVP — ce qu'on NE construit PAS

Explicitement **hors MVP**, et pourquoi :

| Feature | Pourquoi hors MVP |
|---|---|
| Publication auto réseaux sociaux | Dépend d'API tierces fragiles, forte complexité réglementaire, faible valeur avant d'avoir des vendeurs actifs |
| Assistant IA conversationnel ("pourquoi je ne vends pas") | Nécessite un historique de données réel pour être crédible — sinon on invente des réponses |
| SEO Engine (landing pages générées, blog auto) | Fort potentiel mais gros chantier ; vient après validation du noyau |
| Marketplace interne (découverte, favoris, avis) | Une marketplace vide au lancement nuit à la crédibilité ; on active la découverte quand il y a une masse critique de vendeurs |
| Affiliation | Multiplie la complexité paiement (partage de commission) avant que le cœur ne soit stable |
| Multi-devise complète sur tous les pays | On code l'architecture pour, mais on active un nombre restreint de devises/paiements au lancement |

**Ce qu'on construit dans le MVP :**
- Auth (email + Google)
- Création produit (upload, prix, catégorie, image)
- Optimiseur IA (titre, description, SEO, slug) — génération unique, pas de chat
- Score de vente basé sur des règles vérifiables + recommandations
- Page produit publique + lien de vente
- Paiement Stripe + PayPal + **au moins un agrégateur Mobile Money** (à évaluer : Flutterwave couvre plusieurs pays africains en un seul intégrateur, ce qui limite le travail d'intégration comparé à Wave/Orange Money/PayDunya séparément)
- Dashboard vendeur (produits, ventes, revenus)
- Livraison sécurisée du fichier (lien à expiration/téléchargement limité)

---

## 6. Exigences fonctionnelles (extrait — priorité P0/P1/P2)

### F1 — Création de produit [P0]
**User story :** En tant que vendeur, je veux uploader un fichier et fixer un prix pour pouvoir le vendre.
**Critères d'acceptation :**
- Upload accepté jusqu'à une taille définie (à fixer selon coût R2, ex. 500 Mo au MVP)
- Prix dans au moins 2 devises actives au lancement
- Le produit n'est pas visible publiquement tant qu'il n'est pas explicitement publié

### F2 — Optimiseur IA [P0]
**User story :** En tant que vendeur, je veux que l'IA me génère un titre, une description et un SEO pour gagner du temps et vendre mieux.
**Critères d'acceptation :**
- Génération en moins de 15 secondes
- Le vendeur peut éditer chaque champ généré avant publication
- Aucune génération n'est publiée automatiquement sans validation humaine

### F3 — DigitalESF Growth Score™ [P0]
**User story :** En tant que vendeur, je veux savoir concrètement ce qui bloque mes ventes.
**Critères d'acceptation :**
- Le score est calculé à partir des 8 facteurs pondérés définis en §7, tous vérifiables et documentés
- Chaque facteur sous le seuil est accompagné d'une explication ("pourquoi") et d'une action, avec un niveau d'impact (HIGH/MEDIUM/GOOD)
- Le score ne prétend jamais donner un pourcentage de gain de conversion tant qu'on n'a pas de données réelles pour le calibrer
- Le composant visuel (barre + liste d'actions) est traité comme un élément de marque, réutilisable partout où un produit est affiché dans le dashboard

### F4 — Paiement (Stripe-only au MVP) [P0]
**User story :** En tant qu'acheteur, je veux payer par carte bancaire de façon fiable ; en tant que vendeur, je veux être payé sans ambiguïté sur les délais et les frais.
**Critères d'acceptation MVP :**
- Stripe uniquement (cartes internationales, Apple Pay/Google Pay via Stripe)
- Idempotency key obligatoire sur chaque webhook Stripe pour éviter les doubles crédits
- Le dashboard vendeur affiche un **taux effectif total** (commission plateforme + frais Stripe estimés), jamais seulement la commission plateforme seule
- Le vendeur est informé explicitement, dès l'onboarding, que le Mobile Money n'est pas encore disponible (pour éviter la déception d'un vendeur qui recrute des acheteurs qui ne peuvent pas payer)

**Critères d'acceptation V1.5 (hors MVP, mais architecturé dès le MVP pour ne pas nécessiter de refonte) :**
- Ajout d'un agrégateur Mobile Money (Flutterwave en priorité, cf. §8) une fois le funnel Stripe validé avec les 10 premiers vendeurs
- Détection du pays de l'acheteur pour proposer les rails pertinents

### F5 — Dashboard vendeur [P1]
Ventes, revenus, liste produits, statut de chaque commande.

*(Le PRD complet listera F6 à F20 pour V2/V3 lors de la prochaine itération — inutile de les détailler avant validation du MVP.)*

---

## 7. Stratégie IA

Principe directeur : **l'IA doit toujours être vérifiable par le vendeur**, jamais une boîte noire qui affirme des choses invérifiables.

- **AI Product Optimizer (MVP) :** génère titre/description/SEO/slug à partir du fichier + infos de base. Le vendeur reste décisionnaire final.
- **DigitalESF Growth Score™ (MVP, version règles) :** scoring déterministe et transparent, pas de "% de conversion estimé" inventé. Voir spécification complète ci-dessous.

### Spécification du DigitalESF Growth Score™

Objectif produit : devenir notre "score Yoast" — l'élément visuel que chaque vendeur consulte à chaque édition de produit, et qui devient une signature de marque reconnaissable.

**Facteurs de scoring (MVP, tous vérifiables, aucun inventé) :**

| Facteur | Poids | Vérification |
|---|---|---|
| Présence d'une image produit | 15 | binaire — image uploadée ou non |
| Qualité/résolution du thumbnail | 10 | dimensions minimales respectées |
| Longueur et structure de la description | 15 | seuil de mots + présence de puces/structure |
| Présence de preuve sociale (avis, témoignage, nombre de ventes) | 15 | champ rempli ou non |
| Cohérence du prix vs médiane de la catégorie | 15 | comparaison à la médiane des produits de la même catégorie sur la plateforme |
| Présence d'une vidéo de présentation | 10 | binaire |
| SEO (slug, meta description, titre optimisé) | 10 | champs générés/validés |
| Complétude du profil vendeur | 10 | photo, bio, réseaux liés |

**Logique de calcul :** somme pondérée simple des facteurs, chacun noté de 0 à 100% de son poids selon des règles explicites — pas de modèle de ML opaque au MVP. La transparence du calcul est elle-même un argument de confiance vis-à-vis des vendeurs techniques (à l'inverse d'un score "magique").

**Présentation UX :**
```
DigitalESF Growth Score™
82/100
[████████░░] Conversion readiness

✅ Votre prix est cohérent avec le marché         [GOOD]
⚠️  Votre thumbnail manque d'impact                [HIGH]
⚠️  Votre description manque de preuve sociale     [MEDIUM]
```
Chaque ligne = 1 facteur sous le seuil + 1 action concrète associée. Jamais de ligne sans action. Jamais de pourcentage de gain de conversion promis tant qu'on n'a pas de données réelles pour le calibrer (voir stratégie de validation, §16).

**Roadmap du score :** la version "règles" reste la version affichée publiquement tant qu'on n'a pas au moins quelques centaines de transactions réelles par catégorie pour calibrer un modèle prédictif honnête. Le passage à un score basé sur des données réelles de conversion est un jalon explicite de V2, pas une promesse de lancement.
- **AI SEO Assistant (V2) :** landing pages et contenu additionnel généré une fois qu'on a assez de produits pour justifier l'investissement.
- **AI Recommendations (V3, quand on a des données réelles) :** seulement à ce moment-là on peut dire "produits similaires qui convertissent mieux à tel prix", parce qu'on aura un vrai dataset propriétaire pour l'étayer.

Le danger à éviter absolument : promettre un "vrai" copilote intelligent alors que le MVP n'a aucune donnée historique. Mieux vaut un score honnête et utile qu'un score impressionnant et faux.

---

## 8. Architecture technique

**Frontend :** Angular + TypeScript + Tailwind (confirmé), **PWA obligatoire** (manifest + service worker dès le MVP). Note de cadrage : la PWA apporte l'installabilité et un shell applicatif rapide sur mobile — elle n'implique pas d'achat/paiement hors-ligne fonctionnel (le checkout reste dépendant du réseau). Utile en particulier pour le dashboard vendeur consulté depuis un smartphone.

**Backend :** Node.js + Express + TypeScript, architecture modulaire par domaine (auth, products, payments, ai, analytics) plutôt qu'un monolithe non structuré — chaque module a ses routes, services et modèles isolés pour permettre une extraction en microservice plus tard si besoin.

**Base de données : MongoDB Atlas (confirmé), avec mitigation de risque.**
Le risque signalé en début de conversation reste réel : les données `orders`, `payments`, `payouts` sont sensibles à la cohérence. Sans changer de SGBD, voici comment le réduire :
- Utiliser les **transactions multi-documents ACID** de MongoDB (disponibles depuis MongoDB 4.0+) pour toute écriture qui touche à la fois `order` et `payment`.
- Validation de schéma stricte au niveau base (`$jsonSchema`) en plus de la validation applicative (Mongoose/Zod), pour empêcher un bug applicatif de corrompre un montant.
- **Idempotency keys** systématiques sur les webhooks Stripe/PayPal/Mobile Money pour éviter les doubles écritures en cas de retry.
- Collection `payments` en append-only (jamais d'update destructif, uniquement des nouveaux documents d'état) pour garder un historique auditable.

**Stockage fichiers :** Cloudflare R2, avec URLs signées à expiration courte pour le téléchargement sécurisé.

**Paiements :** **Stripe uniquement au MVP** (arbitrage Product Lead — vitesse de validation avant couverture géographique complète, voir §0bis). Le module de paiement est isolé derrière une interface interne (`PaymentProvider`) dès le MVP pour que l'ajout de Flutterwave en V1.5 soit une implémentation supplémentaire, pas une réécriture.

**Architecture IA — agnostique au fournisseur :**
```
AIService (interface interne)
   ├── OpenAIProvider
   ├── ClaudeProvider
   └── (futur) LocalModelProvider
```
Chaque fonctionnalité IA (optimiseur produit, Growth Score) appelle `AIService`, jamais directement le SDK d'un fournisseur. Le choix du provider actif est une config, pas un changement de code. Raison : le marché des modèles évolue vite (nouveaux modèles, nouveaux prix, nouvelles capacités) et le produit ne doit jamais être bloqué par un fournisseur unique. Cela permet aussi de faire du routing par tâche si utile plus tard (ex. un modèle pour la génération de texte, un autre pour le scoring), sans que ce soit un engagement du MVP.

**Sécurité :** hashing des mots de passe (argon2/bcrypt), rate limiting sur les endpoints d'auth et d'upload, scan antivirus basique sur les fichiers uploadés, chiffrement au repos pour les documents sensibles.

**Scalabilité :** le point de charge le plus probable au démarrage n'est pas le trafic, c'est la génération IA synchrone. Prévoir une file de jobs (ex. BullMQ + Redis) pour les appels IA dès le MVP, pour ne jamais bloquer une requête HTTP sur un appel de plusieurs secondes.

---

## 9. Schéma de base de données (extrait MVP)

```
users        { _id, email, passwordHash?, authProvider, country, createdAt }
products     { _id, sellerId, title, description, priceAmount, priceCurrency,
               category, fileRef (R2 key), imageRef, status, seoMeta, createdAt }
orders       { _id, productId, buyerEmail, amount, currency, status, createdAt }
payments     { _id, orderId, provider, providerRef, idempotencyKey, status,
               amount, currency, createdAt }
payouts      { _id, sellerId, amount, currency, method, status, createdAt }
salesScores  { _id, productId, score, ruleBreakdown[], generatedAt }
```

---

## 10. Design d'API (extrait)

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/products
GET    /api/products/:id
POST   /api/products/:id/optimize        (IA)
GET    /api/products/:id/sales-score     (IA, règles)
POST   /api/checkout/session
POST   /api/webhooks/stripe
POST   /api/webhooks/flutterwave
GET    /api/dashboard/overview
```

Chaque endpoint de paiement/webhook doit être idempotent et logué avec un identifiant de corrélation.

---

## 11. Principes UX/UI

- Le vendeur ne doit jamais voir un écran vide sans action suggérée (empty states actionnables).
- Le score de vente doit toujours être accompagné d'au moins une action concrète, jamais d'un chiffre seul.
- Publication en 3 étapes maximum (upload → optimiser → publier).
- Aucune génération IA n'est irréversible sans confirmation explicite.

---

## 12. Monétisation (v1.1 — arbitrage Product Lead : Freemium + commission hybride)

| Plan | Prix | Commission | Inclus |
|---|---|---|---|
| **Free** | 0€ | 10% | 3 produits, IA limitée (génération de base) |
| **Pro** | 9,99€/mois | 5% | Produits illimités, IA complète, Growth Score™ avancé, analytics |
| **Business** | 29€/mois | 5% | Équipes, accès API, branding personnalisé |

**Point de vigilance transparence (voir §0bis) :** la commission plateforme n'est qu'une partie du coût réel pour le vendeur — s'y ajoutent les frais Stripe (~2,9% + 0,30€ par transaction). Le dashboard doit toujours afficher le **taux effectif total** ("vous recevrez X€ sur Y€ de vente"), jamais la commission plateforme isolée, pour ne pas reproduire l'effet "frais cachés" reproché à d'autres plateformes du secteur.

Logique du modèle : un créateur n'aime pas payer avant de gagner — le Free sans engagement lève la barrière à l'entrée, la commission plus élevée sur le Free finance l'acquisition, et le passage au Pro devient un choix naturel dès que le volume de ventes rend les 5 points de commission économisés supérieurs aux 9,99€/mois (seuil de bascule à afficher explicitement au vendeur — ex. "vous économiseriez X€/mois en passant Pro").

---

## 13. Roadmap

- **MVP (0-3 mois) :** tout §5.
- **V2 :** SEO Engine, marketplace interne, publication réseaux sociaux.
- **V3 :** assistant IA conversationnel (uniquement une fois qu'on a des données réelles de vente).
- **V4-V5 :** marketing (email, coupons), affiliation.

---

## 14. Risques et défis

1. **Dilution géographique** — vouloir servir "toutes les nations" dès le lancement dilue le budget d'intégration paiement et de support. *Mitigation : architecture globale, GTM restreint.*
2. **Chariow avance déjà sur l'IA** — notre fenêtre de différenciation est plus courte qu'espéré. *Mitigation : shipper le score de vente basé sur des règles vite, itérer avec de vrais vendeurs plutôt que de sur-designer avant lancement.*
3. **Crédibilité du score IA** — un score inventé détruit la confiance en une fois. *Mitigation : transparence totale sur le calcul, jamais de métrique inventée.*
4. **Paiement Mobile Money** — complexité réglementaire et de conformité par pays. *Mitigation : passer par un agrégateur (Flutterwave) plutôt que des intégrations directes.*
5. **MongoDB pour les données financières** — risque de cohérence. *Mitigation : transactions ACID + idempotency + schéma strict (§8).*

---

## 15. Recommandations du CTO

- Ne pas viser "toutes les nations" au lancement : choisir 2-3 pays pilotes (par ex. France + Côte d'Ivoire + Sénégal) pour valider le funnel complet avant d'étendre.
- Ne pas construire le score IA "impressionnant" tout de suite — construire la version honnête d'abord, elle sera plus crédible et plus rapide à shipper.
- Vérifier régulièrement l'évolution de Chariow (ils bougent vite) : notre différenciation doit rester une cible mouvante, pas un plan figé.
- Avant de coder, valider le funnel complet (upload → optimiser → publier → payer) en interne avec 5 à 10 vrais vendeurs pilotes, pas seulement en théorie.

---

## 16. Stratégie de validation MVP — les 10 premiers vendeurs

Le MVP n'est pas "terminé" quand le code est déployé. Il est validé quand on peut répondre factuellement à la question du North Star Metric : *combien de vendeurs augmentent réellement leurs chances de vendre grâce à nous ?*

**Critères de sélection des 10 premiers vendeurs pilotes :**
- Vendent déjà un produit numérique ailleurs (Gumroad, Chariow, Etsy...) — on veut des vendeurs actifs, pas des débutants qui n'ont encore rien à vendre.
- Leur audience d'acheteurs paie majoritairement par carte (cf. §0bis — condition nécessaire tant que Mobile Money n'est pas livré).
- Mélange volontaire de catégories (ebook, formation, template, presets) pour stress-tester le Growth Score sur des types de produits différents.
- Au moins 2-3 vendeurs technophiles capables de donner un retour critique et précis (pas seulement "c'est cool").

**Ce qu'on mesure pendant la phase pilote (avant tout lancement public) :**
- Temps réel du parcours upload → publication (benchmark cible : moins de 10 minutes, cf. §4).
- Taux d'application des recommandations du Growth Score (un vendeur suit-il les actions suggérées ou les ignore-t-il ?).
- Delta de score avant/après application des recommandations, et si possible delta de conversion réel — première donnée propriétaire qui alimentera la V2 du score.
- Frictions verbatim sur le paiement Stripe-only (combien de ventes perdues faute de Mobile Money — cette donnée seule justifiera ou non la priorité réelle de la V1.5).

**Critère de passage en lancement public :** au moins 7 des 10 vendeurs pilotes disent explicitement qu'ils préfèrent publier sur DigitalESF Market plutôt que sur leur plateforme habituelle pour au moins une raison liée au Growth Score ou à l'optimisation IA — pas seulement "les frais sont plus bas".

---

## Prochaine étape proposée

1. Vous confirmez le §0bis (conséquence Stripe-only assumée) — c'est la dernière hypothèse stratégique ouverte.
2. Vous validez la liste de critères de sélection des 10 vendeurs pilotes (§16), et si possible on identifie déjà 2-3 noms concrets.
3. On passe à l'architecture repo + setup du projet (GitHub, Angular, Node API, schéma Mongo, Auth, module Produit) — pas de code produit avant ce feu vert explicite.
