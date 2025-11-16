# Architecture de Kurama

## Vue d'Ensemble

Kurama est une plateforme éducative moderne construite avec une architecture monorepo qui sépare clairement les responsabilités entre le frontend, le backend et les utilitaires partagés. Cette approche permet une meilleure maintenabilité, une évolutivité accrue et une collaboration plus efficace entre les développeurs.

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Kurama Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Frontend       │    │   Backend       │                │
│  │  (TanStack)     │◄──►│   (Hono)        │                │
│  │                 │    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           └───────────────────────┼────────────────────┐   │
│                                   │                    │   │
│                    ┌─────────────────┐                │   │
│                    │  Shared Package  │                │   │
│                    │  (data-ops)      │                │   │
│                    └─────────────────┘                │   │
│                                   │                    │   │
│                                   ▼                    │   │
│                    ┌─────────────────┐                │   │
│                    │   PostgreSQL    │                │   │
│                    │   Database      │                │   │
│                    └─────────────────┘                │   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Structure du Projet

### Monorepo Structure

```
kurama/
├── apps/
│   ├── user-application/     # Frontend TanStack Start
│   │   ├── src/
│   │   │   ├── components/    # Composants React réutilisables
│   │   │   ├── routes/        # Routes TanStack Router
│   │   │   ├── hooks/         # Hooks personnalisés
│   │   │   ├── lib/           # Utilitaires frontend
│   │   │   ├── core/          # Logique métier frontend
│   │   │   └── styles.css     # Styles globaux
│   │   ├── public/            # Assets statiques
│   │   └── wrangler.jsonc     # Configuration Cloudflare
│   │
│   └── data-service/          # Backend API Hono
│       ├── src/
│       │   ├── hono/          # Routes API Hono
│       │   ├── durable-objects/ # Objets durables Cloudflare
│       │   └── workflows/      # Workflows Cloudflare
│       └── wrangler.jsonc     # Configuration Cloudflare
│
├── packages/
│   └── data-ops/              # Package partagé
│       ├── src/
│       │   ├── auth/          # Configuration authentification
│       │   ├── database/      # Configuration base de données
│       │   ├── drizzle/       # Schémas de base de données
│       │   └── queries/       # Requêtes partagées
│       └── drizzle.config.ts  # Configuration Drizzle
│
├── docs/                      # Documentation
└── README.md                  # Documentation principale
```

## Architecture Frontend

### Stack Technique

- **Framework**: TanStack Start (React 19 avec SSR)
- **Routing**: TanStack Router (routing basé sur les fichiers)
- **State Management**: TanStack Query avec persistance
- **Styling**: Tailwind CSS v4 avec Shadcn/UI
- **Authentification**: Better Auth
- **PWA**: Service Worker avec Workbox

### Architecture des Composants

```
src/
├── components/
│   ├── auth/                  # Composants d'authentification
│   ├── skeletons/             # Composants de chargement
│   └── not-found.tsx          # Page 404
├── routes/
│   ├── __root.tsx             # Layout racine
│   ├── index.tsx              # Page d'accueil
│   ├── onboarding.tsx         # Page d'intégration
│   ├── _auth/                 # Routes protégées
│   │   ├── app/               # Application principale
│   │   └── api/               # Routes API frontend
│   └── routeTree.gen.ts       # Arbre des routes généré
├── hooks/
│   ├── use-auth-persistence.ts # Persistance de l'auth
│   ├── use-offline-content.ts  # Gestion hors ligne
│   └── use-swipe-handler.ts   # Gestion des swipe
├── lib/
│   ├── spaced-repetition.ts   # Algorithme SM-2
│   ├── auth-client.ts         # Client d'authentification
│   └── performance-monitor.ts # Monitoring performance
└── core/
    ├── functions/             # Fonctions serveur
    ├── middleware/            # Middleware serveur
    └── integrations/          # Intégrations tierces
```

### Flux de Données Frontend

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │───►│   TanStack      │───►│   Server Fn     │
│                 │    │   Router        │    │   (API Call)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TanStack      │◄───│   TanStack      │◄───│   Backend API   │
│   Query Cache   │    │   Query Hook    │    │   (Response)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Architecture Backend

### Stack Technique

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Base de Données**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod

### Architecture des Services

```
src/
├── hono/
│   └── app.ts                 # Application Hono principale
├── durable-objects/
│   └── example-durable-object.ts # Exemple d'objet durable
└── workflows/
    └── example-workflow.ts    # Exemple de workflow
```

### Flux de Données Backend

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───►│   Hono Route    │───►│   Middleware     │
│   Request       │    │                 │    │   (Auth, etc.)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Response      │◄───│   Hono Handler  │◄───│   Business      │
│   to Frontend   │    │                 │    │   Logic         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄───│   Validation     │◄───│   Database      │
│   Cache Update  │    │   (Zod)         │    │   (Drizzle)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Package Partagé (data-ops)

### Responsabilités

Le package `@kurama/data-ops` contient tout le code partagé entre le frontend et le backend :

- **Schémas de base de données**: Définitions Drizzle partagées
- **Configuration d'authentification**: Setup Better Auth
- **Validation**: Schémas Zod partagés
- **Utilitaires**: Fonctions communes

### Structure

```
src/
├── auth/
│   ├── server.ts              # Configuration serveur Better Auth
│   └── setup.ts               # Configuration client Better Auth
├── database/
│   ├── drizzle-orm.ts         # Configuration Drizzle
│   ├── setup.ts               # Setup base de données
│   └── seed-*.ts              # Scripts de seed
├── drizzle/
│   ├── auth-schema.ts         # Schémas d'authentification
│   ├── schema.ts              # Schémas métier
│   └── migrations/            # Migrations de base de données
└── queries/
    └── polar.ts               # Requêtes Polar (paiements)
```

