# Guide de Développement

Ce guide vous aidera à configurer un environnement de développement local pour Kurama, que ce soit pour contribuer au projet ou pour l'exécuter localement.

## Prérequis

### Outils Requis

- **Node.js**: Version 18 ou supérieure
- **pnpm**: Gestionnaire de packages (recommandé)
- **Git**: Pour le contrôle de version
- **Compte Cloudflare**: Pour le déploiement et les services Cloudflare
- **Base de données PostgreSQL**: Pour le développement local

### Installation des Outils

```bash
# Installer Node.js (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Installer pnpm
npm install -g pnpm

# Vérifier les versions
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

## Configuration Initiale

### 1. Cloner le Repository

```bash
# Cloner le projet
git clone https://github.com/yourusername/kurama.git
cd kurama

# Configurer les remotes
git remote add upstream https://github.com/yourusername/kurama.git
```

### 2. Installer les Dépendances

```bash
# Installer toutes les dépendances du monorepo
pnpm install

# Construire le package partagé
pnpm run build:data-ops
```

### 3. Configuration de l'Environnement

#### Variables d'Environnement

Créez les fichiers d'environnement nécessaires :

```bash
# Pour le frontend
cp apps/user-application/.env.example apps/user-application/.env.local

# Pour le backend
cp apps/data-service/.env.example apps/data-service/.env
```

#### Configuration de la Base de Données

1. **Créer une base de données PostgreSQL locale** :

```bash
# Avec Docker (recommandé)
docker run --name kurama-db -e POSTGRES_PASSWORD=kurama -e POSTGRES_DB=kurama -p 5432:5432 -d postgres:15

# Ou installer PostgreSQL localement
# Suivez les instructions pour votre OS
```

2. **Configurer les variables de base de données** :

```bash
# apps/data-service/.env
DATABASE_HOST=localhost
DATABASE_USERNAME=kurama
DATABASE_PASSWORD=kurama
DATABASE_NAME=kurama
```

3. **Exécuter les migrations** :

```bash
# Générer les types Drizzle
cd packages/data-ops
pnpm run drizzle:generate

# Appliquer les migrations
pnpm run drizzle:migrate

# Peupler la base de données (optionnel)
pnpm run seed:all
```

#### Configuration de l'Authentification

1. **Google OAuth** :

   - Créez un projet sur [Google Cloud Console](https://console.cloud.google.com/)
   - Activez l'API Google+ et l'API Google OAuth2
   - Créez des identifiants OAuth 2.0
   - Ajoutez les URLs de redirection :
     - Développement: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://kurama.yeko.workers.dev/api/auth/callback/google`

2. **Configurer les variables d'authentification** :

```bash
# apps/user-application/.env.local et apps/data-service/.env
BETTER_AUTH_SECRET=votre-secret-aleatoire-32-caracteres
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
```

#### Configuration Cloudflare

1. **Installer Wrangler CLI** :

```bash
pnpm add -g wrangler
```

2. **S'authentifier auprès de Cloudflare** :

```bash
wrangler login
```

3. **Configurer les workers** :

```bash
# Générer les types Cloudflare pour le frontend
cd apps/user-application
pnpm run cf-typegen

# Générer les types Cloudflare pour le backend
cd apps/data-service
pnpm run cf-typegen
```

## Lancement du Développement

### Démarrer les Services

#### Option 1: Démarrage Individuel

```bash
# Terminal 1: Démarrer le backend
pnpm run dev:kurama-backend

# Terminal 2: Démarrer le frontend
pnpm run dev:kurama-frontend
```

#### Option 2: Démarrage Simultané (avec concurrently)

```bash
# Installer concurrently si nécessaire
pnpm add -g concurrently

# Démarrer les deux services
concurrently "pnpm run dev:kurama-backend" "pnpm run dev:kurama-frontend"
```

