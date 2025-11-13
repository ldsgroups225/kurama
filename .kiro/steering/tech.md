# Tech Stack

## Build System
- **Package Manager**: pnpm (v10.22.0+)
- **Monorepo**: pnpm workspaces with apps and packages
- **Build Tool**: Vite (for user-application), TypeScript compiler (for data-ops)
- **Deployment**: Cloudflare Workers via Wrangler

## Frontend (user-application)
- **Framework**: TanStack Start (React-based SSR framework)
- **Router**: TanStack Router with file-based routing
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **UI Library**: Radix UI primitives
- **Icons**: Lucide React
- **Auth**: Better Auth with Google OAuth
- **Payments**: Polar SDK

## Backend (data-service)
- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Testing**: Vitest with Cloudflare Workers pool

## Shared (data-ops)
- **Database**: Drizzle ORM (supports Neon, PlanetScale, SQLite)
- **Auth**: Better Auth with Polar and Google OAuth integration
- **Validation**: Zod schemas
- **Build**: TypeScript with tsc-alias for path resolution
- **Package Exports**: Structured exports for auth/, database/, zod-schema/, queries/

## TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler
- Path aliases: `@/*` maps to `src/*`
- Target: ES2022

## Common Commands

### Setup
```bash
pnpm run setup  # Install deps and build data-ops
```

### Development
```bash
pnpm run dev:kurama-frontend  # Start user app on port 3000
pnpm run dev:kurama-backend   # Start data service
```

### Build
```bash
pnpm run build:data-ops  # Build shared package (required before running apps)
```

### Deployment
```bash
pnpm run deploy:kurama-frontend  # Deploy user app to Cloudflare Pages
pnpm run deploy:kurama-backend   # Deploy data service to Cloudflare Workers
```

### Testing
```bash
# Frontend testing (in apps/user-application)
pnpm test  # Vitest with Testing Library

# Backend testing (in apps/data-service)
pnpm test  # Vitest with Cloudflare Workers pool
```

### Database (in data-ops)
```bash
pnpm run better-auth:generate  # Generate auth schema
pnpm run drizzle:generate      # Generate migrations
pnpm run drizzle:migrate       # Run migrations
```

### Type Generation
```bash
# Frontend (in apps/user-application)
pnpm run cf-typegen  # Generate Cloudflare types

# Backend (in apps/data-service)
pnpm run cf-typegen  # Generate Cloudflare types
```
