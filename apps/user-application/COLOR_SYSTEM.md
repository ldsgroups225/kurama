# Kurama Color System

This document describes the semantic color system for Kurama, replacing inline color values with reusable utility classes.

## Overview

The color system is defined in `src/styles.css` with CSS custom properties that automatically adapt to light and dark themes. All colors use OKLCH color space for better perceptual uniformity.

## Gamification Colors

### XP System (Blue)
Used for experience points, progress bars, and general rewards.

**Classes:**
- `bg-gradient-xp` - Diagonal gradient (bottom-right)
- `bg-gradient-xp-horizontal` - Horizontal gradient
- `text-xp` - Text color
- `bg-xp` - Solid background

**Usage:**
```tsx
// Replace: bg-linear-to-br from-blue-400 to-blue-600
<div className="bg-gradient-xp">+50 XP</div>

// Replace: bg-linear-to-r from-blue-400 to-blue-600
<div className="bg-gradient-xp-horizontal h-2 w-full" />

// Replace: text-blue-600
<span className="text-xp">Experience</span>

// Replace: bg-blue-50 dark:bg-blue-950/20
<div className="bg-xp">Background</div>
```

### Level/Achievement System (Amber/Orange)
Used for level badges, legendary achievements, and major milestones.

**Classes:**
- `bg-gradient-level` - Diagonal gradient
- `bg-gradient-level-horizontal` - Horizontal gradient
- `text-level` - Text color
- `bg-level` - Solid background

**Usage:**
```tsx
// Replace: bg-linear-to-br from-amber-400 to-orange-500
<div className="bg-gradient-level">Level 5</div>

// Replace: bg-linear-to-r from-amber-400 to-orange-500
<div className="bg-gradient-level-horizontal h-2 w-full" />

// Replace: text-amber-500
<span className="text-level">Niveau</span>

// Replace: bg-amber-50 dark:bg-amber-950/20
<div className="bg-level">Background</div>
```

### Streak System (Orange/Red)
Used for daily streaks, fire icons, and consistency rewards.

**Classes:**
- `bg-gradient-streak` - Diagonal gradient
- `bg-gradient-streak-horizontal` - Horizontal gradient
- `text-streak` - Text color
- `bg-streak` - Solid background

**Usage:**
```tsx
// Replace: bg-linear-to-br from-orange-400 to-red-500
<div className="bg-gradient-streak">
  <Flame className="h-6 w-6 text-white" />
</div>

// Replace: bg-linear-to-r from-orange-400 to-red-500
<div className="bg-gradient-streak-horizontal h-2 w-full" />
```

### Achievement Rarities

#### Rare (Blue)
**Classes:**
- `bg-gradient-rare` - Diagonal gradient
- `bg-gradient-rare-horizontal` - Horizontal gradient
- `text-rare` - Text color
- `bg-rare` - Solid background

#### Epic (Purple)
**Classes:**
- `bg-gradient-epic` - Diagonal gradient
- `bg-gradient-epic-horizontal` - Horizontal gradient
- `text-epic` - Text color
- `bg-epic` - Solid background

#### Legendary (Gold)
**Classes:**
- `bg-gradient-legendary` - Diagonal gradient
- `bg-gradient-legendary-horizontal` - Horizontal gradient
- `text-legendary` - Text color
- `bg-legendary` - Solid background

#### Common (Gray)
**Classes:**
- `bg-gradient-common` - Diagonal gradient
- `bg-gradient-common-horizontal` - Horizontal gradient

**Usage:**
```tsx
// Achievement badge based on rarity
const rarityClasses = {
  common: "bg-gradient-common",
  rare: "bg-gradient-rare",
  epic: "bg-gradient-epic",
  legendary: "bg-gradient-legendary",
};

<div className={rarityClasses[achievement.rarity]}>
  <Icon className="h-9 w-9 text-white" />
</div>
```

## Status Colors

### Success (Green)
Used for completed tasks, correct answers, and positive feedback.

**Classes:**
- `bg-gradient-success` - Diagonal gradient
- `bg-gradient-success-horizontal` - Horizontal gradient
- `text-success` - Text color
- `bg-success` - Solid background

**Usage:**
```tsx
// Replace: bg-green-500/10 text-green-600
<Badge className="bg-success text-success">
  <TrendingUp className="h-3 w-3" />
  +5
</Badge>
```

### Warning (Yellow/Orange)
Used for cautions, reminders, and moderate alerts.

