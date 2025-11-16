# Test Mode - Visual Design Specification

## Design System Integration

### Color Palette

Test Mode uses Kurama's semantic color utilities with a focus on the **Streak** gradient system (orange/amber) to differentiate from Quiz Mode (blue/purple).

#### Primary Colors (Test Mode)
```css
--streak-from: oklch(0.7 0.19 45)      /* Warm orange gradient start */
--streak-to: oklch(0.55 0.24 25)       /* Deep orange gradient end */
--streak-bg: oklch(0.97 0.03 45)       /* Light orange background */
```

#### Status Colors (Results)
```css
/* Success (Correct Answer) */
--success-from: oklch(0.65 0.17 145)
--success-to: oklch(0.55 0.2 155)
--success-bg: oklch(0.95 0.03 145)

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
- **Score Display**: `text-3xl` (30px) - Bold
- **Progress Counter**: `text-sm` (14px) - Semibold

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
- `gap-6`: 24px
- `p-4`: 16px padding
- `p-6`: 24px padding
- `space-y-3`: 12px vertical gap
- `space-y-6`: 24px vertical gap

## Component Specifications

### 1. Test Settings Bottom Sheet

#### Layout
```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Handle bar
│                                     │
│ ┌─ Header (px-6 pt-6) ────────────┐ │
│ │ 🎯 Lesson Title                 │ │ ← Icon + Title
│ │ Configurez votre test           │ │ ← Subtitle
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Content (px-6, scrollable) ────┐ │
│ │ Nombre de questions (max 60) 20 │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ ← Slider
│ │                                 │ │
│ │ ┌─ Correction instantanée ────┐ │ │
│ │ │                          ○  │ │ │ ← Toggle OFF
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Répondre avec :                 │ │
│ │ ┌──────────┐ ┌──────────┐      │ │
│ │ │ Anglais  │ │Définition│      │ │ ← Selection
│ │ └──────────┘ └──────────┘      │ │
│ │                                 │ │
│ │ Types de questions              │ │
│ │ ┌─ Vrai ou faux ──────────┐    │ │
│ │ │                      ○  │    │ │
│ │ └─────────────────────────┘    │ │
│ │ ┌─ Choix multiple ─────────┐   │ │
│ │ │                      ●  │    │ │ ← ON
│ │ └─────────────────────────┘    │ │
│ │ ┌─ Écrit ──────────────────┐   │ │
│ │ │                      ○  │    │ │
│ │ └─────────────────────────┘    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Footer (px-6 py-4, border-t) ──┐ │
│ │ [ Commencer le test ]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Dimensions
- **Height**: 85vh (85% of viewport height)
- **Max Width**: 100% (mobile-first)
- **Border Radius**: 24px (top corners only - rounded-t-3xl)
- **Icon Size**: 48px × 48px (h-12 w-12)
- **Icon Container**: 48px × 48px with gradient background

#### Spacing Structure
- **Header Padding**: px-6 pt-6 (24px horizontal, 24px top)
- **Content Padding**: px-6 (24px horizontal, scrollable)
- **Footer Padding**: px-6 py-4 (24px horizontal, 16px vertical)
- **Section Gap**: 24px (space-y-6)
- **Toggle Gap**: 12px (space-y-3)

#### Question Count Slider
```css
.slider {
  width: 100%;
  height: 4px;
  border-radius: 9999px;
  background: var(--border);
  accent-color: var(--primary);
}

.slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
}
```

#### Toggle Switch
```css
.switch {
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: var(--input);
  transition: background 200ms;
}

.switch[data-state="checked"] {
  background: var(--primary);
}

.switch-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transform: translateX(0);
  transition: transform 200ms;
}

.switch[data-state="checked"] .switch-thumb {
  transform: translateX(20px);
}
```

#### Answer Direction Selection
```css
.answer-option {
  border: 2px solid var(--border);
  padding: 16px;
  border-radius: 8px;
  transition: all 200ms;
}

.answer-option:hover {
  border-color: var(--primary) / 0.5;
}

.answer-option.selected {
  border-color: var(--primary);
  background: var(--primary) / 0.05;
}
```

### 2. Test Question Interface

