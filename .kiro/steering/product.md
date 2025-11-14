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

### Learning System (Fully Implemented)
- **Curriculum**: 13 grade levels (CP1 to Tle) with 4 Lycée series (A, C, D, E)
- **Subjects**: 12 core subjects with proper coefficients matching Ivorian curriculum
- **Study Modes**: Flashcards (implemented), quizzes (planned), exam simulator (planned)
- **Spaced Repetition**: SM-2 algorithm for optimal retention (database schema ready)
- **Learning Flow**:
  1. **Subject Selection**: Browse subjects with color-coded icons
  2. **Lesson Selection**: View lessons with difficulty badges and estimated duration
  3. **Mode Selection**: Choose between Flashcards, Quiz, or Exam mode
  4. **Learning Session**: Interactive study session with progress tracking
  5. **Session Summary**: Performance feedback with XP rewards and statistics
- **Content Structure**: Subjects → Lessons → Flashcards with front/back content
- **Progress Tracking**: Per-card progress with SM-2 algorithm support

### User Profiles
- **Student Profiles**: Grade level, series (for Lycée), subjects with coefficients
- **Parent Profiles**: Multiple children management, progress monitoring
- **Profile Completion**: Required before accessing main app features

### Gamification (Fully Implemented)
- **XP System**: Earn experience points for study activities
- **Leveling**: Progressive level system with visual badges
- **Achievements**: Rarity-based badges (Common, Rare, Epic, Legendary)
- **Daily Streaks**: Streak tracking with calendar visualization
- **Leaderboards**: Competitive rankings with rank change indicators
- **Reward Animations**: Celebratory animations for milestones

### Social Features
- Study groups
- Leaderboards
- Community engagement

### Payments
- Polar SDK integration for subscriptions
- Multiple pricing tiers

## Localization

- **Language**: French (Ivorian context)
- **Timezone**: Africa/Abidjan
- **Curriculum**: Aligned with Ivorian Ministry of Education
- **Cultural Context**: School calendar awareness, exam preparation focus
