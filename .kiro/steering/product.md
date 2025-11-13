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