#### Layout - Multiple Choice
```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Progress bar
│                                     │
│ 3/20                                │ ← Counter
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What is the cell cycle?         │ │ ← Question
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ (A) Option 1                │ │ │
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
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Layout - True/False
```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 7/20                                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Chromosomes contain DNA.        │ │
│ │                                 │ │
│ │ ┌──────────┐ ┌──────────┐      │ │
│ │ │   Vrai   │ │   Faux   │      │ │
│ │ └──────────┘ └──────────┘      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Layout - Written Answer
```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 12/20                               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What is chromatin?              │ │
│ │                                 │ │
│ │ Choisissez la bonne réponse     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Tapez la réponse...         │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Dimensions
- **Progress Bar Height**: 4px (h-1)
- **Progress Counter**: text-sm, centered
- **Card Padding**: 24px (p-6)
- **Option Height**: Auto (min 48px)
- **Option Gap**: 12px (gap-3)
- **Letter Circle**: 32px × 32px (h-8 w-8)
- **True/False Buttons**: Auto width, 48px padding

#### Progress Bar Animation
```css
.progress-bar {
  height: 4px;
  width: 100%;
  background: var(--border);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--streak-from), var(--streak-to));
  transition: width 300ms ease-out;
}
```

#### Option States (No Feedback)

##### Default State
```css
.option {
  border: 2px solid var(--border);
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  transition: all 150ms;
}

.option:hover {
  border-color: var(--primary) / 0.5;
  background: var(--accent);
}
```

##### Selected State (Brief)
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

##### After Answer (Dimmed)
```css
.option.answered {
  opacity: 0.75;
  cursor: default;
}
```

### 3. Test Loading Screen

#### Layout
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         ⟳ (rotating spinner)        │
│      (gradient background)          │
│                                     │
│  Un instant. Nous compilons vos     │
│         résultats.                  │
│                                     │
│  Analyse de vos réponses en cours...│
│                                     │
│            • • •                    │
│        (animated dots)              │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### Dimensions
- **Spinner Size**: 96px × 96px (h-24 w-24)
- **Icon Size**: 48px (h-12 w-12)
- **Title Size**: text-2xl (24px)
- **Subtitle Size**: text-base (16px)
- **Dot Size**: 12px × 12px (h-3 w-3)
- **Dot Gap**: 8px (gap-2)

#### Animations
```css
/* Spinner rotation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 2s linear infinite;
}

/* Dot pulse */
@keyframes pulse {
  0%, 100% { 
    scale: 1;
    opacity: 0.3;
  }
  50% { 
    scale: 1.5;
    opacity: 1;
  }
}

.dot {
  animation: pulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}
```

### 4. Test Summary Screen

#### Layout
```
┌─────────────────────────────────────┐
│ 20/20                               │ ← Header
├─────────────────────────────────────┤
│            🎉                        │ ← Emoji
│  Vous êtes en train d'apprendre !   │
│                                     │
│ ┌─ Vos résultats ─────────────────┐ │
│ │   ⭕ 35%                         │ │ ← Donut chart
│ │  (circular progress)            │ │
│ │                                 │ │
│ │  ✓ Correct        7             │ │
│ │    (green badge)                │ │
│ │                                 │ │
│ │  ✗ Incorrect     13             │ │
│ │    (red badge)                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Prochaines étapes                   │
│ ┌─────────────────────────────────┐ │
│ │ 🔄 Révisez les 13 termes manqués│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🔒 Effectuer un nouveau test    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Vos réponses (Afficher)             │
│ ┌─────────────────────────────────┐ │
│ │ What two-rod structures...      │ │
│ │ ✗ Votre réponse: Ribosomes      │ │
│ │ ✓ Réponse correcte: Chromosomes │ │
│ │ [ Incorrect ]                   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ What is a chromatid?            │ │
│ │ ✓ One of two identical...       │ │
│ │ [ Correct ]                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Dimensions
- **Emoji Size**: 80px (text-8xl)
- **Title Size**: text-3xl (30px)
- **Donut Chart**: 128px × 128px (h-32 w-32)
- **Score Text**: text-3xl (30px)
- **Stat Icons**: 40px × 40px (h-10 w-10)
- **Stat Numbers**: text-2xl (24px)
- **Badge Size**: Auto with px-2 py-0.5