**Classes:**
- `bg-gradient-warning` - Diagonal gradient
- `bg-gradient-warning-horizontal` - Horizontal gradient
- `text-warning` - Text color
- `bg-warning` - Solid background

### Error (Red)
Used for errors, incorrect answers, and critical alerts.

**Classes:**
- `bg-gradient-error` - Diagonal gradient
- `bg-gradient-error-horizontal` - Horizontal gradient
- `text-error` - Text color
- `bg-error` - Solid background

**Usage:**
```tsx
// Replace: bg-red-500/10 text-red-600
<Badge className="bg-error text-error">
  <TrendingDown className="h-3 w-3" />
  -3
</Badge>
```

### Info (Blue)
Used for informational messages and neutral notifications.

**Classes:**
- `bg-gradient-info` - Diagonal gradient
- `bg-gradient-info-horizontal` - Horizontal gradient
- `text-info` - Text color
- `bg-info` - Solid background

## Migration Guide

### Before (Inline Colors)
```tsx
// Level Badge
<div className="bg-linear-to-br from-amber-400 to-orange-500">
  <span className="text-white">{level}</span>
</div>

// Progress Bar
<div className="bg-linear-to-r from-amber-400 to-orange-500" />

// Background
<div className="bg-amber-50 dark:bg-amber-950/20">
  Content
</div>

// Achievement Badge
<div className={cn(
  "bg-linear-to-br",
  achievement.rarity === "rare" && "from-blue-400 to-blue-600",
  achievement.rarity === "epic" && "from-purple-400 to-purple-600",
  achievement.rarity === "legendary" && "from-amber-400 to-orange-500"
)}>
  <Icon />
</div>
```

### After (Semantic Classes)
```tsx
// Level Badge
<div className="bg-gradient-level">
  <span className="text-white">{level}</span>
</div>

// Progress Bar
<div className="bg-gradient-level-horizontal" />

// Background
<div className="bg-level">
  Content
</div>

// Achievement Badge
const rarityGradients = {
  rare: "bg-gradient-rare",
  epic: "bg-gradient-epic",
  legendary: "bg-gradient-legendary",
};

<div className={rarityGradients[achievement.rarity]}>
  <Icon />
</div>
```

## Benefits

1. **Consistency**: All components use the same color values
2. **Theme Support**: Automatically adapts to light/dark mode
3. **Maintainability**: Change colors in one place
4. **Readability**: Semantic names are easier to understand
5. **Type Safety**: Can create TypeScript types for color names
6. **Performance**: Reusable classes reduce CSS bundle size

## Color Mapping Reference

| Old Inline Style | New Utility Class |
|-----------------|-------------------|
| `from-blue-400 to-blue-600` | `bg-gradient-xp` |
| `from-amber-400 to-orange-500` | `bg-gradient-level` |
| `from-orange-400 to-red-500` | `bg-gradient-streak` |
| `from-purple-400 to-purple-600` | `bg-gradient-epic` |
| `from-gray-400 to-gray-500` | `bg-gradient-common` |
| `bg-blue-50 dark:bg-blue-950/20` | `bg-xp` |
| `bg-amber-50 dark:bg-amber-950/20` | `bg-level` |
| `bg-green-500/10 text-green-600` | `bg-success text-success` |
| `bg-red-500/10 text-red-600` | `bg-error text-error` |

## Extending the System

To add new colors, edit `src/styles.css`:

1. Add CSS custom properties in `:root` and `.dark`
2. Add color tokens in `@theme inline`
3. Add utility classes in `@layer utilities`

Example:
```css
:root {
  --new-color-from: oklch(0.7 0.2 180);
  --new-color-to: oklch(0.6 0.22 190);
  --new-color-bg: oklch(0.95 0.03 180);
}

.dark {
  --new-color-from: oklch(0.65 0.22 180);
  --new-color-to: oklch(0.55 0.24 190);
  --new-color-bg: oklch(0.20 0.04 180);
}

@theme inline {
  --color-new-color-from: var(--new-color-from);
  --color-new-color-to: var(--new-color-to);
  --color-new-color-bg: var(--new-color-bg);
}

@layer utilities {
  .bg-gradient-new-color {
    background: linear-gradient(to bottom right, var(--new-color-from), var(--new-color-to));
  }
}
```

## Next Steps

1. Update gamification components to use new classes
2. Update landing page components
3. Update main app components
4. Remove inline color utilities from codebase
5. Add TypeScript types for color names (optional)
