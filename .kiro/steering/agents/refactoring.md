---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx}"
---

# Refactoring Guide

Comprehensive refactoring patterns and best practices for improving code quality.

## Code Smell Detection

### Long Methods
- Methods > 20 lines
- Multiple levels of nesting
- Many parameters

### Large Components
- Components > 200 lines
- Too many responsibilities
- Hard to test

### Duplicate Code
- Similar logic in multiple places
- Copy-pasted code
- Repeated patterns

### Feature Envy
- Component accessing another component's data excessively
- Should be moved or extracted

## Refactoring Patterns

### Extract Component
```tsx
// Before: Large component
function Dashboard() {
  return (
    <div>
      {/* 50 lines of header */}
      {/* 100 lines of content */}
      {/* 30 lines of footer */}
    </div>
  )
}

// After: Extracted components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardContent />
      <DashboardFooter />
    </div>
  )
}
```

### Extract Hook
```tsx
// Before: Logic in component
function Profile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchProfile().then(setProfile).finally(() => setIsLoading(false))
  }, [])
}

// After: Custom hook
function useProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  })
  return { profile, isLoading }
}
```

### Extract Server Function
```tsx
// Before: Inline data fetching
const profile = await db.query.profiles.findFirst({
  where: eq(profiles.userId, userId),
  with: { grade: true, series: true },
})

// After: Server function
const profile = await getProfile({ data: userId })
```

### Replace Conditional with Polymorphism
```tsx
// Before: Switch statement
function renderBadge(type: string) {
  switch (type) {
    case "xp": return <XPBadge />
    case "level": return <LevelBadge />
    case "streak": return <StreakBadge />
  }
}

// After: Component map
const BadgeComponents = {
  xp: XPBadge,
  level: LevelBadge,
  streak: StreakBadge,
}

function renderBadge(type: keyof typeof BadgeComponents) {
  const Component = BadgeComponents[type]
  return <Component />
}
```

## Safety Checklist
- [ ] Tests pass before refactoring
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Commit frequently
- [ ] No behavior changes
- [ ] Performance not degraded

## Kurama-Specific Refactoring

### Migrate Inline Colors
```tsx
// Before
<div className="bg-gradient-to-br from-amber-400 to-orange-500">

// After
<div className="bg-gradient-level">
```

### Standardize Server Function Calls
```tsx
// Before
const result = await getProfile(userId)

// After
const result = await getProfile({ data: userId })
```

### Extract Loading States
```tsx
// Before: Inline skeleton
if (isLoading) return <div className="animate-pulse h-4 w-full" />

// After: Skeleton component
if (isLoading) return <CardSkeleton />
```
