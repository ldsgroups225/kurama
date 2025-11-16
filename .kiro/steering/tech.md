# Tech Stack

## Build System
- **Package Manager**: pnpm (v10.22.0+)
- **Monorepo**: pnpm workspaces with apps and packages
- **Build Tool**: Vite (for user-application), TypeScript compiler (for data-ops)
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (backend)

## Frontend (user-application / kurama-frontend)
- **Framework**: TanStack Start 1.133.22 (React 19 + TypeScript SSR)
- **Router**: TanStack Router 1.133.22 with file-based routing
- **State Management**: TanStack Query 5.90.9 with SSR integration
- **Styling**: Tailwind CSS v4 with CSS variables, shadcn/ui (New York style)
- **UI Library**: Radix UI primitives
- **Icons**: Lucide React
- **Auth**: Better Auth 1.3.29 with Google OAuth
- **Payments**: Polar SDK 0.34.17
- **PWA**: Workbox for service workers, Dexie for IndexedDB
- **Animations**: Motion (Motion One)
- **Testing**: Vitest with Testing Library

## Backend (data-service / kurama-backend)
- **Framework**: Hono 4.8.3
- **Runtime**: Cloudflare Workers
- **Testing**: Vitest with Cloudflare Workers pool
- **Planned**: Durable Objects, Cloudflare Workflows

## Shared (data-ops / @kurama/data-ops)
- **Database**: Drizzle ORM 0.44.5 (Neon, PlanetScale, SQLite)
- **Auth**: Better Auth 1.3.7 with Polar integration
- **Validation**: Zod 4.1.0
- **Build**: TypeScript with tsc-alias for path resolution
- **Exports**: Structured by feature (auth/, database/, drizzle/, queries/, zod-schema/)

## TypeScript Configuration
- Strict mode enabled, no `any` types
- Module resolution: bundler
- Path aliases: `@/*` → `src/*`
- Target: ES2022

## Essential Commands

### Initial Setup
```bash
pnpm run setup                    # Install deps + build data-ops
pnpm run build:data-ops           # Build shared package (required before apps)
```

### Development
```bash
pnpm run dev:kurama-frontend      # Frontend on port 3000
pnpm run dev:kurama-backend       # Backend with Cloudflare Workers
```

### Deployment
```bash
pnpm run deploy:kurama-frontend   # Deploy to Cloudflare Pages
pnpm run deploy:kurama-backend    # Deploy to Cloudflare Workers
```

### Database Operations
```bash
pnpm run --filter @kurama/data-ops drizzle:generate
pnpm run --filter @kurama/data-ops drizzle:migrate
pnpm run --filter @kurama/data-ops seed:full
pnpm run --filter @kurama/data-ops better-auth:generate
```

### Testing & Quality
```bash
pnpm test                         # Run all tests
pnpm run typecheck                # Type checking
pnpm run lint:fix                 # Fix linting issues
pnpm run perf:check-bundles       # Check bundle sizes
```

### Type Generation
```bash
pnpm run cf-typegen               # Generate Cloudflare types (both apps)
```
