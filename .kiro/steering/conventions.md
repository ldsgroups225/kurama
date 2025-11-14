# Coding Conventions & Best Practices

## General Principles

### Code Style
- **TypeScript**: Strict mode enabled, no `any` types
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Imports**: Absolute imports using `@/*` alias
- **Exports**: Named exports preferred over default exports (except for routes)

### Component Structure
```tsx
// 1. Imports (external, then internal)
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false)
  
  // 5. Handlers
  const handleClick = () => {
    setState(true)
    onAction?.()
  }
  
  // 6. Render
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action</Button>
    </div>
  )
}
```

## Styling Conventions

### Use Semantic Color Utilities
**DO:**
```tsx
<div className="bg-gradient-level text-level">
  <div className="bg-success text-success">Success</div>
</div>
```

**DON'T:**
```tsx
<div className="bg-gradient-to-br from-amber-400 to-orange-500 text-amber-500">
  <div className="bg-green-500/10 text-green-600">Success</div>
</div>
```

### Available Color Utilities

#### Gamification
- XP: `bg-gradient-xp`, `bg-gradient-xp-horizontal`, `text-xp`, `bg-xp`
- Level: `bg-gradient-level`, `bg-gradient-level-horizontal`, `text-level`, `bg-level`
- Streak: `bg-gradient-streak`, `bg-gradient-streak-horizontal`, `text-streak`, `bg-streak`
- Rare: `bg-gradient-rare`, `bg-gradient-rare-horizontal`, `text-rare`, `bg-rare`
- Epic: `bg-gradient-epic`, `bg-gradient-epic-horizontal`, `text-epic`, `bg-epic`
- Legendary: `bg-gradient-legendary`, `bg-gradient-legendary-horizontal`, `text-legendary`, `bg-legendary`
- Common: `bg-gradient-common`, `bg-gradient-common-horizontal`

#### Status
- Success: `bg-gradient-success`, `bg-success`, `text-success`
- Warning: `bg-gradient-warning`, `bg-warning`, `text-warning`
- Error: `bg-gradient-error`, `bg-error`, `text-error`
- Info: `bg-gradient-info`, `bg-info`, `text-info`

#### Subjects
- Math: `text-subject-math`, `bg-subject-math`
- Physics: `text-subject-physics`, `bg-subject-physics`
- English: `text-subject-english`, `bg-subject-english`
- French: `text-subject-french`, `bg-subject-french`
- History: `text-subject-history`, `bg-subject-history`
- Philosophy: `text-subject-philosophy`, `bg-subject-philosophy`

### Responsive Design
```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
</div>
```

## Data Fetching

### TanStack Query Patterns
```tsx
// In component
const { data, isLoading, error } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => getProfile(userId),
})

// Server function (in core/functions/)
export const getProfile = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    })
    return profile
  })
```

### Loading States
```tsx
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />

return <Content data={data} />
```

## Form Handling

### Zod Validation
```tsx
// Define schema in data-ops
export const studentProfileSchema = z.object({
  gradeId: z.string().min(1, "Grade is required"),
  seriesId: z.string().optional(),
  subjects: z.array(z.object({
    subjectId: z.string(),
    coefficient: z.number(),
  })),
})

// Use in component
const form = useForm({
  resolver: zodResolver(studentProfileSchema),
  defaultValues: { /* ... */ },
})
```

### Form Submission
```tsx
const onSubmit = async (data: StudentProfile) => {
  try {
    await createProfile(data)
    toast.success("Profile created!")
    navigate({ to: "/app" })
  } catch (error) {
    toast.error("Failed to create profile")
  }
}
```

## Database Queries

### Drizzle ORM Patterns
```tsx
// Simple query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
})

// With relations
const profile = await db.query.profiles.findFirst({
  where: eq(profiles.userId, userId),
  with: {
    grade: true,
    series: true,
    subjects: {
      with: {
        subject: true,
      },
    },
  },
})

// Insert
await db.insert(profiles).values({
  userId,
  type: "student",
  gradeId,
  seriesId,
})
```

