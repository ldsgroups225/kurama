# Quiz Mode - Visual Design Specification

## Design System Integration

### Color Palette

Following Kurama's semantic color utilities defined in `styles.css`:

#### Primary Colors
```css
--xp-from: oklch(0.7 0.19 252)      /* Blue-purple gradient start */
--xp-to: oklch(0.55 0.22 264)       /* Blue-purple gradient end */
--xp-bg: oklch(0.95 0.02 252)       /* Light blue-purple background */
```

#### Status Colors
```css
/* Success (Correct Answer) */
--success-from: oklch(0.65 0.17 145)
--success-to: oklch(0.55 0.2 155)
--success-bg: oklch(0.95 0.03 145)

/* Warning (Learning State) */
--warning-from: oklch(0.75 0.15 85)
--warning-to: oklch(0.65 0.2 75)
--warning-bg: oklch(0.97 0.03 85)

/* Error (Incorrect Answer) */
--error-from: oklch(0.6 0.22 25)
--error-to: oklch(0.5 0.24 15)
--error-bg: oklch(0.97 0.03 25)
```

### Typography

#### Headings
- **Sheet Title**: `text-2xl` (24px) - Semibold
- **Question Text**: `text-xl` (20px) - Semibold
- **Option Text**: `text-base` (16px) - Medium
- **Feedback Text**: `text-sm` (14px) - Medium

#### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing System

Following Tailwind's spacing scale:
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px
- `p-4`: 16px padding
- `p-6`: 24px padding
- `mb-6`: 24px margin-bottom

## Component Specifications

### 1. Quiz Settings Bottom Sheet

#### Layout
```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Handle bar
│                                     │
│ ┌─ Header (px-6 pt-6) ────────────┐ │
│ │ Lesson Title                    │ │ ← text-2xl semibold
│ │ Choisissez un objectif...       │ │ ← text-base muted
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Content (px-6, scrollable) ────┐ │
│ │ 📚 12 cartes disponibles        │ │ ← text-sm muted
│ │                                 │ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ 📖  Mémoriser tout        │   │ │
│ │ │     Recommandé            │   │ │
│ │ │     Étudie toutes...      │   │ │
│ │ └───────────────────────────┘   │ │
│ │                                 │ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ 🎯  Réviser les favoris   │   │ │
│ │ │     Ciblé                 │   │ │
│ │ │     Concentre-toi...      │   │ │
│ │ └───────────────────────────┘   │ │
│ │                                 │ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ ⚡  Révision rapide       │   │ │
│ │ │     Rapide                │   │ │
│ │ │     Parcours rapide...    │   │ │
│ │ └───────────────────────────┘   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Footer (px-6 py-4, border-t) ──┐ │
│ │ [ Annuler ]                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Dimensions
- **Height**: 85vh (85% of viewport height)
- **Max Width**: 100% (mobile-first)
- **Border Radius**: 24px (top corners only - rounded-t-3xl)
- **Card Height**: Auto (content-based)
- **Icon Size**: 56px × 56px (h-14 w-14)

#### Spacing Structure
- **Header Padding**: px-6 pt-6 (24px horizontal, 24px top)
- **Content Padding**: px-6 (24px horizontal, scrollable)
- **Footer Padding**: px-6 py-4 (24px horizontal, 16px vertical)
- **Card Gap**: 16px (space-y-4)
- **Section Gap**: 24px (mt-6)

#### Close Button Enhancement
- **Background**: bg-background/80 with backdrop-blur-md
- **Shape**: Fully rounded (rounded-full)
- **Padding**: p-2 (8px all sides)
- **Shadow**: shadow-lg for elevation
- **Hover State**: Scale 1.1, bg-background/90
- **Transition**: 200ms all properties

#### Interactions
- **Tap Target**: Minimum 44px × 44px
- **Hover State**: Scale 1.02, border-primary/50
- **Active State**: Scale 0.98
- **Transition**: 200ms ease-in-out

#### Visual States
```css
/* Default */
.mode-card {
  border: 2px solid var(--border);
  background: var(--card);
}

