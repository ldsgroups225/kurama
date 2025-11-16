# Project Structure

## Monorepo Layout

```
/
├── apps/                    # Application workspaces
│   ├── user-application/    # Frontend app (TanStack Start)
│   └── data-service/        # Backend API (Hono)
├── packages/                # Shared packages
│   └── data-ops/           # Auth, DB, schemas, queries
└── [root configs]          # Workspace-level configs
```

## User Application (`apps/user-application` - package name: `kurama-frontend`)

```
src/
├── components/
│   ├── auth/              # Authentication (email OTP, Google OAuth)
│   ├── gamification/      # XP, levels, achievements, streaks, leaderboards
│   ├── learning/          # Flashcards, quiz, exam modes
│   ├── onboarding/        # Student/parent profile setup
│   ├── payments/polar/    # Polar SDK integration
│   ├── pwa/               # Offline, sync, install prompts
│   ├── landing/           # Landing page sections
│   ├── layout/            # Header, sidebar
│   ├── main/              # Dashboard components
│   ├── navigation/        # Navigation bar
│   ├── theme/             # Theme provider, toggle
│   ├── ui/                # shadcn/ui components
│   └── skeletons/         # Loading skeletons
├── core/
│   ├── functions/         # Server functions (profile, learning, payments)
│   └── middleware/        # Auth, Polar middleware
├── hooks/                 # Custom hooks (auth, offline, swipe, etc.)
├── integrations/
│   └── tanstack-query/    # Query client, context, devtools
├── lib/                   # Utilities (auth-client, db, spaced-repetition, PWA)
├── routes/                # File-based routing
│   ├── __root.tsx         # Root layout with theme provider
│   ├── index.tsx          # Landing page
│   ├── onboarding.tsx     # Profile setup flow
│   ├── api/
│   │   ├── auth.$.tsx     # Better Auth API routes
│   │   └── metrics.tsx    # Metrics endpoint
│   └── _auth/             # Protected routes (auth guard)
│       ├── route.tsx      # Auth guard wrapper
│       └── app/
│           ├── index.tsx              # Dashboard
│           ├── subjects.index.tsx     # Subject selection
│           ├── subjects.$subjectId.tsx # Lessons for subject
│           ├── lessons.$lessonId.tsx   # Mode selection
│           ├── lesson-session.$lessonId.tsx  # Active session
│           ├── lesson-summary.$lessonId.tsx  # Results
│           ├── progress.tsx           # Progress tracking
│           ├── groups.tsx             # Study groups
│           └── profile.tsx            # User profile
├── config/                # Performance budgets
├── utils/                 # Helpers (SEO, UUID, etc.)
├── test/                  # Test setup
├── router.tsx             # Router configuration
├── server.ts              # Custom server entry (Cloudflare)
├── start.tsx              # Client entry point
├── sw.ts                  # Service worker
└── styles.css             # Global Tailwind + semantic colors
```

## Data Service (`apps/data-service` - package name: `kurama-backend`)

```
src/
├── hono/
│   ├── app.ts             # Hono app setup with routes
│   └── app.test.ts        # Hono tests
├── durable-objects/       # Cloudflare Durable Objects (planned)
├── workflows/             # Cloudflare Workflows (planned)
└── index.ts               # Worker entry point
```

**Status**: Minimal implementation with basic Hono setup. Durable Objects and Workflows planned for future releases.

## Data Ops (`packages/data-ops` - package name: `@kurama/data-ops`)

```
src/
├── auth/
│   ├── setup.ts           # Better Auth configuration
│   └── server.ts          # Server-side auth utilities
├── config/
│   └── auth.ts            # Auth configuration
├── database/
│   ├── setup.ts           # Database connection
│   ├── seed-db.ts         # Base curriculum seeding
│   ├── seed-lessons.ts    # Core lessons seeding
│   └── seed-lessons-extended.ts  # Extended lessons
├── drizzle/
│   ├── schema.ts          # All database tables
│   ├── auth-schema.ts     # Better Auth tables (auto-generated)
│   ├── seed.ts            # Seed utilities
│   └── migrations/        # Database migrations
├── queries/
│   ├── polar.ts           # Polar payment queries
│   └── profiles.ts        # User profile queries
└── zod-schema/
    ├── profile.ts         # Profile validation
    ├── polar.ts           # Payment validation
    └── example.ts         # Example schemas
```

