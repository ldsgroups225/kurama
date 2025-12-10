---
inclusion: manual
---

# Create New Files

Quick reference for creating components, routes, tests, and other files.

## Create Component

Location: `apps/user-application/src/components/`

```tsx
import { cn } from "@/lib/utils"

interface ComponentNameProps {
  className?: string
}

export function ComponentName({ className }: ComponentNameProps) {
  return (
    <div className={cn("", className)}>
      {/* Use semantic colors: bg-gradient-xp, text-level, etc. */}
    </div>
  )
}
```

See `.kiro/steering/commands/create-component.md` for detailed guide.

## Create Route

Location: `apps/user-application/src/routes/`

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/path")({
  component: PageComponent,
})

function PageComponent() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Page Title</h1>
    </div>
  )
}
```

**Naming**:
- Parent routes: `subjects.index.tsx`
- Dynamic routes: `subjects.$subjectId.tsx`
- Layout routes: `_auth/route.tsx`

See `.kiro/steering/commands/create-route.md` for detailed guide.

## Create Test

Location: Same as source file with `.test.tsx` suffix

```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ComponentName } from "./component-name"

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />)
    expect(screen.getByRole("...")).toBeInTheDocument()
  })
})
```

See `.kiro/steering/commands/create-test.md` for detailed guide.

## Create Server Function

Location: `apps/user-application/src/core/functions/`

```typescript
import { createServerFn } from "@tanstack/react-start"
import { getDb } from "@kurama/data-ops/database/setup"

export const functionName = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    return await db.query.table.findFirst({ where: eq(table.id, data) })
  })
```

**Important**: Call with `{ data: value }` format
```tsx
const result = await functionName({ data: "123" })
```

## Create Zod Schema

Location: `packages/data-ops/src/zod-schema/`

```typescript
import { z } from "zod"

export const schemaName = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  optional: z.string().optional(),
})

export type SchemaType = z.infer<typeof schemaName>
```

## Create Database Schema

Location: `packages/data-ops/src/drizzle/schema.ts`

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const tableName = pgTable("table_name", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

After creating:
1. Generate migration: `pnpm run --filter @kurama/data-ops drizzle:generate`
2. Apply migration: `pnpm run --filter @kurama/data-ops drizzle:migrate`

## Quick Commands

```bash
# Run quality checks
pnpm run check

# Run tests
pnpm test

# Type check
pnpm run typecheck

# Lint and fix
pnpm run lint:fix

# Build shared package
pnpm run build:data-ops
```
