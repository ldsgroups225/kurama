# Flashcard Session UX - Quizlet-Inspired Design

## Overview

The flashcard session screen has been redesigned with a zen, Quizlet-inspired UX featuring smooth micro-interactions, swipe gestures, and intuitive controls.

## Key Features

### 1. Sticky Header with Progress

- **Close button** (X icon) - Exit session
- **Card counter** - Shows current position (e.g., "2 / 43")
- **Settings button** - Opens options modal
- **Progress bar** - Visual indicator of session completion (1px height, no rounded corners)

### 2. Counter Badges

- **Left badge** (Warning color) - Incorrect answers count
- **Right badge** (Success color) - Correct answers count
- Rounded pill design with semantic colors
- Large, readable font

### 3. Interactive Flashcard

#### Card Design

- **Minimum height**: 500px for comfortable reading
- **Shadow**: xl shadow for depth
- **Border**: 2px border that changes color based on state
  - Primary color when showing term
  - Success color when flipped to definition
- **Rounded corners**: Following design system radius

#### Card Actions (Top Corners)

- **Volume icon** (left) - Text-to-speech (future feature)
- **Star icon** (right) - Bookmark card (future feature)
- Semi-transparent background with backdrop blur

#### Flip Animation

- **Tap to flip**: Click anywhere on card
- **Smooth rotation**: 3D rotateY animation (90° → 0° → -90°)
- **Duration**: 200ms for snappy feel
- **Hint text**: "Appuyez pour retourner" appears after 500ms delay

#### Content Display

- **Front side**: Shows term with label "TERME"
- **Back side**: Shows definition with label "DÉFINITION" in success color
- **Typography**:
  - Term: 2xl font, medium weight
  - Definition: xl font, regular weight
  - Labels: xs font, semibold, uppercase, tracked

### 4. Swipe Gestures

#### Drag Behavior

- **Only when flipped**: Drag is disabled on front side
- **Horizontal drag**: Left/right swipe with elastic constraints
- **Visual feedback**:
  - Card rotates up to ±15° based on drag distance
  - Opacity changes (0.5 → 1 → 0.5) for depth effect

#### Swipe Indicators

- **Right swipe** (Correct):
  - Green overlay with check icon appears
  - Opacity increases as you swipe right
  - Threshold: 100px
- **Left swipe** (Incorrect):
  - Orange overlay with rotate icon appears
  - Opacity increases as you swipe left
  - Threshold: -100px

#### Swipe Actions

- **Swipe right**: Mark as correct, move to next card
- **Swipe left**: Mark as incorrect (needs review), move to next card
- **Release before threshold**: Card returns to center

### 5. Action Buttons (When Flipped)

#### Button Design

- **Circular buttons**: 64px (h-16 w-16)
- **Positioned**: Center bottom of screen
- **Animation**: Fade in from bottom (opacity + y-axis)

#### Buttons

1. **Incorrect** (Left)
   - Orange/warning color
   - Rotate icon
   - Outline variant with hover fill

2. **Correct** (Right)
   - Green/success color
   - Check icon
   - Filled variant

### 6. Navigation Arrows

#### Design

- **Circular ghost buttons**: 48px (h-12 w-12)
- **Positioned**: Below action buttons, centered
- **Icons**: Arrow left/right

#### Behavior

- **Previous**: Disabled on first card
- **Next**: Disabled on last card
- Resets flip state when navigating
- Resets swipe position (x = 0)

### 7. Settings Modal

#### Trigger

- Settings icon in header
- Opens full-screen modal on mobile

#### Options

**Card Orientation**

- Toggle between "Terme" and "Définition" as front side
- Two-button toggle group
- Active button uses primary color
- Allows users to study in reverse (definition → term)

**Reset Progress**

- "Parcourir à nouveau les cartes" button
- Resets to first card
- Clears all statistics
- Closes modal automatically

### 8. Micro-Interactions

#### Card Entrance

- Scale animation: 0.8 → 1
- Opacity fade: 0 → 1
- Duration: 200ms
- Smooth spring physics

#### Card Exit

