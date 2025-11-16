# Guide de Déploiement

Ce guide explique comment déployer Kurama en production sur Cloudflare Workers. Le processus inclut la configuration des environnements, la gestion des variables d'environnement, et l'automatisation via CI/CD.

## Vue d'Ensemble

Kurama est déployé sur Cloudflare Workers avec l'architecture suivante :

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Frontend       │    │   Backend       │                │
│  │  (kurama)       │    │   (back-kurama) │                │
│  │                 │    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           └───────────────────────┼────────────────────┐   │
│                                   │                    │   │
│                    ┌─────────────────┐                │   │
│                    │   PostgreSQL    │                │   │
│                    │   (External)    │                │   │
│                    └─────────────────┘                │   │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Prérequis

### Compte Cloudflare

1. **Créer un compte** sur [Cloudflare](https://www.cloudflare.com/)
2. **Choisir un plan** (Free suffisant pour commencer)
3. **Vérifier le domaine** (optionnel pour le développement)

### Outils Requis

```bash
# Installer Wrangler CLI
npm install -g wrangler

# S'authentifier
wrangler login
```

### Base de Données

- **PostgreSQL** hébergé (Neon, PlanetScale, ou autre)
- **Identifiants** de connexion à la base de données

## Configuration des Workers Cloudflare

### 1. Configuration du Backend

Créez le fichier `apps/data-service/wrangler.jsonc` :

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "back-kurama",
  "main": "./src/index.ts",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "observability": {
    "enabled": true
  },
  "workers_dev": true,
  "preview_urls": true,
  "vars": {
    "ENVIRONMENT": "production"
  },
  "d1_databases": [],
  "kv_namespaces": []
}
```

### 2. Configuration du Frontend

Créez le fichier `apps/user-application/wrangler.jsonc` :

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "kurama",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "main": "./src/server.ts",
  "vars": {
    "ENVIRONMENT": "production",
    "API_URL": "https://back-kurama.yeko.workers.dev"
  },
  "workers_dev": true,
  "preview_urls": true
}
```

## Variables d'Environnement

### Variables Requises

Configurez ces variables dans le dashboard Cloudflare ou via Wrangler :

#### Backend Variables

```bash
# Base de données
wrangler secret put DATABASE_HOST
wrangler secret put DATABASE_USERNAME
wrangler secret put DATABASE_PASSWORD

# Authentification
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# Paiements (optionnel)
wrangler secret put POLAR_ACCESS_TOKEN
```

#### Frontend Variables

```bash
# URL de l'API backend
wrangler secret put API_URL

# Authentification
wrangler secret put BETTER_AUTH_URL
wrangler secret put BETTER_AUTH_SECRET

# Google OAuth
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### Configuration des Secrets

```bash
# Pour le backend
cd apps/data-service

# Base de données
wrangler secret put DATABASE_HOST
# Entrez: votre-host-postgres.com
wrangler secret put DATABASE_USERNAME
# Entrez: votre-username
wrangler secret put DATABASE_PASSWORD
# Entrez: votre-password

# Authentification
wrangler secret put BETTER_AUTH_SECRET
# Entrez: votre-secret-32-caracteres-aleatoire
wrangler secret put GOOGLE_CLIENT_ID
# Entrez: votre-google-client-id
wrangler secret put GOOGLE_CLIENT_SECRET
# Entrez: votre-google-client-secret
```

## Déploiement Manuel

### 1. Préparation

```bash
# Construire le package partagé
pnpm run build:data-ops

# Vérifier les types
pnpm run typecheck

# Exécuter les tests
pnpm test
```

### 2. Déploiement du Backend

```bash
cd apps/data-service

# Déployer en production
wrangler deploy --env production

# Vérifier le déploiement
curl https://back-kurama.yeko.workers.dev
```

### 3. Déploiement du Frontend

```bash
cd apps/user-application

# Construire pour la production
pnpm run build:production

# Déployer en production
wrangler deploy --env production

# Vérifier le déploiement
curl https://kurama.yeko.workers.dev
```

### 4. Vérification Post-Déploiement

```bash
# Vérifier les logs du backend
wrangler tail back-kurama --format pretty

