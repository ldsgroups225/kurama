# @kurama/data-ops

Shared data operations package for Kurama - authentication, database, schemas, and queries.

## Overview

This package provides:
- **Authentication**: Better Auth setup with Google OAuth and Polar integration
- **Database**: Drizzle ORM with support for Neon, PlanetScale, and SQLite
- **Schemas**: Zod validation schemas for all data types
- **Queries**: Reusable database queries
- **Seeding**: Educational content seeding scripts

## Package Structure

```
src/
├── auth/              # Better Auth configuration
├── config/            # Configuration files
├── database/          # Database connection and seeding
├── drizzle/           # Database schemas and migrations
├── queries/           # Database queries
└── zod-schema/        # Zod validation schemas
```

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file:

```env
DATABASE_HOST=your-database-host
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
```

### 3. Setup Database

Run the automated setup script:

```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

Or manually:

```bash
# Run migrations
pnpm run drizzle:migrate

# Seed base data
pnpm run seed

# Seed lessons
pnpm run seed:lessons
pnpm run seed:lessons:extended
```

## Available Scripts

### Build
```bash
pnpm run build          # Build TypeScript to dist/
```

### Database Migrations
```bash
pnpm run drizzle:generate   # Generate migrations from schema
pnpm run drizzle:migrate    # Apply migrations to database
pnpm run drizzle:pull       # Pull schema from database
```

### Seeding
```bash
pnpm run seed                    # Base curriculum (grades, series, subjects)
pnpm run seed:lessons            # Core lessons (Math, French, English, Physics)
pnpm run seed:lessons:extended   # Extended lessons (SVT, History, etc.)
pnpm run seed:all                # Base + core lessons
pnpm run seed:full               # Everything (base + all lessons)
```

### Authentication
```bash
pnpm run better-auth:generate   # Generate auth schema
```

### Type Checking
```bash
pnpm run typecheck              # Check TypeScript types
```

## Database Schema

### Educational Structure
- **grades**: 13 grade levels (CP1 to Tle)
- **series**: 4 Lycée series (A, C, D, E)
- **subjects**: 12 core subjects
- **levelSeries**: Grade-series mappings
- **subjectOfferings**: Subject availability by grade/series with coefficients

### Content
- **lessons**: Educational lessons with metadata
- **cards**: Flashcards for spaced repetition learning

### User Data
- **userProfiles**: Student and parent profiles
- **userProgress**: SM-2 spaced repetition progress
- **studySessions**: Learning session tracking

### Authentication
- **auth_user**: Better Auth user table
- **auth_session**: Session management
- **auth_account**: OAuth accounts

## Package Exports

The package uses structured exports:

```typescript
// Authentication
import { authClient } from "@kurama/data-ops/auth/client"
import { auth } from "@kurama/data-ops/auth/setup"

// Database
import { getDb } from "@kurama/data-ops/database/setup"
import { eq, and, or } from "@kurama/data-ops/database/drizzle-orm"

// Schemas
import { grades, subjects, lessons } from "@kurama/data-ops/drizzle/schema"

// Validation
import { studentProfileSchema } from "@kurama/data-ops/zod-schema/profile"

// Queries
import { getUserProfile } from "@kurama/data-ops/queries/profiles"
```

## Seeded Content

After running all seeds, you'll have:

- **13 Grades**: CP1, CP2, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Tle
- **4 Series**: A (Littéraire), C (Scientifique), D (Sciences Expérimentales), E (Économique)
- **12 Subjects**: Math, French, English, Physics-Chemistry, SVT, History-Geography, Philosophy, Civic Education, Spanish, German, Economics, Accounting
- **17 Lessons**: Across 9 subjects
- **61 Flashcards**: Ready for learning sessions

See `SEED_CONTENT.md` for detailed content breakdown.

## Development

### Adding New Migrations

1. Modify schema in `src/drizzle/schema.ts`
2. Generate migration: `pnpm run drizzle:generate`
3. Review migration in `drizzle/` folder
4. Apply migration: `pnpm run drizzle:migrate`

### Adding New Lessons

1. Edit `src/database/seed-lessons.ts` or `seed-lessons-extended.ts`
2. Add lesson data following the existing pattern
3. Run seed: `pnpm run seed:lessons` or `pnpm run seed:lessons:extended`

See `SEEDING.md` for detailed instructions.

### Adding New Queries

1. Create file in `src/queries/`
2. Export query functions
3. Update package exports in `package.json` if needed

## Database Support

### Neon (PostgreSQL)
```typescript
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)
```

### PlanetScale (MySQL)
```typescript
import { connect } from "@planetscale/database"
import { drizzle } from "drizzle-orm/planetscale-serverless"

const connection = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
})
const db = drizzle(connection)
```

### SQLite (Local Development)
```typescript
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

const sqlite = new Database("kurama.db")
const db = drizzle(sqlite)
```

## Authentication

Better Auth is configured with:
- **Email OTP**: 6-digit code with 5-minute expiration
- **Google OAuth**: Social authentication
- **Polar Integration**: Payment and subscription management

## Type Safety

All database operations are fully typed:

```typescript
import type { SelectLesson, InsertLesson } from "@kurama/data-ops/drizzle/schema"

// Type-safe insert
const newLesson: InsertLesson = {
  subjectId: 1,
  title: "New Lesson",
  description: "Description",
  difficulty: "medium",
  estimatedDuration: 45,
  isPublished: true,
}

// Type-safe query result
const lesson: SelectLesson = await db.query.lessons.findFirst({
  where: eq(lessons.id, 1),
})
```

## Documentation

- `SEEDING.md` - Comprehensive seeding guide
- `SEED_CONTENT.md` - Complete content reference
- `scripts/setup-database.sh` - Automated setup script

## Troubleshooting

### Connection Errors
- Verify `.env` file exists and has correct credentials
- Check database is accessible from your network
- Test connection manually

### Migration Errors
- Ensure database is empty for first migration
- Check for conflicting schema changes
- Review migration SQL before applying

### Seeding Errors
- Run base seed before lesson seeds
- Check subject abbreviations match exactly
- Verify database has required tables

## Contributing

When contributing to this package:

1. Follow existing code structure
2. Add TypeScript types for all exports
3. Update documentation
4. Test with all supported databases
5. Run type checking: `pnpm run typecheck`

## License

MIT
