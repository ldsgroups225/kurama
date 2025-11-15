# Learning Session Architecture

## Component Hierarchy

```
SessionPage (Route)
├── SessionHeader
│   ├── Button (Close)
│   ├── Progress Counter
│   └── Button (Settings)
│
├── Main Container
│   ├── Counter Badges Row
│   │   ├── SessionCounterBadge (Incorrect)
│   │   └── SessionCounterBadge (Correct)
│   │
│   ├── Flashcard
│   │   └── AnimatePresence
│   │       └── motion.div (Draggable)
│   │           └── motion.div (Flip Container)
│   │               ├── FlashcardFace (Front)
│   │               │   ├── Button (Audio)
│   │               │   ├── Button (Star)
│   │               │   └── Content
│   │               └── FlashcardFace (Back)
│   │                   ├── Button (Audio)
│   │                   ├── Button (Star)
│   │                   └── Content
│   │
│   └── SessionControls
│       ├── Button (Previous)
│       └── Button (Autoplay Toggle)
│
└── SessionSettingsDialog
    ├── Orientation Toggle
    └── Reset Button
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        SessionPage                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              useSessionState Hook                    │  │
│  │  • currentCardIndex                                  │  │
│  │  • isFlipped                                         │  │
│  │  • sessionStats (correct, incorrect, skipped)       │  │
│  │  • cardOrientation                                   │  │
│  │  • isAutoPlaying                                     │  │
│  │  • cardHistory                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         useCardSwipeAnimations Hook                  │  │
│  │  • x (horizontal position)                           │  │
│  │  • rotate, opacity                                   │  │
│  │  • cardBackgroundColor, cardBorderColor              │  │
│  │  • correctBadge animations                           │  │
│  │  • incorrectBadge animations                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         createSwipeHandlers Function                 │  │
│  │  • handleDragStart                                   │  │
│  │  • handleDragEnd                                     │  │
│  │    ├─→ onCorrect (increment correct)                │  │
│  │    └─→ onIncorrect (increment incorrect)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              useAutoplay Hook                        │  │
│  │  • Flip card after 4s                                │  │
│  │  • Animate swipe after 4s                            │  │
│  │  • Mark correct and go to next                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         useViewportHeight Hook                       │  │
│  │  • Track window.innerHeight                          │  │
│  │  • Update on resize                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           useCardHeight Hook                         │  │
│  │  • Calculate optimal height                          │  │
│  │  • Min: 300px, Max: 600px                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow

### User Swipes Card

```
User swipes card
    │
    ▼
handleDragStart()
    │
    ├─→ setIsDragging(true)
    │
    ▼
User releases
    │
    ▼
handleDragEnd(info)
    │
    ├─→ Check offset.x and velocity
    │
    ├─→ If right swipe: handleResponse('correct')
    │   │
    │   ├─→ incrementStat('correct')
    │   ├─→ If last card: navigateToSummary()
    │   └─→ Else: next card
    │
    ├─→ If left swipe: handleResponse('incorrect')
    │   │
    │   ├─→ incrementStat('incorrect')
    │   ├─→ If last card: navigateToSummary()
    │   └─→ Else: next card
    │
    └─→ Else: return to center (x.set(0))
```

### Autoplay Flow

```
User clicks Play
    │
    ▼
setIsAutoPlaying(true)
    │
    ▼
useAutoplay effect triggers
    │
    ├─→ Wait 4s
    │
    ├─→ setIsFlipped(true)
    │
    ├─→ Wait 4s
    │
    ├─→ Animate swipe right (600ms)
    │   │
    │   └─→ requestAnimationFrame loop
    │       │
    │       └─→ Ease-out cubic animation
    │
    ├─→ incrementStat('correct')
    │
    └─→ goToNextCard()
        │
        ├─→ addToHistory(currentIndex)
        ├─→ If last card: loop to start
        └─→ Else: next card
```

## State Management Strategy

### Local State (useState)
- UI-specific state (isDragging, showSettings)
- Temporary state that doesn't need persistence

### Custom Hook State (useSessionState)
- Session-specific state (stats, history, orientation)
- State that needs to be shared across multiple handlers
- State that has related update logic

### Motion Values (useMotionValue)
- Animation state (x, rotate, opacity)
- High-frequency updates that shouldn't trigger re-renders
- Interpolated values (colors, scales)

### Server State (useQuery)
- Lesson data from API
- Cached and automatically refetched

## Performance Optimizations

### 1. useCallback
All event handlers wrapped in `useCallback` to prevent unnecessary re-renders:
- `handleFlip`
- `handleResponse`
- `goToNextCard`
- `handlePrevCard`
- `navigateToLesson`
- `navigateToSummary`

### 2. Motion Values
Animation values use `useMotionValue` and `useTransform` to avoid re-renders:
- Card position (x)
- Card rotation
- Card opacity
- Background colors
- Border colors
- Badge animations

### 3. useMemo
Expensive calculations memoized:
- `cardHeight` calculation based on viewport

### 4. useSyncExternalStore
Efficient viewport tracking without unnecessary re-renders

### 5. Component Splitting
Small, focused components that only re-render when their props change

## Testing Strategy

### Unit Tests

#### Hooks
```typescript
describe('useSessionState', () => {
  it('should initialize with default values')
  it('should increment stats correctly')
  it('should manage card history')
  it('should reset session')
})

describe('createSwipeHandlers', () => {
  it('should detect right swipe')
  it('should detect left swipe')
  it('should return to center on small swipe')
  it('should consider velocity')
})

describe('useAutoplay', () => {
  it('should flip card after delay')
  it('should animate swipe')
  it('should mark correct and advance')
  it('should cleanup timers')
})
```

#### Components
```typescript
describe('Flashcard', () => {
  it('should render front content')
  it('should flip on click')
  it('should handle drag gestures')
  it('should animate transitions')
})

describe('SessionCounterBadge', () => {
  it('should display count')
  it('should animate on swipe')
  it('should show preview')
})
```

### Integration Tests
```typescript
describe('Session Flow', () => {
  it('should complete full session')
  it('should track stats correctly')
  it('should navigate to summary')
  it('should handle autoplay')
  it('should allow going back')
})
```

### E2E Tests
```typescript
describe('Learning Session', () => {
  it('should load lesson and start session')
  it('should swipe through cards')
  it('should change orientation in settings')
  it('should complete session and see summary')
})
```

## Accessibility Considerations

### Keyboard Navigation (Future)
- Space: Flip card
- Arrow Right: Mark correct
- Arrow Left: Mark incorrect
- Arrow Up: Previous card
- P: Toggle autoplay
- S: Open settings
- Escape: Close dialog/exit session

### Screen Reader Support (Future)
- ARIA labels for all buttons
- ARIA live regions for stats updates
- ARIA announcements for card changes
- Semantic HTML structure

### Focus Management
- Trap focus in dialogs
- Restore focus on dialog close
- Visible focus indicators

## Mobile Considerations

### Touch Gestures
- Swipe left/right for responses
- Tap to flip
- Smooth animations at 60fps

### Responsive Design
- Dynamic card height based on viewport
- Touch-friendly button sizes (48x48px minimum)
- Optimized for portrait orientation

### Performance
- Hardware-accelerated animations
- Minimal re-renders
- Efficient gesture detection
