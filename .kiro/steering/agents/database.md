---
inclusion: fileMatch
fileMatchPattern: "packages/data-ops/**/*.{ts,sql}"
---

# Database & Data Operations Guide

## Drizzle ORM Patterns

### Schema Definition
```typescript
import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  sessions: many(sessions),
}))
```

### Query Patterns
```typescript
// Simple query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
})

// With relations
const profile = await db.query.userProfiles.findFirst({
  where: eq(userProfiles.userId, userId),
  with: {
    grade: true,
    series: true,
    subjects: { with: { subject: true } },
  },
})

// Insert with returning
const [newUser] = await db.insert(users)
  .values({ id: generateId(), email, name })
  .returning()

// Update
await db.update(users)
  .set({ name: newName, updatedAt: new Date() })
  .where(eq(users.id, userId))

// Transaction
await db.transaction(async (tx) => {
  await tx.insert(profiles).values(profileData)
  await tx.update(users).set({ hasProfile: true }).where(eq(users.id, userId))
})
```

## Database Commands
```bash
# Generate migrations
pnpm run --filter @kurama/data-ops drizzle:generate

# Apply migrations
pnpm run --filter @kurama/data-ops drizzle:migrate

# Seed database
pnpm run --filter @kurama/data-ops seed:full

# Generate Better Auth schema
pnpm run --filter @kurama/data-ops better-auth:generate
```

## Schema Structure

### Educational Tables
- `grades`: 13 levels (CP1-Tle)
- `series`: 4 Lycée series (A, C, D, E)
- `subjects`: 12 core subjects
- `lessons`: Educational content
- `cards`: Flashcards for SM-2

### User Tables
- `userProfiles`: Student/parent profiles
- `userProgress`: SM-2 spaced repetition
- `studySessions`: Learning tracking

### Auth Tables (Better Auth)
- `auth_user`, `auth_session`, `auth_account`

## Zod Validation
```typescript
import { z } from "zod"

export const studentProfileSchema = z.object({
  gradeId: z.string().min(1, "Grade requis"),
  seriesId: z.string().optional(),
  subjects: z.array(z.object({
    subjectId: z.string(),
    coefficient: z.number().min(1).max(10),
  })).min(1, "Au moins une matière requise"),
})

export type StudentProfile = z.infer<typeof studentProfileSchema>
```

## Package Exports
```typescript
// Auth
import { authClient } from "@kurama/data-ops/auth/client"
import { auth } from "@kurama/data-ops/auth/setup"

// Database
import { getDb } from "@kurama/data-ops/database/setup"

// Schema
import { users, profiles, lessons } from "@kurama/data-ops/drizzle/schema"

// Validation
import { studentProfileSchema } from "@kurama/data-ops/zod-schema/profile"
```

## Best Practices
- Always use transactions for multi-table operations
- Index frequently queried columns
- Use `returning()` for insert/update when you need the result
- Validate input with Zod before database operations
- Handle errors gracefully with try-catch