#### Donut Chart SVG
```html
<svg class="h-32 w-32 -rotate-90 transform">
  <!-- Background circle -->
  <circle
    cx="64"
    cy="64"
    r="56"
    stroke="currentColor"
    stroke-width="12"
    fill="none"
    class="text-border"
  />
  
  <!-- Correct answers arc (green) -->
  <circle
    cx="64"
    cy="64"
    r="56"
    stroke="currentColor"
    stroke-width="12"
    fill="none"
    stroke-dasharray="[correct_percentage * 351.86] 351.86"
    class="text-success transition-all duration-1000"
    stroke-linecap="round"
  />
  
  <!-- Incorrect answers arc (red) -->
  <circle
    cx="64"
    cy="64"
    r="56"
    stroke="currentColor"
    stroke-width="12"
    fill="none"
    stroke-dasharray="[incorrect_percentage * 351.86] 351.86"
    stroke-dashoffset="-[correct_percentage * 351.86]"
    class="text-error transition-all duration-1000"
    stroke-linecap="round"
  />
</svg>
```

**Calculation**:
- Circle circumference: 2πr = 2 × π × 56 = 351.86
- Correct arc length: (correct / total) × 351.86
- Incorrect arc length: (incorrect / total) × 351.86
- Incorrect offset: -(correct / total) × 351.86

#### Answer Review Card States

##### Correct Answer
```css
.answer-card.correct {
  border: 2px solid var(--success-to) / 0.2;
}

.answer-badge.correct {
  background: linear-gradient(to bottom right, var(--success-from), var(--success-to));
  color: white;
}
```

##### Incorrect Answer
```css
.answer-card.incorrect {
  border: 2px solid var(--error-to) / 0.2;
}

.answer-badge.incorrect {
  background: linear-gradient(to bottom right, var(--error-from), var(--error-to));
  color: white;
}
```

## Animation Specifications

### Entrance Animations

#### Settings Sheet
```typescript
// Slide up from bottom
initial={{ y: '100%' }}
animate={{ y: 0 }}
transition={{ type: 'spring', damping: 30 }}
```

#### Question Card
```typescript
// Fade in with slight upward movement
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

#### Options (Staggered)
```typescript
// Each option animates with delay
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
```

#### Loading Screen
```typescript
// Spinner scale in
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', duration: 0.6 }}

// Spinner rotation
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}

// Text fade in
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
```

#### Summary Screen
```typescript
// Emoji rotation
initial={{ rotate: 0 }}
animate={{ rotate: 360 }}
transition={{ duration: 0.8, delay: 0.2 }}

// Donut chart animation
transition={{ duration: 1, delay: 0.3 }}

// Answer cards (staggered)
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
```

### Transition Timing

```css
/* Quick interactions */
.option:hover {
  transition: all 150ms ease-in-out;
}

/* Progress bar */
.progress-fill {
  transition: width 300ms ease-out;
}

/* Loading dots */
.dot {
  transition: all 1.5s ease-in-out;
}

/* Summary stats */
.stat-circle {
  transition: all 1000ms ease-out;
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile (default) */
@media (min-width: 0px) {
  .test-container {
    padding: 16px;
    max-width: 100%;
  }
}

/* Tablet */
@media (min-width: 640px) {
  .test-container {
    padding: 24px;
    max-width: 640px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .test-container {
    max-width: 768px;
  }
  
  .summary-container {
    max-width: 896px; /* max-w-2xl */
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
<div role="progressbar" aria-valuenow={current} aria-valuemax={total}>
  {current} / {total}
</div>

<button aria-label="Option A: Chromosomes">
  <span aria-hidden="true">A</span>
  Chromosomes
</button>

<div role="status" aria-live="polite">
  Test terminé. Calcul des résultats...
</div>
```

## Dark Mode Adaptations

### Color Adjustments
```css
.dark {
  /* Streak Colors (Dark) */
  --streak-from: oklch(0.65 0.22 45);
  --streak-to: oklch(0.5 0.26 25);
  --streak-bg: oklch(0.22 0.04 45);

  /* Success Colors (Dark) */
  --success-from: oklch(0.6 0.2 145);
  --success-to: oklch(0.5 0.22 155);
  --success-bg: oklch(0.2 0.04 145);

  /* Error Colors (Dark) */
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
- Answer cards rendered on demand
- Images loaded progressively
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
  '3xl': '32px',
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
**Inspiration**: Quizlet Test Mode
**Color Theme**: Streak (Orange/Amber)
