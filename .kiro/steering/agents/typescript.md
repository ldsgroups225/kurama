---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx}"
---

# TypeScript Best Practices

## Strict Mode Rules
- No `any` types (use `unknown` or proper types)
- No implicit any
- Strict null checks enabled
- No unchecked indexed access

## Type Patterns

### Component Props
```typescript
interface ComponentProps {
  // Required props
  title: string
  onAction: () => void
  
  // Optional props with defaults
  variant?: "default" | "outline" | "ghost"
  className?: string
  
  // Children
  children?: React.ReactNode
}
```

### Server Function Types
```typescript
// Input type
type GetProfileInput = {
  userId: string
}

// Return type
type ProfileResult = {
  id: string
  name: string
  grade: Grade
} | null
```

### Zod Inference
```typescript
import { z } from "zod"

const schema = z.object({
  name: z.string(),
  age: z.number(),
})

type SchemaType = z.infer<typeof schema>
```

### Drizzle Types
```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { users } from "@kurama/data-ops/drizzle/schema"

type User = InferSelectModel<typeof users>
type NewUser = InferInsertModel<typeof users>
```

## Common Patterns

### Discriminated Unions
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

### Type Guards
```typescript
function isStudent(profile: Profile): profile is StudentProfile {
  return profile.type === "student"
}
```

### Generic Constraints
```typescript
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}
```

## Anti-Patterns

### ❌ Don't Use
```typescript
// any type
const data: any = await fetch()

// Type assertions without validation
const user = data as User

// Non-null assertions without checks
const name = user!.name
```

### ✅ Do Use
```typescript
// Proper typing
const data: unknown = await fetch()

// Type guards
if (isUser(data)) {
  const user = data
}

// Optional chaining
const name = user?.name ?? "Guest"
```

## Path Aliases
```typescript
// Use @/* for src imports
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Use package imports for data-ops
import { getDb } from "@kurama/data-ops/database/setup"
```