## Architecture de la Base de Données

### Schéma Principal

La base de données PostgreSQL est organisée autour de plusieurs domaines :

#### Structure Éducative
- **grades**: Niveaux (CP1, CP2, 6ème, etc.)
- **series**: Séries (A, C, D, etc.)
- **subjects**: Matières (Maths, Français, etc.)
- **subjectOfferings**: Offres de matières par niveau/série

#### Contenu Pédagogique
- **lessons**: Leçons organisées par matière
- **cards**: Flashcards avec contenu avant/arrière

#### Utilisateurs et Progression
- **userProfiles**: Profils étendus des utilisateurs
- **userProgress**: Progression individuel par carte (SM-2)
- **studySessions**: Sessions d'étude

#### Authentification
- **auth_user**: Utilisateurs Better Auth
- **auth_session**: Sessions Better Auth
- **auth_account**: Comptes externes (Google)
- **auth_verification**: Vérifications (OTP)

### Relations

```
┌─────────────────┐    ┌─────────────────┐
│     grades      │◄──►│   series        │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌─────────────────┐
         │subjectOfferings │
         └─────────────────┘
                     │
                     ▼
         ┌─────────────────┐
         │    subjects     │
         └─────────────────┘
                     │
                     ▼
         ┌─────────────────┐
         │     lessons     │
         └─────────────────┘
                     │
                     ▼
         ┌─────────────────┐
│      cards       │◄──►│ userProgress   │
└─────────────────┘    └─────────────────┘
```

## Architecture de l'Authentification

### Flux d'Authentification

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │───►│   Frontend      │───►│   Better Auth   │
│   Login         │    │   Auth Form     │    │   Frontend      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Session       │◄───│   Better Auth   │◄───│   Backend API   │
│   Storage       │    │   Backend      │    │   Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Méthodes d'Authentification

1. **Email OTP**: Code à usage unique envoyé par email
2. **Google OAuth**: Connexion via compte Google
3. **Session Persistance**: Sessions maintenues entre rechargements

## Architecture PWA (Progressive Web App)

### Service Worker

Le service Worker implémente :

- **Mise en Cache**: Cache des ressources statiques et du contenu
- **Mode Hors Ligne**: Accès au contenu sans connexion
- **Stratégies de Cache**: Différentes stratégies selon le type de ressource

### Stratégies de Cache

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │───►│   Cache First   │───►│   Network Fallback│
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Requests  │───►│   Network First │───►│   Cache Fallback  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Offline Content│───►│   Cache Only    │───►│   No Network     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Architecture de la Répétition Espacée

### Algorithme SM-2

L'implémentation de l'algorithme SuperMemo 2 :

```typescript
interface SM2Result {
  interval: number        // Jours jusqu'à la prochaine révision
  repetitions: number     // Nombre de répétitions
  easinessFactor: number  // Facteur de facilité (1.3 - 2.5)
  nextReviewDate: number  // Date de la prochaine révision
}
```

### Flux de Révision

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Review   │───►│   Quality Score │───►│   SM-2 Algorithm │
│   (0-5)         │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next Review   │◄───│   Progress       │◄───│   Database      │
│   Date          │    │   Update         │    │   Update         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Architecture de Déploiement

### Cloudflare Workers

Les deux applications sont déployées sur Cloudflare Workers :

- **Frontend**: `kurama.yeko.workers.dev`
- **Backend**: `back-kurama.yeko.workers.dev`

### CI/CD

GitHub Actions automatise le déploiement :

1. **Test**: Exécution des tests sur chaque PR
2. **Build**: Construction des applications
3. **Deploy**: Déploiement sur Cloudflare Workers
4. **Preview**: Déploiements de prévisualisation pour les PRs

## Patterns et Bonnes Pratiques

### Patterns Utilisés

1. **Monorepo**: Partage du code entre frontend et backend
2. **Server Functions**: Logique serveur sécurisée avec typage
3. **Middleware**: Chaînage de middleware pour auth, logging, etc.
4. **Type Safety**: TypeScript de bout en bout
5. **Validation**: Zod pour la validation des données

### Bonnes Pratiques

1. **Code Splitting**: Division du code en chunks optimisés
2. **Performance Optimisation**: Monitoring et optimisation continue
3. **Error Boundaries**: Gestion élégante des erreurs
4. **Progressive Enhancement**: Fonctionnalité dégradée gracieusement
5. **Accessibility**: Support WCAG et navigation clavier

## Évolutivité et Maintenance

### Évolutivité

L'architecture permet :

- **Montée en charge**: Cloudflare Workers s'adapte automatiquement
- **Ajout de fonctionnalités**: Structure modulaire facile à étendre
- **Multi-régions**: Distribution globale via Cloudflare

### Maintenance

- **Tests automatisés**: Couverture de code complète
- **Documentation**: Documentation technique complète
- **Monitoring**: Surveillance des performances et erreurs
- **Mises à jour**: Dépendances maintenues à jour

## Sécurité

### Mesures de Sécurité

1. **Authentification**: Better Auth avec sessions sécurisées
2. **Validation**: Validation stricte des entrées avec Zod
3. **HTTPS**: TLS 1.3 obligatoire via Cloudflare
4. **CORS**: Configuration CORS restrictive
5. **Secrets Management**: Variables d'environnement sécurisées

### Protection des Données

- **Données personnelles**: Conformité RGPD
- **Sessions**: Sessions HTTP-only et sécurisées
- **OTP**: Codes à usage unique pour l'authentification
- **OAuth**: Flux OAuth 2.0 sécurisé pour Google

Cette architecture moderne et évolutive permet à Kurama de fournir une expérience utilisateur exceptionnelle tout en maintenant une base de code maintenable et sécurisée.