- Scale animation: 1 → 0.8
- Opacity fade: 1 → 0
- Duration: 200ms

#### Flip Animation

- 3D rotation on Y-axis
- Smooth easing
- Content crossfade

#### Button Hover States

- Scale slightly on hover
- Color transitions
- Shadow changes

#### Swipe Feedback

- Real-time rotation based on drag
- Opacity changes for depth
- Overlay indicators with icons
- Smooth spring-back animation

## Color System

All colors use semantic utilities from the design system:

- **Success**: `bg-success`, `text-success`, `border-success`
- **Warning**: `bg-warning`, `text-warning`, `border-warning`
- **Primary**: `bg-primary`, `text-primary`, `border-primary`
- **Muted**: `text-muted-foreground`

## Accessibility

- **Keyboard navigation**: Arrow keys for prev/next (future)
- **Screen reader labels**: All buttons have aria-labels
- **Focus indicators**: Visible focus states
- **Color contrast**: WCAG AA compliant
- **Touch targets**: Minimum 44px for mobile

## Performance

- **Optimized animations**: Using Motion One (motion/react)
- **GPU acceleration**: Transform and opacity animations
- **Lazy loading**: Cards loaded on demand
- **Smooth 60fps**: Hardware-accelerated transforms

## Future Enhancements

1. **Audio support**: Text-to-speech for cards
2. **Bookmarks**: Save favorite cards with star icon
3. **Keyboard shortcuts**:
   - Space: Flip card
   - Arrow keys: Navigate
   - 1: Mark incorrect
   - 2: Mark correct
4. **Shuffle mode**: Randomize card order
5. **Study modes**:
   - Learn mode (adaptive)
   - Test mode (no peeking)
   - Match mode (game)
6. **Progress persistence**: Save session state
7. **Haptic feedback**: Vibration on swipe actions (mobile)
8. **Card animations**: More variety (slide, fade, zoom)

## Technical Implementation

### State Management

```typescript
const [currentCardIndex, setCurrentCardIndex] = useState(0)
const [isFlipped, setIsFlipped] = useState(false)
const [sessionStats, setSessionStats] = useState({
  correct: 0,
  incorrect: 0,
  skipped: 0,
})
const [showSettings, setShowSettings] = useState(false)
const [cardOrientation, setCardOrientation] = useState<'term' | 'definition'>('term')
```

### Motion Values

```typescript
const x = useMotionValue(0)
const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
```

### Drag Handler

```typescript
function handleDragEnd(_event, info: PanInfo) {
  const threshold = 100

  if (info.offset.x > threshold) {
    handleResponse('correct')
  }
  else if (info.offset.x < -threshold) {
    handleResponse('incorrect')
  }
  else {
    x.set(0)
  }
}
```

## Design Inspiration

- **Quizlet**: Swipe gestures, counter badges, clean card design
- **Duolingo**: Progress bar, gamification elements
- **Anki**: Spaced repetition, card orientation options
- **Material Design**: Elevation, shadows, motion principles

## User Flow

1. User enters session from mode selection
2. First card appears with entrance animation
3. User reads term (front side)
4. User taps card to flip and see definition
5. User either:
   - Swipes right (correct)
   - Swipes left (incorrect)
   - Taps circular buttons
   - Uses navigation arrows
6. Card exits with animation
7. Next card enters
8. Repeat until all cards reviewed
9. Navigate to summary screen

## Testing Checklist

- [ ] Card flip animation smooth
- [ ] Swipe gestures work correctly
- [ ] Counter badges update in real-time
- [ ] Progress bar accurate
- [ ] Settings modal opens/closes
- [ ] Card orientation toggle works
- [ ] Reset progress clears state
- [ ] Navigation arrows disabled at boundaries
- [ ] Swipe indicators appear correctly
- [ ] Action buttons only show when flipped
- [ ] Mobile touch gestures responsive
- [ ] Desktop mouse drag works
- [ ] Animations smooth at 60fps
- [ ] No layout shifts
- [ ] Accessible with keyboard
- [ ] Screen reader compatible
