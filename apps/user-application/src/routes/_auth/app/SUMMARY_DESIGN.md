# Summary Screen - Design Specification

## Overview

The summary screen provides engaging feedback to young students after completing a learning session, celebrating their achievements and motivating continued learning.

## Design Principles

### 1. Celebration First
- Lead with positive reinforcement
- Animated trophy/icon for visual impact
- Large, bold score display
- Motivational messages based on performance

### 2. Clear Visual Hierarchy
- Performance level (largest, most prominent)
- Score percentage (secondary focus)
- Detailed stats (supporting information)
- Action buttons (clear next steps)

### 3. Age-Appropriate Design
- Bright, engaging colors
- Emoji for emotional connection
- Simple, clear language
- Encouraging tone throughout

## Layout Structure

```
┌─────────────────────────────────────┐
│ Header: "Résumé"                    │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Performance Icon (animated) ───┐ │
│ │     🏆 (28x28, rotating)        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Performance Level ──────────────┐ │
│ │   "Excellent!" (3xl, bold)      │ │
│ │   "Session terminée" (base)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Score Card ─────────────────────┐ │
│ │ ┌─ Header (gradient) ──────────┐ │ │
│ │ │      85%                     │ │ │
│ │ │   Score final                │ │ │
│ │ └──────────────────────────────┘ │ │
│ │ ┌─ Stats Grid ─────────────────┐ │ │
│ │ │  ✓ 3      ✗ 1               │ │ │
│ │ │  Correctes  Incorrectes      │ │ │
│ │ └──────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Time & Cards Grid ──────────────┐ │
│ │  🕐 0:30    🎯 4                │ │
│ │  Temps      Cartes              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ XP Card (gradient) ─────────────┐ │
│ │      +30 XP 🎉                  │ │
│ │   Points d'expérience gagnés    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Motivational Message ───────────┐ │
│ │ 🌟 Performance exceptionnelle ! │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Recommencer ]                     │
│ [ Retour à l'accueil ]              │
│                                     │
└─────────────────────────────────────┘
```

## Spacing & Dimensions

### Container
- **Max Width**: 512px (max-w-lg)
- **Horizontal Padding**: 24px (px-6)
- **Vertical Padding**: 32px top, 96px bottom (py-8 pb-24)
- **Gap Between Sections**: 24px (space-y-6)

### Performance Icon
- **Size**: 112px × 112px (h-28 w-28)
- **Icon Size**: 56px (h-14 w-14)
- **Shadow**: shadow-xl
- **Animation**: 360° rotation over 0.8s

### Performance Text
- **Title Size**: 30px (text-3xl)
- **Subtitle Size**: 16px (text-base)
- **Gap**: 8px (space-y-2)

### Score Card
- **Border**: 2px solid
- **Header Padding**: 32px vertical (pb-8 pt-8)
- **Content Padding**: 24px horizontal, 32px vertical (px-6 py-8)
- **Score Size**: 48px (text-5xl)
- **Label Size**: 16px (text-base)

### Stats Icons
- **Circle Size**: 64px × 64px (h-16 w-16)
- **Icon Size**: 32px (h-8 w-8)
- **Number Size**: 30px (text-3xl)
- **Label Size**: 14px (text-sm)
- **Gap**: 12px (space-y-3)

### Time/Cards Grid
- **Icon Circle**: 48px × 48px (h-12 w-12)
- **Icon Size**: 24px (h-6 w-6)
- **Number Size**: 24px (text-2xl)
- **Label Size**: 14px (text-sm)
- **Card Padding**: 16px horizontal, 24px vertical (px-4 py-6)

### XP Card
- **Padding**: 24px horizontal, 32px vertical (px-6 py-8)
- **XP Size**: 48px (text-5xl)
- **Label Size**: 16px (text-base)
- **Border**: 2px solid xp color

## Color System

### Performance Levels

#### Excellent (≥90%)
```css
--icon-gradient: bg-gradient-level
--text-color: text-success
--icon: Trophy
--message: "🌟 Performance exceptionnelle !"
```

#### Très bien (70-89%)
```css
--icon-gradient: bg-gradient-level
--text-color: text-level
--icon: TrendingUp
--message: "💪 Très bon travail !"
```

#### Bon travail (50-69%)
```css
--icon-gradient: bg-gradient-level
--text-color: text-info
--icon: Target
--message: None (neutral)
```

#### Continue à pratiquer (<50%)
```css
--icon-gradient: bg-gradient-level
--text-color: text-warning
--icon: Target
--message: "📚 N'abandonne pas ! La pratique rend parfait."
```

