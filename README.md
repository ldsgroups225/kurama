# Kurama

<div align="center">

![Kurama Logo](public/logo512.png)

**Plateforme d'étude intelligente pour les étudiants préparant BEPC/BAC en Côte d'Ivoire**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare)](https://workers.cloudflare.com/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FFEF15?style=flat&logo=react)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)](https://www.typescriptlang.org/)

[Live Demo](https://kurama.yeko.workers.dev) · [Documentation](#documentation) · [Report Bug](https://github.com/yourusername/kurama/issues) · [Request Feature](https://github.com/yourusername/kurama/issues)

</div>

## 📖 Description

Kurama est une plateforme éducative innovante conçue pour aider les étudiants ivoiriens à préparer efficacement leurs examens du BEPC et du BAC. Notre approche combine la répétition espacée, la gamification et un contenu pédagogique aligné sur le programme du ministère de l'Éducation nationale.

### 🎯 Objectifs Principaux

- **Apprentissage Intelligent**: Utilisation de l'algorithme SM-2 de répétition espacée pour optimiser la mémorisation
- **Gamification**: Système de XP, niveaux, achievements et streaks pour motiver les étudiants
- **Accessibilité**: Application PWA (Progressive Web App) fonctionnant hors ligne
- **Contenu de Qualité**: Matériel pédagogique aligné sur les programmes officiels ivoiriens

## ✨ Fonctionnalités Clés

### 🎓 Pédagogie
- **Répétition Espacée**: Algorithme SM-2 pour optimiser les révisions
- **Flashcards Interactives**: Contenu varié avec différents types de cartes
- **Leçons Structurées**: Organisation par matières, niveaux et séries
- **Suivi de Progrès**: Statistiques détaillées sur l'apprentissage

### 🎮 Gamification
- **Système de XP**: Points d'expérience pour chaque activité
- **Niveaux et Badges**: Récompenses pour les accomplissements
- **Streaks**: Bonus pour l'apprentissage régulier
- **Classements**: Comparaison avec d'autres étudiants (optionnel)

### 📱 Expérience Utilisateur
- **Interface Responsive**: Adaptée à tous les appareils
- **Mode Hors Ligne**: Accès au contenu sans connexion internet
- **Thème Sombre/Clair**: Adaptation aux préférences utilisateur
- **Performance Optimisée**: Chargement rapide et navigation fluide

### 🔐 Authentification et Sécurité
- **Email OTP**: Authentification par code à usage unique
- **Google OAuth**: Connexion via compte Google
- **Profils Utilisateurs**: Personnalisation de l'expérience
- **Données Sécurisées**: Protection des informations personnelles

### 💰 Monétisation
- **Abonnements Premium**: Accès à du contenu avancé via Polar SDK
- **Essai Gratuit**: Période d'essai pour découvrir les fonctionnalités premium
- **Paiements Sécurisés**: Intégration avec des solutions de paiement reconnues

## 🏗️ Architecture Technique

Kurama est construit comme une application monorepo avec une architecture moderne et évolutive :

```
kurama/
├── apps/
│   ├── user-application/     # Frontend TanStack Start
│   └── data-service/         # Backend API Hono
└── packages/
    └── data-ops/             # Utilitaires partagés
```

### 📦 Composants

#### Frontend (`apps/user-application`)
- **Framework**: TanStack Start (React 19)
- **Styling**: Tailwind CSS v4 avec Shadcn/UI
- **State Management**: TanStack Query avec persistance
- **Authentification**: Better Auth
- **PWA**: Service Worker avec Workbox
- **Déploiement**: Cloudflare Workers

#### Backend (`apps/data-service`)
- **Framework**: Hono sur Cloudflare Workers
- **Base de Données**: PostgreSQL avec Drizzle ORM
- **Validation**: Zod schemas
- **Déploiement**: Cloudflare Workers

#### Package Partagé (`packages/data-ops`)
- **Authentification**: Configuration Better Auth
- **Base de Données**: Schémas Drizzle et migrations
- **Validation**: Schémas Zod partagés
- **Utilitaires**: Fonctions communes

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et pnpm
- Un compte Cloudflare
- Une base de données PostgreSQL

### Installation

```bash
# Cloner le repository
git clone https://github.com/yourusername/kurama.git
cd kurama

# Installer les dépendances
pnpm install

# Construire le package partagé
pnpm run build:data-ops
```

### Développement Local

```bash
# Démarrer le frontend
pnpm run dev:kurama-frontend

# Démarrer le backend
pnpm run dev:kurama-backend
```

### Variables d'Environnement

Créez les fichiers `.env` nécessaires :

```bash
# Pour le frontend
cp apps/user-application/.env.example apps/user-application/.env

# Pour le backend
cp apps/data-service/.env.example apps/data-service/.env
```

Configurez les variables requises :
- `DATABASE_HOST`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `POLAR_ACCESS_TOKEN` (optionnel)

## 📚 Documentation

- [Architecture du Système](docs/ARCHITECTURE.md) - Vue d'ensemble technique
- [Guide de Développement](docs/DEVELOPMENT.md) - Configuration de l'environnement de développement
- [Documentation API](docs/API.md) - Référence de l'API backend
- [Guide de Déploiement](docs/DEPLOYMENT.md) - Instructions de mise en production
- [Guide de Contribution](docs/CONTRIBUTING.md) - Comment contribuer au projet

## 🛠️ Stack Technique

### Frontend
- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Authentification**: [Better Auth](https://better-auth.com/)
- **PWA**: [Workbox](https://developer.chrome.com/docs/workbox/)

### Backend
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/)
- **Base de Données**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)

### Développement
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/)

### Déploiement
- **Platform**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **CLI**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- **CI/CD**: GitHub Actions

## 🌍 Déploiement en Production

- **Frontend**: https://kurama.yeko.workers.dev
- **Backend**: https://back-kurama.yeko.workers.dev

## 🤝 Contribuer

Les contributions sont les bienvenues ! Merci de lire notre [Guide de Contribution](docs/CONTRIBUTING.md) pour connaître les procédures.

### Étapes pour Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Committer vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pusher vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC - voir le fichier [LICENSE](LICENSE) pour les détails.

## 🙏 Remerciements

- Au ministère de l'Éducation nationale de Côte d'Ivoire pour les programmes officiels
- À la communauté open source pour les outils incroyables utilisés
- À tous les testeurs bêta pour leurs retours précieux

## 📞 Contact

- **Site Web**: https://kurama.yeko.workers.dev
- **Email**: contact@kurama.ci
- **Twitter**: [@kurama_ci](https://twitter.com/kurama_ci)

---

<div align="center">

Made with ❤️ in Côte d'Ivoire

</div>