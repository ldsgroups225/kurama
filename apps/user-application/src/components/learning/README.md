# Learning Session Components

Refactored flashcard session components following clean code principles and single responsibility pattern.

## Architecture

### Components

#### `Flashcard`
Main flashcard component managing card flip animation and swipe gestures.

**Props:**
- `card`: Card data with front/back content
- `cardIndex`: Current card index for animation keys
- `isFlipped`: Flip state
- `cardOrientation`: Display orientation (term/definition)
- `cardHeight`: Dynamic height based on viewport
- Motion values for animations (x, rotate, opacity, colors)
- Event handlers (onFlip, onDragStart, onDragEnd)

#### `FlashcardFace`
Individual card face (front or back) with content and actions.

**Props:**
- `content`: Text content to display
- `label`: Label for the face (Terme/Définition)
- `isBack`: Whether this is the back face
- `backgroundColor`, `borderColor`: Motion values for animations
- `onFlip`: Flip handler

#### `SessionHeader`
Sticky header with navigation, progress, and settings.

**Props:**
- `currentIndex`, `totalCards`: Progress tracking
- `progress`: Progress percentage
- `onClose`, `onSettings`: Navigation handlers

#### `SessionCounterBadge`
Animated counter badge for correct/incorrect responses.

**Props:**
- `count`: Current count
- `type`: 'correct' or 'incorrect'
- Motion values for animations (backgroundColor, scale, showPreview, hideCount)

#### `SessionControls`
Navigation controls (previous card, autoplay toggle).

**Props:**
- `isAutoPlaying`: Autoplay state
- `canGoBack`: Whether previous card is available
- `onToggleAutoPlay`, `onPrevCard`: Action handlers

#### `SessionSettingsDialog`
Settings dialog for card orientation and session reset.

**Props:**
- `open`: Dialog open state
- `cardOrientation`: Current orientation
- `onOpenChange`, `onOrientationChange`, `onReset`: Action handlers

### Custom Hooks

#### `useSessionState`
Manages all session state (cards, stats, settings, history).

**Returns:**
- State values and setters
- Helper functions: `incrementStat`, `resetSession`, `addToHistory`, `popFromHistory`

#### `useCardSwipeAnimations`
Creates motion values for swipe animations and visual feedback.

**Returns:**
- Motion values for card (x, rotate, opacity, colors)
- Badge animation values (correct/incorrect)

#### `createSwipeHandlers`
Creates swipe gesture handlers for flashcard interactions.

**Parameters:**
- `x`: Motion value for horizontal position
- Event handlers: `onCorrect`, `onIncorrect`, `onDragStart`, `onDragEnd`

**Returns:**
- `handleDragStart`, `handleDragEnd`: Gesture handlers

**Note:** This is a regular function (not a hook) since it doesn't call any React hooks.

#### `useAutoplay`
Manages autoplay functionality with flip and swipe animations.

**Parameters:**
- `isAutoPlaying`: Autoplay state
- `isFlipped`: Current flip state
- `cardsLength`: Total cards
- `x`: Motion value for swipe animation
- Event handlers: `onFlip`, `onMarkCorrect`, `onNextCard`

#### `useViewportHeight`
Tracks viewport height reactively using `useSyncExternalStore`.

**Returns:** Current viewport height in pixels

#### `useCardHeight`
Calculates optimal card height based on viewport.

**Parameters:**
- `viewportHeight`: Current viewport height

**Returns:** Calculated card height (300-600px range)

## Design Decisions

### Separation of Concerns
- **Components**: Pure presentation, receive props and callbacks
- **Hooks**: Business logic, state management, side effects
- **Route**: Orchestration, connects components and hooks

### Single Responsibility
Each component/hook has one clear purpose:
- `Flashcard`: Card display and gestures
- `SessionHeader`: Navigation and progress
- `SessionControls`: Playback controls
- `useSessionState`: State management
- `useSwipeHandler`: Gesture detection
- `useAutoplay`: Autoplay logic

### Reusability
- `FlashcardFace`: Reused for front and back
- `SessionCounterBadge`: Reused for correct/incorrect
- Hooks can be used independently or combined

### Performance
- `useCallback` for stable function references
- Motion values for smooth animations without re-renders
- Memoized calculations (card height)
- Efficient viewport tracking with `useSyncExternalStore`

### Type Safety
- Explicit interfaces for all props
- Type exports from hooks
- No `any` types (except legacy lesson data)

## Constants

### Animation Timings
- `FLIP_DELAY`: 4000ms (time before auto-flip)
- `NEXT_CARD_DELAY`: 4000ms (time on back before next card)
- `SWIPE_ANIMATION_DURATION`: 600ms (autoplay swipe duration)
- `DRAG_END_DELAY`: 100ms (delay before re-enabling flip)

### Thresholds
- `SWIPE_THRESHOLD`: 80px (distance to trigger swipe)
- `VELOCITY_THRESHOLD`: 500 (velocity to trigger swipe)
- `VELOCITY_DISTANCE_THRESHOLD`: 50px (min distance for velocity swipe)

### Layout
- `RESERVED_SPACE`: 285px (header + progress + badges + buttons + padding)
- `MIN_HEIGHT`: 300px (minimum card height)
- `MAX_HEIGHT`: 600px (maximum card height)

## Usage Example

```tsx
import { SessionPage } from '@/routes/_auth/app/lesson-session.$lessonId'

// Route automatically handles:
// - Lesson data fetching
// - Session state management
// - Swipe gesture handling
// - Autoplay functionality
// - Navigation to summary
```

## Future Improvements

- [ ] Add keyboard navigation (arrow keys, space)
- [ ] Implement audio playback for cards
- [ ] Add star/favorite functionality
- [ ] Support quiz and exam modes
- [ ] Add accessibility improvements (ARIA labels, screen reader support)
- [ ] Implement offline support with service worker
- [ ] Add haptic feedback for mobile devices
- [ ] Support custom swipe thresholds in settings
