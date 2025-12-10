---
inclusion: fileMatch
fileMatchPattern: "apps/user-application/**/*.{tsx,ts,css}"
---

# Frontend Development Guide

## TanStack Start + React 19 Patterns

### Component Creation
```tsx
// 1. Imports (external → internal)
import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 2. Types
interface ComponentProps {
  title: string
  onAction?: () => void
  className?: string
}

// 3. Component with proper typing
export function Component({ title, onAction, className }: ComponentProps) {
  const [state, setState] = useState(false)
  
  const handleClick = useCallback(() => {
    setState(true)
    onAction?.()
  }, [onAction])
  
  return (
    <div className={cn("p-4", className)}>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action</Button>
    </div>
  )
}
```

### Server Functions (core/functions/)
```tsx
import { createServerFn } from "@tanstack/react-start"
import { getDb } from "@kurama/data-ops/database/setup"

export const getData = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    const db = getDb()
    return await db.query.table.findFirst({ where: eq(table.id, id) })
  })

// IMPORTANT: Call with { data: value } format
const result = await getData({ data: "123" })
```

### TanStack Query Patterns
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource({ data: id }),
  staleTime: 5 * 60 * 1000,
})

// Loading states
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
return <Content data={data} />
```

## Styling Rules

### Semantic Colors Only
```tsx
// ✅ DO: Use semantic utilities
<div className="bg-gradient-level text-level">
<div className="bg-success text-success">
<div className="text-subject-math bg-subject-math">

// ❌ DON'T: Use inline Tailwind colors
<div className="bg-gradient-to-br from-amber-400 to-orange-500">
<div className="bg-green-500/10 text-green-600">
```

### Available Utilities
- Gamification: `bg-gradient-xp`, `text-level`, `bg-gradient-streak`, `text-rare`, `bg-epic`, `text-legendary`
- Status: `bg-success`, `bg-error`, `bg-warning`, `bg-info`
- Subjects: `text-subject-math`, `bg-subject-physics`, `text-subject-french`

### Responsive Design
```tsx
// Mobile-first
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
</div>
```

## Route Patterns

### File Naming
- Parent with children: `subjects.index.tsx`
- Dynamic routes: `subjects.$subjectId.tsx`
- Layout routes: `_auth/route.tsx`

### Protected Routes
```tsx
// _auth/route.tsx pattern
export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: AuthLayout,
})
```

## Accessibility Requirements
- All interactive elements keyboard accessible
- Proper ARIA labels for icon-only buttons
- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- Focus management for modals/dialogs
- Screen reader announcements for dynamic content

## Performance Checklist
- [ ] Use `React.memo` for expensive renders
- [ ] Use `useMemo`/`useCallback` appropriately
- [ ] Lazy load routes with `createLazyFileRoute`
- [ ] Optimize images with `loading="lazy"`
- [ ] Check bundle size with `pnpm run perf:check-bundles`
