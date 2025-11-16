# CLAUDE.md - kurama-frontend

Guidance for the Kurama frontend application - a TanStack Start PWA for studying BEPC/BAC.

## Quick Start

```bash
pnpm dev                          # Start on port 3000
pnpm build                        # Production build
pnpm test                         # Run tests
pnpm run perf:check-bundles       # Check bundle sizes
```

## Tech Stack

- **TanStack Start 1.133.22**: Full-stack React SSR framework
- **React 19**: Latest React with concurrent features
- **TanStack Router 1.133.22**: File-based routing with type safety
- **TanStack Query 5.90.9**: Server state management with SSR
- **Tailwind CSS v4**: Utility-first CSS with CSS variables
- **shadcn/ui**: Radix UI components (New York style, Zinc theme)
- **Better Auth 1.3.29**: Email OTP + Google OAuth
- **Polar SDK 0.34.17**: Payment integration
- **Workbox**: Service workers and PWA
- **Dexie**: IndexedDB for offline storage
- **Vitest**: Testing with Testing Library

## Project Structure

```
src/
├── routes/                # File-based routing (auto-generates routeTree.gen.ts)
│   ├── __root.tsx         # Root layout with theme provider
│   ├── index.tsx          # Landing page
│   ├── onboarding.tsx     # Profile setup flow
│   ├── api/               # API routes (auth, metrics)
│   └── _auth/             # Protected routes
│       └── app/           # Main app routes
├── components/            # Feature-organized components
│   ├── auth/              # Authentication UI
│   ├── learning/          # Flashcards, quiz, exam
│   ├── gamification/      # XP, levels, achievements, streaks
│   ├── onboarding/        # Profile setup
│   ├── pwa/               # Offline, sync, install
│   ├── payments/          # Polar integration
│   ├── ui/                # shadcn/ui components
│   └── [other features]/
├── core/
│   ├── functions/         # Server functions (profile, learning, payments)
│   └── middleware/        # Auth, Polar middleware
├── hooks/                 # Custom hooks (auth, offline, swipe, etc.)
├── lib/                   # Utilities (auth-client, db, spaced-repetition, PWA)
├── integrations/
│   └── tanstack-query/    # Query client, context, devtools
├── config/                # Performance budgets
├── utils/                 # Helpers (SEO, UUID)
├── router.tsx             # Router configuration
├── server.ts              # Custom server entry (Cloudflare)
├── start.tsx              # Client entry point
├── sw.ts                  # Service worker
└── styles.css             # Global Tailwind + semantic colors
```

## Key Patterns

### File-Based Routing
- Routes auto-generated from `src/routes/` → `routeTree.gen.ts`
- Use `.index.tsx` for parent routes with children
- Use `.$paramName.tsx` for dynamic routes
- Example: `subjects.index.tsx` (parent) + `subjects.$subjectId.tsx` (child)

### Server Functions
```typescript
// In src/core/functions/
export const getProfile = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data: userId }) => {
    // Server-side logic
  })

// In component - call with { data: value }
const profile = await getProfile({ data: userId })
```

### Semantic Colors
All colors use utility classes (no inline Tailwind):
```tsx
// ✅ Correct
<div className="bg-gradient-level text-level">
  <div className="bg-success">Success</div>
</div>

// ❌ Wrong
<div className="bg-linear-to-br from-amber-400 to-orange-500">
```

Available utilities:
- Gamification: `bg-gradient-xp`, `text-level`, `bg-gradient-streak`, etc.
- Status: `bg-success`, `bg-error`, `bg-warning`, `bg-info`
- Subjects: `text-subject-math`, `bg-subject-physics`, etc.

### TanStack Query Integration
```typescript
// In component
const { data, isLoading, error } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => getProfile({ data: userId }),
})

// Loading states
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
return <Content data={data} />
```

### Authentication
- Better Auth with email OTP (6-digit, 5-minute expiration)
- Google OAuth integration
- Session management
- Auth client in `src/lib/auth-client.ts`

### PWA Features
- Offline-first with Dexie (IndexedDB)
- Service workers with Workbox
- Offline content caching
- Sync dashboard
- Install prompts

## Learning Flow

Complete flow: Subject → Lesson → Mode → Session → Summary

**Routes**:
- `/app/subjects` - Subject selection
- `/app/subjects/$subjectId` - Lessons for subject
- `/app/lessons/$lessonId` - Mode selection
- `/app/lesson-session/$lessonId` - Active session
- `/app/lesson-summary/$lessonId` - Results

**Server Functions** (`src/core/functions/learning.ts`):
- `getSubjects()` - All subjects
- `getLessonsBySubject({ data: subjectId })` - Lessons for subject
- `getLessonDetails({ data: lessonId })` - Lesson with cards

## Gamification System

**Components** (`src/components/gamification/`):
- `level-badge.tsx` - Current level display
- `achievement-badge.tsx` - Achievement badges
- `streak-calendar.tsx` - Daily streak tracking
- `leaderboard-widget.tsx` - Competitive rankings
- `reward-animation.tsx` - Milestone animations

**Features**:
- XP system (points for study activities)
- Progressive leveling with badges
- Rarity-based achievements (Common, Rare, Epic, Legendary)
- Daily streaks with calendar
- Leaderboards with rank indicators

## Performance

### Bundle Analysis
```bash
pnpm run perf:check-bundles       # Check bundle sizes
pnpm run analyze                  # Open visualizer
```

### Optimization Techniques
- Code splitting with lazy routes
- Image lazy loading
- Request deduplication
- Chunk retry mechanism
- Memoization (useMemo, useCallback)
- Performance budgets in `src/config/performance-budgets.ts`

## Testing

```bash
pnpm test                         # Run tests
pnpm test:watch                   # Watch mode
```

**Test Files**:
- `src/components/ui/badge.test.tsx`
- `src/components/ui/button.test.tsx`
- `src/lib/utils.test.ts`

**Pattern**:
```typescript
import { render, screen } from "@testing-library/react"
import { LevelBadge } from "./level-badge"

test("displays current level", () => {
  render(<LevelBadge level={5} xp={250} xpToNext={500} />)
  expect(screen.getByText("Niveau 5")).toBeInTheDocument()
})
```

## Important Notes

- **TypeScript**: Strict mode, no `any` types (use `as any` only for metadata compatibility)
- **Imports**: Use absolute imports with `@/*` alias
- **Exports**: Named exports preferred (except routes)
- **Comments**: JSDoc for public APIs
- **Styling**: Semantic color utilities only
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Error Handling**: Try-catch with user-friendly messages

## Deployment

```bash
pnpm run build:production         # Build with performance checks
pnpm deploy                       # Build and deploy to Cloudflare Pages
```

**Production URL**: https://kurama.yeko.workers.dev

## Useful Commands

```bash
pnpm run cf-typegen               # Generate Cloudflare types
pnpm run typecheck                # Type checking
pnpm run lint:fix                 # Fix linting issues
pnpm run validate:all             # Full validation
```

## Steering Files

Comprehensive guidance in `.kiro/steering/`:
- `tech.md` - Tech stack details
- `structure.md` - Project structure
- `conventions.md` - Code standards
- `learning-flow.md` - Learning system details
- `deployment.md` - Infrastructure

## Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Better Auth](https://www.better-auth.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