## Error Handling

### Try-Catch Pattern
```tsx
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error("Operation failed:", error)
  throw new Error("User-friendly error message")
}
```

### Error Boundaries
- Use React Error Boundaries for component-level errors
- TanStack Router provides error boundaries per route

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use proper semantic HTML (`<button>`, `<nav>`, etc.)
- Test with Tab, Enter, Escape keys

### Screen Readers
```tsx
<div role="status" aria-live="polite">
  {message}
</div>
```

## Performance

### Code Splitting
```tsx
// Lazy load routes
export const Route = createLazyFileRoute("/app/lessons")({
  component: LessonsPage,
})
```

### Memoization
```tsx
// Expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### Image Optimization
```tsx
<img
  src="/image.webp"
  alt="Description"
  loading="lazy"
  width={400}
  height={300}
/>
```

## Testing

### Component Tests
```tsx
import { render, screen } from "@testing-library/react"
import { LevelBadge } from "./level-badge"

test("displays current level", () => {
  render(<LevelBadge level={5} xp={250} xpToNext={500} />)
  expect(screen.getByText("Niveau 5")).toBeInTheDocument()
})
```

### Server Function Tests
```tsx
import { describe, it, expect } from "vitest"
import { getProfile } from "./profile-functions"

describe("getProfile", () => {
  it("returns user profile", async () => {
    const profile = await getProfile("user-123")
    expect(profile).toBeDefined()
    expect(profile.userId).toBe("user-123")
  })
})
```

## Documentation

### Component Documentation
```tsx
/**
 * Displays user's current level with progress bar
 * 
 * @param level - Current level number
 * @param xp - Current XP amount
 * @param xpToNext - XP needed for next level
 * @param variant - Display size variant
 */
export function LevelBadge({ level, xp, xpToNext, variant = "default" }: LevelBadgeProps) {
  // ...
}
```

### README Files
- Each major feature should have a README.md
- Include usage examples, API documentation, and design decisions
- See `apps/user-application/src/components/gamification/README.md` as example

## Git Workflow

### Commit Messages
```
feat: add streak calendar component
fix: correct XP calculation in level badge
docs: update gamification README
refactor: migrate colors to semantic utilities
style: format code with prettier
test: add tests for achievement badges
```

### Branch Naming
- `feature/gamification-system`
- `fix/profile-validation`
- `refactor/color-migration`
- `docs/update-readme`

## Common Patterns

### Conditional Rendering
```tsx
// Short circuit
{isVisible && <Component />}

// Ternary
{isLoading ? <Skeleton /> : <Content />}

// Early return
if (!data) return null
return <Content data={data} />
```

### Array Mapping
```tsx
{items.map((item) => (
  <Card key={item.id}>
    <CardTitle>{item.title}</CardTitle>
  </Card>
))}
```

### Optional Chaining
```tsx
const userName = user?.profile?.name ?? "Guest"
```

## Anti-Patterns to Avoid

### ❌ Don't Use Inline Colors
```tsx
// BAD
<div className="bg-gradient-to-br from-blue-400 to-blue-600">
```

### ❌ Don't Use `any` Type
```tsx
// BAD
const data: any = await fetchData()

// GOOD
const data: UserProfile = await fetchData()
```

### ❌ Don't Mutate State Directly
```tsx
// BAD
state.items.push(newItem)

// GOOD
setState({ ...state, items: [...state.items, newItem] })
```

### ❌ Don't Forget Error Handling
```tsx
// BAD
const data = await fetchData()

// GOOD
try {
  const data = await fetchData()
} catch (error) {
  handleError(error)
}
```

### ❌ Don't Skip Accessibility
```tsx
// BAD
<div onClick={handleClick}>Click me</div>

// GOOD
<button onClick={handleClick}>Click me</button>
```

## Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
