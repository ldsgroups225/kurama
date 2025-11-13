# Gamification Components - Visual Reference Guide

## Component Previews

### 1. Level Badge (Full Size)

```
┌─────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════╗ │
│  ║  ⭐                                         ║ │
│  ║   ╭─────╮    Niveau 12                     ║ │
│  ║   │ 12  │    [550 XP restants]             ║ │
│  ║   ╰─────╯                                   ║ │
│  ║            ████████████░░░░░░░░  81%        ║ │
│  ║            2450 XP          3000 XP         ║ │
│  ╚════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────┘
```

**Colors**: Amber/Orange gradient badge, primary color progress bar
**Size**: Full width, 80px height
**Animation**: Sparkle pulse, progress bar fill

### 2. Level Badge (Compact)

```
┌─────────────────────────────────────────────────┐
│  ⭐╭───╮  Niveau 12      2450/3000 XP          │
│    │12 │  ████████████░░░░░░░░                 │
│    ╰───╯                                        │
└─────────────────────────────────────────────────┘
```

**Colors**: Same as full size
**Size**: Full width, 40px height
**Use**: Header integration

### 3. Achievement Badge (Unlocked - Rare)

```
┌──────────────────┐
│                  │
│   ╭────────╮     │
│   │  🔥    │     │ [Rare]
│   ╰────────╯     │
│                  │
│  Série de Feu    │
│  Maintenez une   │
│  série de 7 jours│
│                  │
│  Débloqué le     │
│  01/02/2024      │
└──────────────────┘
```

**Colors**: Blue gradient for Rare
**Badge**: 80px circle
**Rarity Label**: Blue badge

### 4. Achievement Badge (Locked - Legendary)

```
┌──────────────────┐
│                  │
│   ╭────────╮     │
│   │  🔒    │     │
│   ╰────────╯     │
│                  │
│  Étudiant        │
│  Légendaire      │
│  Atteignez le    │
│  niveau 50       │
│                  │
│  ████░░░░░░ 24%  │
│  12/50           │
└──────────────────┘
```

**Colors**: Gray for locked
**Progress**: Shows completion percentage

### 5. Achievement Showcase

```
┌─────────────────────────────────────────────────┐
│  🏆 Vos Badges                          [3/6]   │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  ⭐    │  │  🔥    │  │  🏆    │            │
│  │ Premier│  │ Série  │  │ Maître │            │
│  │  Pas   │  │de Feu  │  │du Quiz │            │
│  └────────┘  └────────┘  └────────┘            │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  🔒    │  │  🔒    │  │  🔒    │            │
│  │Étudiant│  │Mathéma-│  │ Fusée  │            │
│  │Légend. │  │ticien  │  │        │            │
│  └────────┘  └────────┘  └────────┘            │
│                                                  │
│         Voir tous les badges (6)                │
└─────────────────────────────────────────────────┘
```

**Layout**: 3-column grid
**Size**: Small badges (64px)

### 6. Streak Calendar

```
┌─────────────────────────────────────────────────┐
│  ╭────╮                                          │
│  │ 🔥 │  12                    🏆 Record: 28j   │
│  ╰────╯  jours de série                         │
│                                                  │
│   L    M    M    J    V    S    D               │
│  ░░░  ░░░  🔥   🔥   🔥   🔥   🔥               │
│  🔥   🔥   🔥   🔥   🔥   🔥   🔥               │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Continuez comme ça ! Vous êtes sur la    │   │
│  │ bonne voie 🚀                            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Colors**: Orange/Red gradient for flames
**Grid**: 7 columns × 2 rows
**Today**: Ring highlight

### 7. Leaderboard Widget

```
┌─────────────────────────────────────────────────┐
│  Classement Hebdomadaire        [Cette semaine] │
│                                                  │
│  🏆  👤 Aminata Koné                    ↑ +1    │
│      3,450 points                                │
│                                                  │
│  🥈  👤 Darius Kassi (Vous)             ↓ -1    │
│      3,240 points                                │
│                                                  │
│  🥉  👤 Fatou Traoré                    → 0     │
│      2,980 points                                │
│                                                  │
│  4   👤 Kouassi Yao                     ↑ +1    │
│      2,750 points                                │
│                                                  │
│  5   👤 Mariam Diallo                   ↓ -1    │
│      2,650 points                                │
│                                                  │
│         Voir le classement complet               │
└─────────────────────────────────────────────────┘
```

**Icons**: Trophy (1st), Medal (2nd), Award (3rd)
**Highlight**: Current user with primary color background
**Indicators**: Green ↑, Red ↓, Gray →

### 8. Reward Animation (Full Screen)

```
┌─────────────────────────────────────────────────┐
│                                                  │
│              ✨  ✨  ✨  ✨  ✨                  │
│         ✨                        ✨            │
│                                                  │
│              ╭──────────╮                        │
│              │          │                        │
│              │    🏆    │                        │
│              │          │                        │
│              ╰──────────╯                        │
│                                                  │
│           Nouveau Badge !                        │
│                                                  │
│               +100                               │
│                XP                                │
│                                                  │
│      Vous avez débloqué 'Maître du Quiz'        │
│                                                  │
│         ✨                        ✨            │
│              ✨  ✨  ✨  ✨  ✨                  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           [Continuer]                    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Background**: Gradient based on reward type
**Animation**: Floating sparkles, bouncing icon
**Overlay**: Backdrop blur