/* Hover */
.mode-card:hover {
  transform: scale(1.02);
  border-color: var(--primary) / 0.5;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Icon Container */
.mode-icon {
  background: linear-gradient(to bottom right, var(--xp-from), var(--xp-to));
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### 2. Quiz Question Card

#### Layout - Multiple Choice
```
┌─────────────────────────────────────┐
│ [3 / 12]                            │ ← Progress badge
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What is the cell cycle?     🔊⭐│ │ ← Question
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (A) Option 1                │ │ │ ← Options
│ │ └─────────────────────────────┘ │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (B) Option 2                │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (C) Option 3                │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (D) Option 4                │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Vous ne savez pas ?             │ │ ← Help link
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Layout - Written Answer
```
┌─────────────────────────────────────┐
│ [7 / 12]                            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What is chromatin?          🔊⭐│ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Tapez la réponse...         │ │ │ ← Text input
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ [ Vérifier ]                    │ │ ← Submit button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Dimensions
- **Card Padding**: 24px (p-6)
- **Option Height**: Auto (min 48px)
- **Option Gap**: 12px (gap-3)
- **Letter Circle**: 32px × 32px (h-8 w-8)
- **Icon Buttons**: 32px × 32px (h-8 w-8)

#### Option States

##### Default State
```css
.option {
  border: 2px solid var(--border);
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  transition: all 200ms;
}

.option:hover {
  border-color: var(--primary) / 0.5;
  background: var(--accent);
}
```

##### Selected State (Answering)
```css
.option.selected {
  border-color: var(--primary);
  background: var(--primary) / 0.05;
}

.option-letter.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
}
```

##### Correct State
```css
.option.correct {
  border-color: var(--success-to);
  background: var(--success-bg);
  color: var(--success-to);
}

.option-letter.correct {
  border-color: var(--success-to);
  background: linear-gradient(to bottom right, var(--success-from), var(--success-to));
  color: white;
}
```

##### Incorrect State
```css
.option.incorrect {
  border-color: var(--error-to);
  background: var(--error-bg);
  color: var(--error-to);
}

.option-letter.incorrect {
  border-color: var(--error-to);
  background: linear-gradient(to bottom right, var(--error-from), var(--error-to));
  color: white;
}
```

### 3. Feedback Card

#### Layout
```
┌─────────────────────────────────────┐
│ ✓ Vous maîtrisez le sujet !         │ ← Success
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Réponse correcte :              │ │
│ │ The regular sequence of...      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### States

##### Correct Feedback
```css
.feedback.correct {
  border: 2px solid var(--success-to);
  background: var(--success-bg);
}

.feedback-icon.correct {
  color: var(--success-to);
}
```

##### Incorrect Feedback
```css
.feedback.incorrect {
  border: 2px solid var(--warning-to);
  background: var(--warning-bg);
}

.feedback-icon.incorrect {
  color: var(--error-to);
}
```

##### Learning Feedback
```css
.feedback.learning {
  border: 2px solid var(--warning-to);
  background: var(--warning-bg);
}

.feedback-text.learning {
  color: var(--warning-to);
}
```

### 4. Continue Button

#### Visibility Logic
- **Correct Answer**: Button hidden, auto-advance after 800ms
- **Incorrect Answer**: Button visible, user must click
- **Learning State**: Button visible, user must click

#### Dimensions
- **Height**: 48px (size="lg")
- **Width**: 100% (w-full)
- **Font Size**: 18px (text-lg)
- **Font Weight**: 600 (font-semibold)

#### Visual Style
```css
.continue-button {
  background: linear-gradient(to bottom right, var(--xp-from), var(--xp-to));
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 200ms;
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.continue-button:active {
  transform: translateY(0);
}
```

### 5. Enhanced Close Button (Bottom Sheet)

#### Visual Design
```css
.close-button-bottom-sheet {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--background) / 0.8;
  backdrop-filter: blur(12px);
  border-radius: 9999px;
  padding: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: all 200ms;
}

.close-button-bottom-sheet:hover {
  transform: scale(1.1);
  background: var(--background) / 0.9;
}

.close-button-bottom-sheet:active {
  transform: scale(1.05);
}
```

#### Design Rationale
- **Backdrop Blur**: Creates depth and modern glass-morphism effect
- **Elevated Shadow**: Ensures button stands out from content
- **Circular Shape**: Universal close button pattern
- **Hover Scale**: Provides clear interactive feedback
- **Semi-transparent**: Maintains visual hierarchy without blocking content

## Animation Specifications

### Transitions
```css
/* Card hover */
transition: transform 200ms ease-in-out,
            border-color 200ms ease-in-out,
            box-shadow 200ms ease-in-out;

/* Option selection */
transition: all 200ms ease-in-out;

/* Button interactions */
transition: transform 150ms ease-in-out,
            box-shadow 150ms ease-in-out;
```

### Auto-Advance Timing
```typescript
// Correct answer auto-advance
const AUTO_ADVANCE_DELAY = 800 // milliseconds

// Rationale:
// - 800ms provides enough time to see success feedback
// - Not too fast to feel rushed
// - Not too slow to break flow
// - Matches natural reading speed for "Vous maîtrisez le sujet !"
```

### Keyframes

#### Sheet Slide In
```css
@keyframes slide-in-from-bottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

#### Feedback Fade In
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Success Pulse
```css
@keyframes pulse-success {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile (default) */
@media (min-width: 0px) {
  .quiz-container {
    padding: 16px;
    max-width: 100%;
  }
}

/* Tablet */
@media (min-width: 640px) {
  .quiz-container {
    padding: 24px;
    max-width: 640px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .quiz-container {
    max-width: 768px;
  }
}
```

### Touch Targets
- **Minimum Size**: 44px × 44px (iOS/Android guidelines)
- **Spacing**: 8px minimum between interactive elements
- **Active Area**: Extends 8px beyond visual boundary

## Accessibility

### Color Contrast Ratios
- **Text on Background**: 4.5:1 (WCAG AA)
- **Large Text**: 3:1 (WCAG AA)
- **Interactive Elements**: 3:1 (WCAG AA)

### Focus States
```css
.interactive:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Screen Reader Labels
```html
<button aria-label="Audio pronunciation">
  <Volume2 className="h-4 w-4" />
</button>

<button aria-label="Mark as favorite">
  <Star className="h-4 w-4" />
</button>

<div role="status" aria-live="polite">
  Vous maîtrisez le sujet !
</div>
```

## Dark Mode Adaptations

### Color Adjustments
```css
.dark {
  /* XP Colors */
  --xp-from: oklch(0.65 0.22 252);
  --xp-to: oklch(0.5 0.24 264);
  --xp-bg: oklch(0.2 0.03 252);

  /* Success Colors */
  --success-from: oklch(0.6 0.2 145);
  --success-to: oklch(0.5 0.22 155);
  --success-bg: oklch(0.2 0.04 145);

  /* Warning Colors */
  --warning-from: oklch(0.7 0.18 85);
  --warning-to: oklch(0.6 0.22 75);
  --warning-bg: oklch(0.22 0.04 85);

  /* Error Colors */
  --error-from: oklch(0.55 0.24 25);
  --error-to: oklch(0.45 0.26 15);
  --error-bg: oklch(0.22 0.04 25);
}
```

### Shadow Adjustments
```css
/* Light mode */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* Dark mode */
.dark box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
```

## Performance Considerations

### GPU Acceleration
```css
/* Accelerated properties */
transform: translateZ(0);
will-change: transform, opacity;
```

### Lazy Loading
- Images loaded on demand
- Audio files preloaded for next question
- Animations triggered only when visible

### Bundle Size
- Component code splitting
- Icon tree-shaking via Lucide React
- CSS purging via Tailwind

## Design Tokens

### Spacing
```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
}
```

### Border Radius
```typescript
const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
}
```

### Shadows
```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
}
```

---

**Design System**: Kurama v1.0
**Last Updated**: November 15, 2025
**Status**: ✅ Implemented