**Package Exports** (structured by feature):
```typescript
import { authClient } from "@kurama/data-ops/auth/client"
import { getDb } from "@kurama/data-ops/database/setup"
import { grades, subjects, lessons } from "@kurama/data-ops/drizzle/schema"
import { studentProfileSchema } from "@kurama/data-ops/zod-schema/profile"
```

### Database Schema

**Educational Structure**:
- `grades`: 13 levels (CP1-Tle)
- `series`: 4 Lycée series (A, C, D, E)
- `subjects`: 12 core subjects
- `levelSeries`: Grade-series mappings
- `subjectOfferings`: Subject availability with coefficients

**Content**:
- `lessons`: Educational lessons with metadata
- `cards`: Flashcards for spaced repetition

**User Data**:
- `userProfiles`: Student/parent profiles
- `userProgress`: SM-2 spaced repetition progress
- `studySessions`: Learning session tracking

**Authentication** (Better Auth):
- `auth_user`, `auth_session`, `auth_account`

**Payments**:
- Polar integration tables

## Key Conventions

### Import Aliases
- `@/*` resolves to `src/*` in user-application
- Use workspace protocol for internal packages: `@kurama/data-ops`
- Package names: `kurama-frontend`, `kurama-backend`, `@kurama/data-ops`

### Component Organization
- UI components from shadcn/ui go in `components/ui/`
- Feature-specific components in named folders (auth, payments, etc)
- Export via index.ts barrel files where appropriate

### Server Functions
- Located in `core/functions/`
- Use TanStack Start server function patterns
- Middleware in `core/middleware/`

### Routing
- File-based routing via TanStack Router
- Routes auto-generated in `routeTree.gen.ts`
- Route files in `src/routes/`
- **Important**: For routes with children, use `.index.tsx` for the parent route
  - Example: `subjects.index.tsx` (parent) + `subjects.$subjectId.tsx` (child)
  - This prevents the parent from becoming a layout route
- Dynamic routes use `$paramName` syntax (e.g., `$subjectId`, `$lessonId`)

### Configuration Files
- `wrangler.jsonc` for Cloudflare Workers config (both apps)
- `components.json` for shadcn/ui configuration
- `vite.config.ts` for build configuration (with Cloudflare plugin)
- `drizzle.config.ts` for database configuration
- Path aliases defined in `tsconfig.json`

### Styling
- Tailwind CSS v4 with CSS variables and Vite plugin
- Base color: zinc
- Style variant: New York (shadcn/ui)
- Global styles in `src/styles.css`
- Shadcn components configured with CSS variables enabled
- **Semantic Color System**: All colors use utility classes (no inline colors)
  - Gamification: `bg-gradient-xp`, `bg-gradient-level`, `bg-gradient-streak`, etc.
  - Status: `bg-success`, `bg-error`, `bg-warning`, `bg-info`
  - Subjects: `text-subject-math`, `text-subject-physics`, etc.
  - Supports light/dark themes automatically

### Environment
- `.env` files for local development
- Environment variables via Cloudflare Workers bindings
- Database connections support: Neon, PlanetScale, SQLite
- Google OAuth integration for authentication

### Testing Setup
- Frontend: Vitest with Testing Library and React Testing Library
- Backend: Vitest with Cloudflare Workers pool testing
- Both apps use Vitest as the test runner

### Development Workflow
1. Run `pnpm run setup` for initial dependency installation
2. Build data-ops package: `pnpm run build:data-ops` (required before running apps)
3. Start development servers using individual app commands
4. Use workspace filtering for package-specific operations

### Implementation Status

**✅ Completed**:
- Gamification system (XP, levels, achievements, streaks, leaderboards)
- Semantic color system (all inline colors migrated)
- User profiles (student/parent with curriculum)
- Onboarding flow (multi-step profile setup)
- Profile guard (redirect if incomplete)
- Learning flow (subject → lesson → mode → session → summary)
- Authentication (email OTP + Google OAuth)
- PWA capabilities (offline-first, service workers)
- Payment integration (Polar SDK)
- Database schema (curriculum + user data)
- Deployment (Cloudflare Pages + Workers)

**🔄 Planned**:
- Durable Objects (real-time features)
- Cloudflare Workflows (background jobs)
- Quiz mode (multiple choice)
- Exam mode (timed simulation)
- Advanced analytics
- Social features (messaging)