### 9. Gamification Summary

```
┌─────────────────────────────────────────────────┐
│                                                  │
│   ⭐        🏆        🔥        📈              │
│   12        8/20      12j       #2              │
│  Niveau    Badges    Série     Rang             │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│              Total XP                            │
│              15,450                              │
└─────────────────────────────────────────────────┘
```

**Layout**: 3-4 column grid
**Icons**: Color-coded circles
**Total XP**: Prominent display at bottom

## Color Reference

### Gradients

**Level/XP (Amber/Orange)**
```
from-amber-400 (#FBBF24) → to-orange-500 (#F97316)
```

**Common (Gray)**
```
from-gray-400 (#9CA3AF) → to-gray-500 (#6B7280)
```

**Rare (Blue)**
```
from-blue-400 (#60A5FA) → to-blue-600 (#2563EB)
```

**Epic (Purple)**
```
from-purple-400 (#C084FC) → to-purple-600 (#7C3AED)
```

**Legendary (Gold)**
```
from-amber-400 (#FBBF24) → to-orange-500 (#F97316)
```

**Streak (Orange/Red)**
```
from-orange-400 (#FB923C) → to-red-500 (#EF4444)
```

## Icon Reference

### Achievement Icons
- ⭐ Star - First steps, basics
- 🔥 Flame - Streaks, consistency
- 🏆 Trophy - Mastery, excellence
- 👑 Crown - Legendary achievements
- 🎯 Target - Goals, objectives
- 🚀 Rocket - Speed, progress
- 📚 Books - Learning, study
- 🎓 Graduation Cap - Completion
- 💪 Muscle - Effort, dedication
- ⚡ Lightning - Quick actions

### Status Icons
- 🔒 Lock - Locked achievements
- ✅ Check - Completed
- 📈 Trending Up - Rank increase
- 📉 Trending Down - Rank decrease
- ➡️ Arrow Right - No change
- ⏱️ Clock - Time-based
- 🔔 Bell - Notifications

## Spacing & Sizing

### Component Heights
- Level Badge (Full): 80px
- Level Badge (Compact): 40px
- Achievement Badge (Small): 120px
- Achievement Badge (Medium): 140px
- Achievement Badge (Large): 160px
- Leaderboard Entry: 64px
- Streak Calendar: ~280px

### Icon Sizes
- Small: 16px
- Medium: 20px
- Large: 24px
- Badge Icon (Small): 28px
- Badge Icon (Medium): 36px
- Badge Icon (Large): 44px
- Reward Icon: 48px

### Border Radius
- Cards: 12px
- Badges: Full circle (50%)
- Buttons: 8px
- Calendar cells: 8px
- Progress bars: 9999px (pill)

### Shadows
- Card: 0 1px 3px rgba(0,0,0,0.1)
- Card Hover: 0 10px 15px rgba(0,0,0,0.1)
- Badge: 0 4px 6px rgba(0,0,0,0.1)
- Modal: 0 20px 25px rgba(0,0,0,0.15)

## Animation Timings

### Micro-interactions
- Hover: 150ms ease-out
- Press: 100ms ease-in
- Focus: 200ms ease

### Progress
- XP Bar Fill: 500ms ease-out
- Level Up: 1000ms bounce
- Achievement Unlock: 800ms scale

### Celebrations
- Sparkle Float: 2-4s linear infinite
- Badge Bounce: 2s ease-in-out infinite
- Modal Enter: 300ms ease-out
- Modal Exit: 300ms ease-in

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Full-width components
- Compact badges
- Touch targets: 44px minimum

### Tablet (640px - 1024px)
- Two-column grid for stats
- Larger touch targets
- Side navigation option

### Desktop (> 1024px)
- Max width: 512px (centered)
- Hover states enabled
- Keyboard navigation
- Sidebar navigation

## State Variations

### Achievement States
1. **Locked**: Gray, lock icon, progress bar
2. **Unlocked**: Color gradient, achievement icon, date
3. **In Progress**: Color gradient, progress bar, count

### Leaderboard States
1. **Current User**: Primary background, highlighted
2. **Top 3**: Special icons (Trophy, Medal, Award)
3. **Others**: Standard display with rank number

### Streak States
1. **Active Day**: Flame icon, gradient background
2. **Missed Day**: Empty circle, muted background
3. **Today**: Ring highlight, special indicator

## Accessibility Features

### Visual
- Color contrast: 4.5:1 minimum
- Icons paired with text
- Progress bars with labels
- Focus indicators: 2px ring

### Keyboard
- Tab navigation
- Enter/Space activation
- Escape to close modals
- Arrow keys for lists

### Screen Readers
- ARIA labels on icons
- Progress announcements
- Achievement unlocks announced
- Rank changes announced

## Print Styles

Components are optimized for screen display. For print:
- Hide animations
- Use solid colors
- Increase contrast
- Remove interactive elements

## Dark Mode Support

All components support dark mode via CSS variables:
- Background colors adapt
- Text colors adjust
- Gradients remain vibrant
- Shadows soften

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: 14+
- Chrome Android: 90+

## Performance Notes

- Animations use CSS transforms (GPU accelerated)
- Images lazy loaded
- Components memoized
- Bundle size: ~45KB gzipped
- First paint: < 100ms
