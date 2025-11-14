---
inclusion: manual
---

# Learning Flow Implementation

This document describes the complete learning flow implementation in Kurama, from subject selection to session completion.

## Overview

The learning flow is a 5-screen journey that guides students through their study sessions:

1. **Subject Selection** (`/app/subjects`)
2. **Lesson Selection** (`/app/subjects/$subjectId`)
3. **Mode Selection** (`/app/lessons/$lessonId`)
4. **Learning Session** (`/app/lessons/$lessonId/session`)
5. **Session Summary** (`/app/lessons/$lessonId/summary`)

## Architecture

### Server Functions (`apps/user-application/src/core/functions/learning.ts`)

Three server functions handle data fetching:

```typescript
// Get all subjects
export const getSubjects = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async () => { /* ... */ });

// Get lessons for a subject
export const getLessonsBySubject = createServerFn({ method: "GET" })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => { /* validate subjectId */ })
  .handler(async ({ data: subjectId }) => { /* ... */ });

// Get lesson with all cards
export const getLessonDetails = createServerFn({ method: "GET" })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => { /* validate lessonId */ })
  .handler(async ({ data: lessonId }) => { /* ... */ });
```

**Important**: Server functions with input validators must be called with `{ data: value }`:
```typescript
// ✅ Correct
getLessonsBySubject({ data: Number(subjectId) })

// ❌ Wrong
getLessonsBySubject(Number(subjectId))
```

### Route Structure

```
routes/_auth/app/
├── subjects.index.tsx          # Subject selection (parent route)
├── subjects.$subjectId.tsx     # Lesson selection (child route)
├── lessons.$lessonId.tsx       # Mode selection
├── lessons.$lessonId.session.tsx   # Active session
└── lessons.$lessonId.summary.tsx   # Results
```

**Critical**: Use `.index.tsx` for parent routes that have children to prevent them from becoming layout routes.

## Screen Details

### 1. Subject Selection (`subjects.index.tsx`)

**Purpose**: Display all available subjects with visual hierarchy

**Features**:
- Color-coded subject icons (math, physics, languages, etc.)
- Subject descriptions
- Semantic color utilities for consistent theming
- Loading states with spinner
- Click to navigate to lesson selection

**Data**: Fetches from `getSubjects()` server function

**Navigation**: Links to `/app/subjects/$subjectId`

### 2. Lesson Selection (`subjects.$subjectId.tsx`)

**Purpose**: Browse lessons for a specific subject

**Features**:
- Back button to subjects
- Lesson cards with:
  - Title and description
  - Difficulty badge (Facile, Moyen, Difficile)
  - Estimated duration
- Empty state when no lessons available
- Loading states

**Data**: Fetches from `getLessonsBySubject({ data: subjectId })`

**Navigation**: Links to `/app/lessons/$lessonId`

### 3. Mode Selection (`lessons.$lessonId.tsx`)

**Purpose**: Choose how to study the lesson

**Features**:
- Lesson overview card with:
  - Subject name in header
  - Lesson title and description
  - Estimated duration
  - Number of cards
- Three learning modes:
  - **Flashcards**: Interactive card flipping
  - **Quiz**: Question-based testing (planned)
  - **Exam**: Timed simulation (planned)
- Modal dialog for mode selection
- Mode preview cards with icons and descriptions

**Data**: Fetches from `getLessonDetails({ data: lessonId })`

**Navigation**: 
- Back to lesson list
- Forward to `/app/lessons/$lessonId/session?mode=flashcards`

### 4. Learning Session (`lessons.$lessonId.session.tsx`)

**Purpose**: Active study session with flashcards

**Features**:
- Progress bar showing current card / total cards
- Session statistics (correct/incorrect counters)
- Flashcard with flip animation:
  - Front: Question with flip button
  - Back: Answer with response buttons
- Response buttons (Correct/Incorrect) appear after flip
- Smooth card transitions using motion/react
- Session state management:
  - Current card index
  - Flip state
  - Session statistics
  - Start time for duration tracking

**Data**: Uses lesson data from `getLessonDetails({ data: lessonId })`

**Navigation**: 
- Back button to mode selection
- Auto-navigate to summary on last card

**Animations**:
- Card slide transitions (opacity + x-axis)
- Flip animation (rotateY)
- Button fade-in after flip

### 5. Session Summary (`lessons.$lessonId.summary.tsx`)

**Purpose**: Show session results and performance feedback

**Features**:
- Performance level indicator:
  - Excellent (≥90%)
  - Très bien (≥70%)
  - Bon travail (≥50%)
  - Continue à pratiquer (<50%)
- Score display with percentage
- Statistics grid:
  - Correct/incorrect counts
  - Total time
  - Cards reviewed
- XP earned calculation (10 XP per correct answer)
- Action buttons:
  - Restart session
  - Return to home

**Data**: Receives via URL search params:
- `correct`: Number of correct answers
- `incorrect`: Number of incorrect answers
- `total`: Total cards
- `duration`: Session duration in seconds
- `mode`: Learning mode used

**Navigation**:
- Restart: Back to session with same mode
- Home: Navigate to `/app`

## UI Components

### Progress Component (`components/ui/progress.tsx`)

Custom progress bar component created for the learning flow:

```typescript
<Progress value={progress} className="h-2" />
```

- Displays percentage-based progress
- Smooth transitions
- Accessible with ARIA attributes