### Accès aux Applications

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8787 (ou l'URL affichée par Wrangler)

### Vérification du Fonctionnement

1. **Vérifier le frontend** :
   - Ouvrez http://localhost:3000
   - Vérifiez que la page se charge correctement
   - Testez l'authentification

2. **Vérifier le backend** :
   - Ouvrez http://localhost:8787
   - Vous devriez voir "Hello World"
   - Testez les endpoints API

## Workflow de Développement

### Structure des Branches

```
main                 # Branche principale de production
├── develop          # Branche de développement
├── feature/*        # Branches de fonctionnalités
├── bugfix/*         # Branches de correction
└── hotfix/*         # Corrections urgentes
```

### Créer une Nouvelle Fonctionnalité

1. **Créer une branche** :

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

2. **Développer la fonctionnalité** :

```bash
# Faire vos modifications
# Ajouter des tests
# Mettre à jour la documentation
```

3. **Tester localement** :

```bash
# Exécuter les tests
pnpm test

# Vérifier le typage
pnpm typecheck

# Vérifier le linting
pnpm lint
```

4. **Commiter les changements** :

```bash
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
```

5. **Pousser et créer une PR** :

```bash
git push origin feature/nouvelle-fonctionnalite
# Créer une Pull Request sur GitHub
```

### Conventions de Commit

Nous utilisons les [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour de la documentation
style: formatage du code
refactor: refactoring du code
test: ajout/modification de tests
chore: tâches de maintenance
```

## Débogage

### Débogage du Frontend

1. **Outils de développement** :
   - Utilisez les DevTools de votre navigateur
   - TanStack Router DevTools (en développement)
   - TanStack Query DevTools (en développement)

2. **Logging** :

```typescript
// Utiliser console.log pour le débogage rapide
console.log('Debug info:', data)

// Pour le logging plus structuré
import { logger } from '@/lib/logger'
logger.info('User action', { userId, action })
```

3. **Points d'arrêt** :
   - Utilisez les points d'arrêt dans votre IDE
   - Ajoutez `debugger;` dans le code

### Débogage du Backend

1. **Logs Cloudflare** :

```bash
# Voir les logs en temps réel
wrangler tail back-kurama --format pretty
```

2. **Logs locaux** :

```typescript
// Dans le backend Hono
console.log('Request received:', c.req.url)
console.error('Error:', error)
```

3. **Débogage de la base de données** :

```bash
# Voir les requêtes SQL (en développement)
# Ajoutez ceci à votre configuration Drizzle
logging: true,
logger: (log) => console.log(log),
```

## Tests

### Types de Tests

1. **Tests Unitaires** : Tests de fonctions isolées
2. **Tests d'Intégration** : Tests d'interaction entre composants
3. **Tests End-to-End** : Tests de flux utilisateur complets

### Exécuter les Tests

```bash
# Exécuter tous les tests
pnpm test

# Exécuter les tests en mode watch
pnpm test:watch

# Exécuter les tests pour un package spécifique
pnpm --filter kurama-frontend test
pnpm --filter kurama-backend test
```

### Écrire des Tests

#### Tests Frontend (Vitest + Testing Library)

```typescript
// apps/user-application/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

#### Tests Backend (Vitest)

```typescript
// apps/data-service/src/hono/__tests__/app.test.ts
import { app } from '../app'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('should return Hello World', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello World')
  })
})
```

## Performance

### Monitoring de la Performance

1. **Frontend** :

```typescript
// Utiliser le monitoring intégré
import { initPerformanceMonitoring } from '@/lib/performance-monitor'

// Le monitoring est automatiquement initialisé dans __root.tsx
```

2. **Budgets de Performance** :

```bash
# Vérifier les budgets de performance
pnpm run perf:check-bundles
```

3. **Optimisation** :

```bash
# Valider les optimisations
pnpm run validate:optimizations
```

### Outils de Performance

- **Lighthouse**: Audit de performance
- **Bundle Analyzer**: Analyse des bundles
- **Web Vitals**: Mesures Core Web Vitals

## Déploiement Local

### Déploiement sur Cloudflare Workers (Local)

```bash
# Déployer le backend localement
cd apps/data-service
wrangler dev --local

# Déployer le frontend localement
cd apps/user-application
wrangler dev --local
```

### Déploiement en Preview

```bash
# Déployer en preview (après avoir commité)
pnpm run deploy:kurama-backend
pnpm run deploy:kurama-frontend
```

## Résolution de Problèmes

### Problèmes Communs

1. **Problèmes de dépendances** :

```bash
# Nettoyer et réinstaller
rm -rf node_modules
pnpm install
pnpm run build:data-ops
```

2. **Problèmes de base de données** :

```bash
# Réinitialiser la base de données
cd packages/data-ops
pnpm run drizzle:drop
pnpm run drizzle:migrate
pnpm run seed:all
```

3. **Problèmes Cloudflare** :

```bash
# Réauthentifier
wrangler logout
wrangler login

# Régénérer les types
pnpm run cf-typegen
```

4. **Problèmes de port** :

```bash
# Tuer les processus sur les ports
lsof -ti:3000 | xargs kill -9
lsof -ti:8787 | xargs kill -9
```

### Obtenir de l'Aide

1. **Documentation** :
   - [Architecture](./ARCHITECTURE.md)
   - [API Reference](./API.md)
   - [Deployment Guide](./DEPLOYMENT.md)

2. **Communauté** :
   - [Issues GitHub](https://github.com/yourusername/kurama/issues)
   - [Discussions GitHub](https://github.com/yourusername/kurama/discussions)

3. **Ressources Externes** :
   - [TanStack Start Docs](https://tanstack.com/start)
   - [Hono Docs](https://hono.dev/)
   - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## Bonnes Pratiques

### Code Quality

1. **TypeScript** : Utilisez des types stricts
2. **ESLint** : Suivez les règles de linting
3. **Prettier** : Formatez votre code
4. **Tests** : Maintenez une bonne couverture de tests

### Performance

1. **Lazy Loading** : Chargez les composants à la demande
2. **Code Splitting** : Divisez le code en chunks optimisés
3. **Caching** : Utilisez le caching intelligemment
4. **Images** : Optimisez les images

### Sécurité

1. **Validation** : Validez toutes les entrées
2. **Authentification** : Sécurisez les endpoints
3. **Secrets** : Ne commitez jamais de secrets
4. **HTTPS** : Utilisez toujours HTTPS

Ce guide de développement devrait vous fournir toutes les informations nécessaires pour commencer à développer sur Kurama. N'hésitez pas à consulter les autres sections de la documentation pour des informations plus spécifiques.