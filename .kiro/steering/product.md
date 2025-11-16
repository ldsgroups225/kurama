# Product Overview

**Kurama** - Plateforme d'étude intelligente pour les étudiants préparant BEPC/BAC en Côte d'Ivoire.

An offline-first Progressive Web Application (PWA) monorepo SaaS application with:

- **User Application** (kurama-frontend): TanStack Start frontend with authentication, payments (Polar), and comprehensive UI components
- **Data Service** (kurama-backend): Hono-based API service for Cloudflare Workers
- **Data Ops** (@kurama/data-ops): Shared package for authentication (Better Auth), database operations (Drizzle ORM), and schemas (Zod)

The stack is optimized for Cloudflare deployment with full-stack TypeScript, featuring:
- Spaced repetition learning (SM-2 algorithm)
- Ministry-aligned content for BEPC/BAC preparation
- Multiple study modes (flashcards, quizzes, exam simulator)
- Social learning features (study groups, leaderboards)
- Offline-first PWA capabilities
- Comprehensive gamification system (XP, levels, achievements, streaks)

## Core Features

### Learning System ✅
- **Curriculum**: 13 grades (CP1-Tle), 4 Lycée series (A, C, D, E)
- **Subjects**: 12 core subjects with Ivorian curriculum coefficients
- **Study Modes**: 
  - ✅ Flashcards (interactive flip animations)
  - 🔄 Quiz (multiple choice - planned)
  - 🔄 Exam (timed simulation - planned)
- **Spaced Repetition**: SM-2 algorithm (database schema ready)
- **Learning Flow**: Subject → Lesson → Mode → Session → Summary
- **Content**: 17+ lessons, 61+ flashcards (seeded)
- **Progress**: Per-card tracking with SM-2 support

### User Profiles ✅
- **Student**: Grade, series, subjects with coefficients
- **Parent**: Multiple children, progress monitoring
- **Onboarding**: Multi-step setup with validation
- **Profile Guard**: Redirect if incomplete

### Gamification ✅
- **XP System**: Points for study activities
- **Leveling**: Progressive badges with visual feedback
- **Achievements**: Rarity-based (Common, Rare, Epic, Legendary)
- **Daily Streaks**: Calendar visualization
- **Leaderboards**: Competitive rankings with indicators
- **Animations**: Celebratory milestones

### Authentication ✅
- Email OTP (6-digit, 5-minute expiration)
- Google OAuth integration
- Session management via Better Auth
- Secure token handling

### PWA Capabilities ✅
- Offline-first with Dexie (IndexedDB)
- Service workers with Workbox
- Offline content caching
- Sync dashboard
- Conflict resolution
- Install prompts

### Payments ✅
- Polar SDK integration
- Subscription management
- Multiple pricing tiers

### Social Features 🔄
- Study groups (planned)
- Leaderboards (implemented)
- Community engagement (planned)

## Localization & Context

- **Language**: French (Ivorian context)
- **Timezone**: Africa/Abidjan
- **Curriculum**: Ivorian Ministry of Education aligned
- **Cultural Context**: School calendar, exam preparation focus
- **Target Users**: BEPC/BAC students in Côte d'Ivoire

## Deployment

- **Frontend**: Cloudflare Pages (https://kurama.yeko.workers.dev)
- **Backend**: Cloudflare Workers (https://back-kurama.yeko.workers.dev)
- **Database**: PostgreSQL (Neon or PlanetScale)
- **CI/CD**: GitHub Actions with automatic deployments

## Performance

- Bundle analysis with Rollup visualizer
- Performance budgets configured
- Code splitting with lazy routes
- Image lazy loading
- Request deduplication
- Chunk retry mechanism
- Web Vitals monitoring