### Component Colors

#### Score Card Header
```css
background: linear-gradient(to right, var(--level-from), var(--level-to));
color: white;
```

#### Correct Stats
```css
background: linear-gradient(to bottom right, var(--success-from), var(--success-to));
icon-color: white;
```

#### Incorrect Stats
```css
background: linear-gradient(to bottom right, var(--error-from), var(--error-to));
icon-color: white;
```

#### Time/Cards Icons
```css
background: var(--info-bg);
icon-color: white;
```

#### XP Card
```css
background: linear-gradient(to right, var(--xp-from), var(--xp-to));
border: 2px solid var(--xp-to);
color: white;
shadow: shadow-xl;
```

## Animation Specifications

### Performance Icon
```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', duration: 0.6 }}

// Rotation animation
initial={{ rotate: 0 }}
animate={{ rotate: 360 }}
transition={{ duration: 0.8, delay: 0.2 }}
```

### Score Card
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
```

### Stats Grid
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
```

### XP Card
```typescript
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.4, type: 'spring' }}

// XP number pulse
initial={{ scale: 1 }}
animate={{ scale: [1, 1.1, 1] }}
transition={{ duration: 0.6, delay: 0.5 }}
```

### Motivational Message
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.5 }}
```

### Action Buttons
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.6 }}
```

## Motivational Messages

### High Performance (≥90%)
```
🌟 Performance exceptionnelle ! Tu es sur la bonne voie !
```
- **Background**: success/10 opacity
- **Text Color**: text-success
- **Border Radius**: rounded-xl
- **Padding**: 16px (p-4)

### Good Performance (70-89%)
```
💪 Très bon travail ! Continue comme ça !
```
- **Background**: success/10 opacity
- **Text Color**: text-success

### Needs Practice (<50%)
```
📚 N'abandonne pas ! La pratique rend parfait. Essaie encore !
```
- **Background**: warning/10 opacity
- **Text Color**: text-warning

## Button Specifications

### Primary Button (Recommencer)
```css
size: lg (48px height)
width: 100% (w-full)
background: linear-gradient(to right, var(--xp-from), var(--xp-to))
font-size: 18px (text-lg)
font-weight: 600 (font-semibold)
shadow: shadow-lg
icon-size: 20px (h-5 w-5)
icon-margin: 8px (mr-2)
```

### Secondary Button (Retour)
```css
size: lg (48px height)
width: 100% (w-full)
variant: outline
border: 2px solid (border-2)
icon-size: 20px (h-5 w-5)
icon-margin: 8px (mr-2)
```

## Responsive Behavior

### Mobile (default)
- Single column layout
- Full width cards
- 24px horizontal padding
- Stacked buttons

### Tablet (≥640px)
- Centered content (max-w-lg)
- Same layout structure
- Increased touch targets

### Desktop (≥1024px)
- Centered content (max-w-lg)
- Hover states on buttons
- Smooth transitions

## Accessibility

### Screen Reader Support
```html
<div role="status" aria-live="polite">
  Score: 85%
  3 réponses correctes
  1 réponse incorrecte
</div>
```

### Keyboard Navigation
- All buttons keyboard accessible
- Logical tab order
- Focus indicators visible

### Color Contrast
- All text meets WCAG 2.1 AA standards
- Icons have sufficient contrast
- Gradients maintain readability

## Performance Considerations

### Animation Performance
- Use GPU-accelerated properties (transform, opacity)
- Stagger animations to avoid jank
- Total animation duration: ~1.2s

### Image Optimization
- Icons from Lucide React (tree-shakeable)
- No external images required
- Minimal bundle impact

## Dark Mode Support

All colors automatically adapt via CSS variables:
- Background colors adjust
- Text colors maintain contrast
- Gradients remain vibrant
- Shadows adapt to dark theme

## Future Enhancements

### Phase 1 (Current)
- ✅ Performance-based feedback
- ✅ Animated celebrations
- ✅ Motivational messages
- ✅ XP display

### Phase 2 (Planned)
- [ ] Share results feature
- [ ] Detailed answer review
- [ ] Progress comparison chart
- [ ] Achievement unlocks
- [ ] Streak tracking
- [ ] Leaderboard position

### Phase 3 (Advanced)
- [ ] Personalized recommendations
- [ ] Study tips based on performance
- [ ] Time-of-day insights
- [ ] Difficulty adjustment suggestions

---

**Design System**: Kurama v1.0
**Last Updated**: November 15, 2025
**Status**: ✅ Implemented
**Target Audience**: Students (ages 10-18)
