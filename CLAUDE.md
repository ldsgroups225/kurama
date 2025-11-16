# CLAUDE.md

Guidance for working with Kurama - an offline-first PWA study platform for BEPC/BAC students in Côte d'Ivoire.

## Project Overview

**Kurama** is a monorepo SaaS application with three main packages:
- **kurama-frontend** (`apps/user-application`): TanStack Start frontend on Cloudflare Pages
- **kurama-backend** (`apps/data-service`): Hono API on Cloudflare Workers
- **@kurama/data-ops** (`packages/data-ops`): Shared auth, database, schemas, queries

**Status**: Production-ready with core features fully implemented.

## Quick Start

```bash
pnpm run setup                    # Install deps + build data-ops
pnpm run dev:kurama-frontend      # Frontend on port 3000
pnpm run dev:kurama-backend       # Backend with Cloudflare Workers
```

## Essential Commands

### Root Level
```bash
pnpm run setup                    # Initial setup
pnpm run build:data-ops           # Build shared package (required before apps)
pnpm run dev:kurama-frontend      # Start frontend
pnpm run dev:kurama-backend       # Start backend
pnpm run deploy:kurama-frontend   # Deploy to Cloudflare Pages
pnpm run deploy:kurama-backend    # Deploy to Cloudflare Workers
pnpm test                         # Run all tests
pnpm run typecheck                # Type checking
```

### Frontend (`apps/user-application`)
```bash
pnpm dev                          # Dev server on port 3000
pnpm build                        # Production build
pnpm deploy                       # Build and deploy
pnpm test                         # Run tests
pnpm run perf:check-bundles       # Check bundle sizes
```

### Backend (`apps/data-service`)
```bash
pnpm dev                          # Dev with Cloudflare Workers
pnpm deploy                       # Deploy to Workers
pnpm test                         # Run tests
```

### Data Ops (`packages/data-ops`)
```bash
pnpm build                        # Build package
pnpm run drizzle:generate         # Generate migrations
pnpm run drizzle:migrate          # Apply migrations
pnpm run seed:full                # Seed all data
pnpm run better-auth:generate     # Generate auth schema
```

## Architecture

### Tech Stack

**Frontend**:
- TanStack Start 1.133.22 (React 19 SSR framework)
- TanStack Router 1.133.22 (file-based routing)
- TanStack Query 5.90.9 (server state management)
- Tailwind CSS v4 (semantic color system)
- shadcn/ui (Radix UI components)
- Better Auth 1.3.29 (email OTP + Google OAuth)
- Polar SDK 0.34.17 (payments)
- Workbox (PWA/service workers)
- Dexie (IndexedDB for offline)

**Backend**:
- Hono 4.8.3 (web framework)
- Cloudflare Workers (runtime)
- Vitest (testing)

**Shared**:
- Drizzle ORM 0.44.5 (PostgreSQL/MySQL/SQLite)
- Better Auth 1.3.7 (authentication)
- Zod 4.1.0 (validation)

### Key Patterns

**Monorepo**: pnpm workspaces with workspace filtering
- Package names: `kurama-frontend`, `kurama-backend`, `@kurama/data-ops`
- Build data-ops before running apps
- Use `pnpm run --filter <package>` for package-specific commands

**Frontend Architecture**:
- File-based routing in `src/routes/`
- Server functions in `src/core/functions/`
- Middleware in `src/core/middleware/`
- Components organized by feature
- Semantic color utilities (no inline colors)

**Database**:
- Drizzle ORM with migrations
- Better Auth for authentication
- 13 grades, 4 series, 12 subjects
- 17+ lessons, 61+ flashcards (seeded)

**Deployment**:
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- CI/CD: GitHub Actions
- URLs: https://kurama.yeko.workers.dev (frontend), https://back-kurama.yeko.workers.dev (backend)

## Core Features

✅ **Learning System**: Subject → Lesson → Mode → Session → Summary flow
✅ **Gamification**: XP, levels, achievements, streaks, leaderboards
✅ **Authentication**: Email OTP + Google OAuth
✅ **User Profiles**: Student/parent with curriculum integration
✅ **PWA**: Offline-first with service workers
✅ **Payments**: Polar SDK integration
✅ **Database**: Curriculum + user data with SM-2 spaced repetition

## Important Notes

- **Server Functions**: Call with `{ data: value }` format when using input validators
- **Routes**: Use `.index.tsx` for parent routes with children
- **Colors**: Use semantic utilities (e.g., `bg-gradient-level`, `text-subject-math`)
- **TypeScript**: Strict mode, no `any` types
- **Testing**: Vitest with Testing Library
- **Build**: Always build data-ops before running apps

## Steering Files

Comprehensive guidance available in `.kiro/steering/`:
- `tech.md` - Tech stack and commands
- `structure.md` - Project structure
- `product.md` - Features and status
- `conventions.md` - Code standards
- `mcp-usage.md` - MCP tools
- `learning-flow.md` - Learning system details
- `deployment.md` - Infrastructure and deployment

## Resources

- [TanStack Start](https://tanstack.com/start)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Hono](https://hono.dev)
