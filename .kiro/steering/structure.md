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
│   ├── auth/              # Authentication components
│   ├── demo/              # Demo/example components
│   ├── gamification/      # Gamification system components
│   │   ├── achievement-badge.tsx
│   │   ├── achievement-showcase.tsx
│   │   ├── gamification-summary.tsx
│   │   ├── leaderboard-widget.tsx
│   │   ├── level-badge.tsx
│   │   ├── reward-animation.tsx
│   │   └── streak-calendar.tsx
│   ├── landing/           # Landing page sections
│   ├── navigation/        # Nav bar, menus
│   ├── onboarding/        # User profile setup
│   │   ├── onboarding-screen.tsx
│   │   ├── parent-profile-form.tsx
│   │   └── student-profile-form.tsx
│   ├── payments/polar/    # Polar payment integration
│   ├── theme/             # Theme provider and toggle
│   └── ui/                # shadcn/ui components
├── core/
│   ├── functions/         # TanStack server functions
│   └── middleware/        # Auth, Polar middleware
├── integrations/
│   └── tanstack-query/    # Query client setup
├── lib/                   # Utilities (auth-client, utils)
├── routes/                # File-based routes
│   ├── _auth/            # Protected routes
│   │   └── app/          # Main app routes (dashboard, lessons, progress, groups)
│   ├── onboarding/       # Profile setup flow
│   └── [public routes]   # Landing, auth, etc.
├── utils/                 # Helper functions (SEO, etc)
├── router.tsx             # Router configuration
├── server.ts              # Server entry point
├── start.tsx              # Client entry point
└── styles.css             # Global Tailwind styles with semantic color utilities
```

## Data Service (`apps/data-service` - package name: `kurama-backend`)

```
src/
├── hono/                  # Hono app setup
└── index.ts               # Worker entry point
```

Note: Currently minimal implementation with basic Hono setup. Durable Objects and Workflows are planned but not yet implemented.

## Data Ops (`packages/data-ops` - package name: `@kurama/data-ops`)

```
src/
├── auth/                  # Better Auth setup
├── config/                # Configuration files (auth.ts)
├── database/              # Database connection setup
├── drizzle/               # Migrations and schemas
│   ├── auth-schema.ts    # Better Auth tables
│   └── schema.ts         # User profiles, curriculum data
├── queries/               # Database queries
│   ├── polar.ts          # Polar payment queries
│   └── profiles.ts       # User profile queries
└── zod-schema/            # Zod validation schemas
    ├── onboarding.ts     # Profile validation
    └── [other schemas]
```

Note: Package exports are structured by functionality:
- `./auth/*` - Authentication utilities
- `./database/*` - Database connection and setup
- `./zod-schema/*` - Validation schemas
- `./queries/*` - Database queries

### Database Schema
- **User Profiles**: Students and parents with grade/series/subjects
- **Curriculum**: Grades, series, subjects with coefficients
- **Auth**: Better Auth tables for authentication
- **Polar**: Payment and subscription data

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

### Recent Implementations
- ✅ **Gamification System**: Complete XP, levels, achievements, streaks, leaderboards
- ✅ **Color System Migration**: All inline colors converted to semantic utilities
- ✅ **User Profiles**: Student/parent profiles with curriculum integration
- ✅ **Onboarding Flow**: Multi-step profile setup with validation
- ✅ **Profile Guard**: Redirect to onboarding if profile incomplete