# Vérifier les logs du frontend
wrangler tail kurama --format pretty

# Tester l'authentification
curl -X POST https://back-kurama.yeko.workers.dev/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Configuration du Domaine Personnalisé

### 1. Ajouter un Domaine

```bash
# Pour le frontend
wrangler custom-domains add kurama.app

# Pour le backend
wrangler custom-domains add api.kurama.app
```

### 2. Configuration DNS

Dans le dashboard Cloudflare :

1. **Ajouter les enregistrements** :
   ```
   Type: CNAME
   Name: kurama
   Target: kurama.yeko.workers.dev
   Proxy: Enabled
   
   Type: CNAME
   Name: api
   Target: back-kurama.yeko.workers.dev
   Proxy: Enabled
   ```

2. **Configurer SSL** :
   - Mode SSL : Full (strict)
   - Certificat SSL : Cloudflare généré automatiquement

### 3. Mise à Jour des URLs

Mettez à jour les variables d'environnement :

```bash
# Frontend
wrangler secret put API_URL
# Entrez: https://api.kurama.app

# Backend
wrangler secret put FRONTEND_URL
# Entrez: https://kurama.app
```

## Configuration CI/CD avec GitHub Actions

### 1. Clé API Cloudflare

1. **Générer un token** :
   - Allez dans [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Créez un token avec le template "Edit Cloudflare Workers"
   - Copiez le token

2. **Ajouter aux secrets GitHub** :
   - Repository → Settings → Secrets and variables → Actions
   - Ajoutez `CLOUDFLARE_API_TOKEN`
   - Ajoutez `CLOUDFLARE_ACCOUNT_ID`

### 2. Workflow de Déploiement

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build shared package
        run: pnpm run build:data-ops

      - name: Run tests
        run: pnpm test

      - name: Deploy backend
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
          workingDirectory: apps/data-service

      - name: Deploy frontend
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
          workingDirectory: apps/user-application

      - name: Deploy preview
        if: github.event_name == 'pull_request'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
          workingDirectory: apps/user-application
```

### 3. Workflow de Tests

Créez `.github/workflows/test.yml` :

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build shared package
        run: pnpm run build:data-ops

      - name: Type check
        run: pnpm run typecheck

      - name: Lint
        run: pnpm run lint

      - name: Test
        run: pnpm test
```

## Monitoring et Logging

### 1. Configuration du Monitoring

Dans le dashboard Cloudflare :

1. **Workers & Pages → kurama → Analytics**
2. **Activez les métriques** :
   - Requests
   - Errors
   - CPU Time
   - Memory

### 2. Configuration des Logs

```bash
# Voir les logs en temps réel
wrangler tail kurama --format pretty
wrangler tail back-kurama --format pretty

# Exporter les logs
wrangler tail kurama --format json > logs.json
```

### 3. Alertes

Configurez des alertes pour :

- **Taux d'erreur** > 5%
- **Temps de réponse** > 1000ms
- **Utilisation CPU** > 80%

## Gestion des Migrations de Base de Données

### 1. Préparation des Migrations

```bash
cd packages/data-ops

# Générer les migrations
pnpm run drizzle:generate

# Vérifier les migrations générées
ls -la src/drizzle/
```

### 2. Application des Migrations

```bash
# Appliquer les migrations en production
pnpm run drizzle:migrate

# Vérifier l'état de la base de données
pnpm run drizzle:status
```

### 3. Rollback en Cas d'Erreur

```bash
# Annuler la dernière migration
pnpm run drizzle:rollback

# Réinitialiser la base de données (DANGER)
pnpm run drizzle:drop
```

## Gestion des Versions

### 1. Versioning Sémantique

Utilisez le versioning sémantique (SemVer) :

```
MAJOR.MINOR.PATCH

MAJOR: Changements cassants
MINOR: Nouvelles fonctionnalités
PATCH: Corrections de bugs
```

### 2. Tags Git

```bash
# Créer un tag de version
git tag -a v1.0.0 -m "Version 1.0.0"

# Pousser le tag
git push origin v1.0.0
```

### 3. Déploiement par Version

```bash
# Déployer une version spécifique
wrangler deploy --compatibility-date 2024-01-01

# Déployer avec rollback
wrangler rollback kurama --version 42
```

## Optimisation de la Performance

### 1. Optimisation du Frontend

```bash
# Analyser les bundles
pnpm run build:analyze

# Vérifier les budgets de performance
pnpm run perf:check-bundles

# Optimiser les images
pnpm run optimize:images
```

### 2. Optimisation du Backend

```bash
# Activer le caching
# Dans le code backend :
app.get('/api/lessons', async (c) => {
  c.header('Cache-Control', 'public, max-age=3600')
  // ...
})
```

### 3. Configuration CDN

Dans le dashboard Cloudflare :

1. **Caching Rules** :
   - Static assets : 1 an
   - API responses : 1 heure
   - HTML : 5 minutes

2. **Page Rules** :
   - Cache Everything pour les assets statiques
   - Bypass pour les endpoints d'authentification

## Sécurité

### 1. Configuration WAF

Activez le Web Application Firewall :

```bash
# Via le dashboard Cloudflare
Security → WAF → Create rule
```

Règles recommandées :

- **Rate limiting** : 100 req/min par IP
- **SQL Injection** : Bloquer les patterns suspects
- **XSS Protection** : Activer les filtres XSS

### 2. Configuration CORS

Dans le backend :

```typescript
app.use('*', cors({
  origin: ['https://kurama.app', 'https://www.kurama.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}))
```

### 3. Headers de Sécurité

```typescript
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  await next()
})
```

## Déploiement Multi-Environnements

### 1. Environnement de Staging

Créez des workers séparés pour le staging :

```jsonc
{
  "name": "kurama-staging",
  "vars": {
    "ENVIRONMENT": "staging",
    "API_URL": "https://back-kurama-staging.yeko.workers.dev"
  }
}
```

### 2. Workflow Staging

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env staging
```

### 3. Promotion en Production

```bash
# Promouvoir le staging en production
wrangler secret clone --from-env staging --to-env production
wrangler deploy --env production
```

## Dépannage

### Problèmes Communs

1. **Déploiement échoue** :

```bash
# Vérifier la configuration
wrangler whoami
wrangler tail kurama

# Réessayer avec --compatibility-date
wrangler deploy --compatibility-date 2024-01-01
```

2. **Variables d'environnement manquantes** :

```bash
# Lister les variables
wrangler secret list

# Ajouter les variables manquantes
wrangler secret put NOM_VARIABLE
```

3. **Erreurs de base de données** :

```bash
# Vérifier la connexion
wrangler secret list | grep DATABASE

# Tester la connexion localement
DATABASE_URL="postgresql://..." pnpm run db:test
```

### Outils de Débogage

```bash
# Logs détaillés
wrangler tail kurama --format json --level debug

# Monitoring en temps réel
wrangler tail kurama --since 1h

# Profiling
wrangler deploy --profile
```

## Bonnes Pratiques

### 1. Checklist de Déploiement

- [ ] Tests passent
- [ ] Build réussit
- [ ] Variables d'environnement configurées
- [ ] Migrations appliquées
- [ ] Domaines configurés
- [ ] Monitoring activé
- [ ] Documentation mise à jour

### 2. Déploiement Bleu-Vert

```bash
# Déployer la nouvelle version
wrangler deploy --env blue

# Tester la nouvelle version
curl https://kurama-blue.yeko.workers.dev

# Basculement du trafic
wrangler route update kurama.app --service kurama-blue
```

### 3. Rollback Automatique

Configurez des alertes pour déclencher un rollback automatique :

```yaml
# Dans GitHub Actions
- name: Monitor deployment
  run: |
    # Vérifier les métriques
    # Si erreur > 5%, rollback automatique
    wrangler rollback kurama --version $PREVIOUS_VERSION
```

Ce guide de déploiement couvre tous les aspects nécessaires pour déployer Kurama en production de manière sécurisée et fiable. Pour toute question supplémentaire, consultez la documentation Cloudflare ou contactez l'équipe de développement.