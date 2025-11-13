# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo SaaS application built with pnpm workspaces, containing:
- **user-application**: TanStack Start frontend application deployed on Cloudflare
- **data-service**: Hono-based API service deployed on Cloudflare Workers
- **@kurama/data-ops**: Shared package for auth, database, schemas, and queries

## Commands

### Root Level Commands
- `pnpm run setup` - Install all dependencies and build required packages
- `pnpm run build:data-ops` - Build the shared data-ops package (required before running apps)
- `pnpm run dev:kurama-frontend` - Start frontend development server on port 3000
- `pnpm run dev:kurama-backend` - Start backend API service with Cloudflare Workers
- `pnpm run deploy:kurama-frontend` - Build and deploy frontend to Cloudflare Pages
- `pnpm run deploy:kurama-backend` - Build and deploy backend service to Cloudflare Workers

### User Application (Frontend) Commands
Navigate to `apps/user-application`:
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production (wrangler-compatible output)
- `pnpm deploy` - Build and deploy to Cloudflare Pages
- `pnpm serve` - Preview production build
- `pnpm cf-typegen` - Generate Cloudflare types
- `pnpm test` - Run tests with Vitest (uses Testing Library)

### Data Service (Backend) Commands
Navigate to `apps/data-service`:
- `pnpm dev` - Start development server with Cloudflare Workers
- `pnpm start` - Start local development server
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm test` - Run tests with Vitest (Cloudflare Workers pool)
- `pnpm cf-typegen` - Generate Cloudflare types

### Data Ops Package Commands
Navigate to `packages/data-ops`:
- `pnpm build` - Compile TypeScript to dist/ with path aliases
- `pnpm drizzle:generate` - Generate database migrations
- `pnpm drizzle:migrate` - Run database migrations
- `pnpm drizzle:pull` - Pull database schema
- `pnpm better-auth:generate` - Generate Better Auth schema

## Architecture

### Monorepo Structure
- `apps/user-application` - TanStack Start frontend (React 19, TypeScript, Tailwind CSS v4)
- `apps/data-service` - Hono API service (Cloudflare Workers)
- `packages/data-ops` - Shared utilities (auth, database, zod schemas, queries)

### Tech Stack

**Frontend (user-application)**:
- TanStack Start - Full-stack React framework with file-based routing
- React 19 with TypeScript
- TanStack Router & Query with SSR integration
- Tailwind CSS v4 with Shadcn components (new-york style, zinc theme)
- Better Auth for authentication with Google OAuth
- Vite for build tooling with Cloudflare plugin
- Polar SDK for payment and subscription management

**Backend (data-service)**:
- Hono web framework for Cloudflare Workers
- TypeScript
- Shared data-ops package for database operations

**Shared (data-ops)**:
- Drizzle ORM with PostgreSQL
- Better Auth integration
- Zod for schema validation
- Multiple database adapters (Neon, Planetscale, SQLite)

### Key Architectural Patterns

**Monorepo Dependencies**: The apps depend on the workspace package `@kurama/data-ops` which must be built before running applications.

**Database Layer**: Data-ops package provides a unified database interface with support for multiple database providers. Uses Drizzle ORM with auto-generated schema from Better Auth.

**Authentication**: Better Auth is configured across the stack, with auth schema generation and database integration handled in the data-ops package. Includes Google OAuth integration.

**Cloudflare Deployment**: Both applications are designed for Cloudflare deployment (Pages for frontend, Workers for backend) with wrangler configuration.

**TanStack Start Architecture**: Frontend uses file-based routing with SSR integration:
- `src/routes/` - Auto-generates route tree from file system
- `src/router.tsx` - Router setup with TanStack Query SSR integration
- `src/routes/__root.tsx` - Root layout with theme provider and SEO
- `src/server.ts` - Custom server with Better Auth integration
- Path aliases: `@/*` maps to `src/*`

### Development Workflow

1. Run `pnpm run setup` for initial setup
2. Build data-ops package: `pnpm run build:data-ops`
3. Start development servers individually as needed
4. Use workspace filtering commands for package-specific operations

### Testing
- **Frontend**: Vitest with Testing Library and React Testing Library
- **Backend**: Vitest with Cloudflare Workers pool testing
- Both applications use Vitest as the test runner

### Package Manager
Uses pnpm workspace configuration. Key points:
- Package names: `kurama-frontend`, `kurama-backend`, `@kurama/data-ops`
- Use workspace filtering: `pnpm run --filter <package-name>` for package-specific operations
- The data-ops package must be built before running applications due to workspace dependencies