### Animations

Using `motion/react` (Motion One) for smooth animations:

```typescript
import { motion, AnimatePresence } from "motion/react";

// Card transitions
<AnimatePresence mode="wait">
  <motion.div
    key={currentCardIndex}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
  />
</AnimatePresence>
```

## Data Flow

### Subject Selection
```
User clicks "Leçons" → 
Navigate to /app/subjects → 
Fetch getSubjects() → 
Display subject cards → 
User clicks subject → 
Navigate to /app/subjects/$subjectId
```

### Lesson Selection
```
Fetch getLessonsBySubject({ data: subjectId }) → 
Display lesson cards → 
User clicks lesson → 
Navigate to /app/lessons/$lessonId
```

### Mode Selection
```
Fetch getLessonDetails({ data: lessonId }) → 
Display lesson overview → 
User clicks "Commencer" → 
Show mode selection modal → 
User selects mode → 
Navigate to /app/lessons/$lessonId/session?mode=flashcards
```

### Learning Session
```
Use lesson data (cards array) → 
Display current card → 
User flips card → 
User marks correct/incorrect → 
Update statistics → 
Move to next card → 
On last card: Navigate to summary with stats
```

### Session Summary
```
Receive stats from URL params → 
Calculate score and performance level → 
Display results and XP earned → 
User can restart or go home
```

## State Management

### Session State
```typescript
const [currentCardIndex, setCurrentCardIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [sessionStats, setSessionStats] = useState({
  correct: 0,
  incorrect: 0,
  skipped: 0,
});
const [startTime] = useState(Date.now());
```

### Navigation State
- URL params for dynamic routes (`$subjectId`, `$lessonId`)
- Search params for mode and summary data
- TanStack Router handles state persistence

## Error Handling

### Loading States
- Spinner during data fetching
- Skeleton screens (can be added)
- Loading text indicators

### Empty States
- "Aucune leçon disponible" when no lessons
- "Aucune carte disponible" when no cards
- "Leçon introuvable" when lesson not found

### Error States
- Server function errors caught by TanStack Query
- TypeScript type safety with `as any` for metadata compatibility
- Graceful fallbacks for missing data

## Performance Optimizations

### Query Caching
```typescript
const { data: lessons, isLoading } = useQuery({
  queryKey: ["lessons", subjectId],
  queryFn: () => getLessonsBySubject({ data: Number(subjectId) }),
});
```

- TanStack Query caches results
- Query keys include dynamic params
- Automatic refetching on stale data

### Route Performance Tracking
```typescript
useEffect(() => {
  const endTracking = trackRouteLoad("app-subjects");
  return endTracking;
}, []);
```

### Code Splitting
- Lazy loading with TanStack Router
- Dynamic imports for heavy components
- Route-based code splitting

## Future Enhancements

### Planned Features
1. **Quiz Mode**: Multiple choice questions
2. **Exam Mode**: Timed simulation with scoring
3. **Progress Persistence**: Save session progress
4. **SM-2 Algorithm**: Implement spaced repetition
5. **Offline Support**: PWA with service worker
6. **Audio Support**: Text-to-speech for cards
7. **Image Support**: Visual learning aids
8. **Bookmarks**: Save favorite cards
9. **Notes**: Add personal notes to cards
10. **Study Reminders**: Push notifications

### Database Integration
- User progress tracking per card
- Session history
- Performance analytics
- Adaptive difficulty
- Personalized recommendations

## Troubleshooting

### Common Issues

**Issue**: Route not updating when clicking subject
**Solution**: Ensure parent route uses `.index.tsx` suffix

**Issue**: TypeScript errors with server functions
**Solution**: Call with `{ data: value }` format

**Issue**: Metadata type errors
**Solution**: Use `as any` cast for lesson data with cards

**Issue**: Dev server on wrong port
**Solution**: Kill old process and restart on port 3000

**Issue**: Routes not regenerating
**Solution**: Restart dev server to regenerate `routeTree.gen.ts`

## Testing Checklist

- [ ] Subject selection displays all subjects
- [ ] Clicking subject navigates to lessons
- [ ] Lesson list shows correct subject lessons
- [ ] Mode selection modal opens
- [ ] Flashcard session starts correctly
- [ ] Card flip animation works
- [ ] Progress bar updates
- [ ] Statistics track correctly
- [ ] Summary shows accurate results
- [ ] XP calculation is correct
- [ ] Navigation buttons work
- [ ] Loading states display
- [ ] Empty states display
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Performance acceptable

## Related Files

### Routes
- `apps/user-application/src/routes/_auth/app/subjects.index.tsx`
- `apps/user-application/src/routes/_auth/app/subjects.$subjectId.tsx`
- `apps/user-application/src/routes/_auth/app/lessons.$lessonId.tsx`
- `apps/user-application/src/routes/_auth/app/lessons.$lessonId.session.tsx`
- `apps/user-application/src/routes/_auth/app/lessons.$lessonId.summary.tsx`

### Server Functions
- `apps/user-application/src/core/functions/learning.ts`

### Components
- `apps/user-application/src/components/ui/progress.tsx`
- `apps/user-application/src/components/main/bottom-nav.tsx`
- `apps/user-application/src/components/main/app-header.tsx`

### Database Schema
- `packages/data-ops/src/drizzle/schema.ts` (subjects, lessons, cards tables)
