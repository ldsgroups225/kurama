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

## User Application (`apps/user-application`)

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── demo/              # Demo/example components
│   ├── landing/           # Landing page sections
│   ├── navigation/        # Nav bar, menus
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
├── utils/                 # Helper functions (SEO, etc)
├── router.tsx             # Router configuration
├── server.ts              # Server entry point
├── start.tsx              # Client entry point
└── styles.css             # Global Tailwind styles
```

## Data Service (`apps/data-service`)

```
src/
├── durable-objects/       # Cloudflare Durable Objects
├── hono/                  # Hono app setup
├── workflows/             # Cloudflare Workflows
└── index.ts               # Worker entry point
```

## Data Ops (`packages/data-ops`)

```
src/
├── auth/                  # Better Auth setup
├── database/              # Database connection setup
├── drizzle/               # Migrations and schemas
├── queries/               # Database queries (Polar, etc)
└── zod-schema/            # Zod validation schemas
```

## Key Conventions

### Import Aliases
- `@/*` resolves to `src/*` in user-application
- Use workspace protocol for internal packages: `@repo/data-ops`

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
- `wrangler.jsonc` for Cloudflare Workers config
- `components.json` for shadcn/ui configuration
- `vite.config.ts` for build configuration
- Path aliases defined in `tsconfig.json`

### Styling
- Tailwind CSS v4 with CSS variables
- Base color: zinc
- Style variant: New York (shadcn/ui)
- Global styles in `src/styles.css`

### Environment
- `.env` files for local development
- Environment variables via Cloudflare Workers bindings
- Type-safe env via `worker-configuration.d.ts`
