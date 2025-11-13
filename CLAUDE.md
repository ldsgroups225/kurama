# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo SaaS application built with pnpm workspaces, containing:
- **user-application**: TanStack Start frontend application deployed on Cloudflare
- **data-service**: Hono-based API service deployed on Cloudflare Workers
- **@repo/data-ops**: Shared package for auth, database, schemas, and queries

## Commands

### Root Level Commands
- `pnpm run setup` - Install all dependencies and build required packages
- `pnpm run dev:user-application` - Start frontend development server on port 3000
- `pnpm run dev:data-service` - Start backend API service with Cloudflare Workers
- `pnpm run deploy:user-application` - Build and deploy frontend to Cloudflare
- `pnpm run deploy:data-service` - Build and deploy backend service to Cloudflare

### Data Ops Package Commands
- `pnpm run --filter @repo/data-ops build` - Build the data-ops package
- `pnpm run --filter @repo/data-ops drizzle:generate` - Generate database migrations
- `pnpm run --filter @repo/data-ops drizzle:migrate` - Run database migrations
- `pnpm run --filter @repo/data-ops better-auth:generate` - Generate auth schema

### Individual App Development
Navigate to app directories for more commands:
- `cd apps/user-application` - Work with frontend app independently
- `cd apps/data-service` - Work with backend service independently

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
- Tailwind CSS v4 with Shadcn components
- Better Auth for authentication
- Vite for build tooling

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

**Monorepo Dependencies**: The apps depend on the workspace package `@repo/data-ops` which must be built before running applications.

**Database Layer**: Data-ops package provides a unified database interface with support for multiple database providers. Uses Drizzle ORM with auto-generated schema from Better Auth.

**Authentication**: Better Auth is configured across the stack, with auth schema generation and database integration handled in the data-ops package.

**Cloudflare Deployment**: Both applications are designed for Cloudflare deployment (Pages for frontend, Workers for backend) with wrangler configuration.

### Development Workflow

1. Run `pnpm run setup` for initial setup
2. Build data-ops package: `pnpm run build:data-ops`
3. Start development servers individually as needed
4. Use workspace filtering commands for package-specific operations

### Package Manager
Uses pnpm with workspace configuration. All commands should use `pnpm run --filter <package>` for package-specific operations.