# Color System Quick Reference

Quick lookup guide for using Kurama's semantic color system.

## Common Patterns

### Level Badges & Achievements
```tsx
// Level badge circle
<div className="bg-gradient-level">
  <span className="text-white">{level}</span>
</div>

// Progress bar
<div className="bg-gradient-level-horizontal" style={{ width: `${progress}%` }} />

// Background
<div className="bg-level">Content</div>

// Icon
<Sparkles className="text-level" />
```

### XP & Progress
```tsx
// XP badge
<div className="bg-gradient-xp">
  <Zap className="text-white" />
</div>

// XP progress bar
<div className="bg-gradient-xp-horizontal" style={{ width: `${xp}%` }} />

// XP text
<span className="text-xp">+50 XP</span>
```

### Streaks
```tsx
// Streak badge
<div className="bg-gradient-streak">
  <Flame className="text-white" />
</div>

// Streak calendar cell
<div className="bg-gradient-streak">
  <Flame className="text-white" />
</div>

// Streak text
<span className="text-streak">5 jours</span>
```

### Achievement Rarities
```tsx
const rarityGradients = {
  common: "bg-gradient-common",
  rare: "bg-gradient-rare",
  epic: "bg-gradient-epic",
  legendary: "bg-gradient-legendary",
};

// Achievement badge
<div className={rarityGradients[rarity]}>
  <Icon className="text-white" />
</div>

// Progress bar
<div className={`${rarityGradients[rarity]}-horizontal`} />
```

### Status Messages
```tsx
// Success
<Badge className="bg-success text-success">
  <Check className="h-3 w-3" />
  Réussi
</Badge>

// Error
<Badge className="bg-error text-error">
  <X className="h-3 w-3" />
  Erreur
</Badge>

// Warning
<Badge className="bg-warning text-warning">
  <AlertTriangle className="h-3 w-3" />
  Attention
</Badge>

// Info
<Badge className="bg-info text-info">
  <Info className="h-3 w-3" />
  Information
</Badge>
```

## Color Cheat Sheet

| Use Case | Class | Color |
|----------|-------|-------|
| XP/Progress | `bg-gradient-xp` | Blue |
| Levels | `bg-gradient-level` | Amber/Orange |
| Streaks | `bg-gradient-streak` | Orange/Red |
| Rare | `bg-gradient-rare` | Blue |
| Epic | `bg-gradient-epic` | Purple |
| Legendary | `bg-gradient-legendary` | Gold |
| Common | `bg-gradient-common` | Gray |
| Success | `bg-gradient-success` | Green |
| Warning | `bg-gradient-warning` | Yellow |
| Error | `bg-gradient-error` | Red |
| Info | `bg-gradient-info` | Cyan |

## Gradient Variants

Every gradient has two variants:

1. **Diagonal** (default): `bg-gradient-{name}` - Goes from top-left to bottom-right
2. **Horizontal**: `bg-gradient-{name}-horizontal` - Goes from left to right

Use diagonal for badges, cards, and backgrounds.
Use horizontal for progress bars and loading indicators.

## Text Colors

Every gradient has a corresponding text color:

```tsx
<span className="text-xp">XP text</span>
<span className="text-level">Level text</span>
<span className="text-streak">Streak text</span>
<span className="text-rare">Rare text</span>
<span className="text-epic">Epic text</span>
<span className="text-legendary">Legendary text</span>
<span className="text-success">Success text</span>
<span className="text-warning">Warning text</span>
<span className="text-error">Error text</span>
<span className="text-info">Info text</span>
```

## Background Colors

Subtle background colors for cards and sections:

```tsx
<div className="bg-xp">XP background</div>
<div className="bg-level">Level background</div>
<div className="bg-streak">Streak background</div>
<div className="bg-rare">Rare background</div>
<div className="bg-epic">Epic background</div>
<div className="bg-legendary">Legendary background</div>
<div className="bg-success">Success background</div>
<div className="bg-warning">Warning background</div>
<div className="bg-error">Error background</div>
<div className="bg-info">Info background</div>
```

## Don't Use

❌ **Avoid these patterns:**
```tsx
// Don't use inline color values
<div className="from-blue-400 to-blue-600">
<span className="text-amber-500">
<div className="bg-purple-500/10">

// Don't use bg-linear-to-* directly
<div className="bg-linear-to-br from-amber-400 to-orange-500">
```

✅ **Use semantic classes instead:**
```tsx
// Use semantic utility classes
<div className="bg-gradient-xp">
<span className="text-level">
<div className="bg-epic">

// Use predefined gradients
<div className="bg-gradient-level">
```

## Theme Support

All colors automatically adapt to light and dark themes. No need to add dark: variants!

```tsx
// ✅ This works in both themes
<div className="bg-level">
  <span className="text-level">Level 5</span>
</div>

// ❌ Don't do this
<div className="bg-amber-50 dark:bg-amber-950/20">
  <span className="text-amber-500 dark:text-amber-400">Level 5</span>
</div>
```

## Examples from Real Components

### Level Badge (Compact)
```tsx
<div className="flex items-center gap-2">
  <div className="h-10 w-10 rounded-full bg-gradient-level">
    <span className="text-white">{level}</span>
  </div>
  <div className="flex-1">
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className="bg-gradient-level-horizontal" style={{ width: `${progress}%` }} />
    </div>
  </div>
</div>
```

### Achievement Badge
```tsx
<div className="bg-gradient-legendary rounded-full">
  <Trophy className="text-white" />
</div>
<Badge className="bg-gradient-legendary text-white">
  Légendaire
</Badge>
```

### Streak Calendar
```tsx
<div className="bg-gradient-streak rounded-full">
  <Flame className="text-white" />
</div>
```

### Leaderboard Rank Change
```tsx
{change > 0 ? (
  <Badge className="bg-success text-success">
    <TrendingUp className="h-3 w-3" />
    +{change}
  </Badge>
) : (
  <Badge className="bg-error text-error">
    <TrendingDown className="h-3 w-3" />
    {change}
  </Badge>
)}
```

## Need Help?

- Full documentation: `COLOR_SYSTEM.md`
- Migration guide: `MIGRATION_SUMMARY.md`
- Styles source: `src/styles.css`
