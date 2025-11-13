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
- **Features**: Durable Objects, Workflows

## Shared (data-ops)
- **Database**: Drizzle ORM (supports Neon, PlanetScale, SQLite)
- **Auth**: Better Auth with Polar integration
- **Validation**: Zod schemas
- **Build**: TypeScript with tsc-alias for path resolution

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
pnpm run dev:user-application  # Start user app on port 3000
pnpm run dev:data-service      # Start data service
```

### Build
```bash
pnpm run build:data-ops  # Build shared package
```

### Deployment
```bash
pnpm run deploy:user-application  # Deploy user app to Cloudflare
pnpm run deploy:data-service      # Deploy data service to Cloudflare
```

### Database (in data-ops)
```bash
pnpm run better-auth:generate  # Generate auth schema
pnpm run drizzle:generate      # Generate migrations
pnpm run drizzle:migrate       # Run migrations
```

### Type Generation
```bash
pnpm run cf-typegen  # Generate Cloudflare types
```
