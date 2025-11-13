# Gamification Quick Start Guide

Get up and running with Kurama's gamification system in 5 minutes.

## Installation

The gamification components are already installed and ready to use. No additional dependencies required!

## Basic Usage

### 1. Import Components

```tsx
import {
  LevelBadge,
  AchievementShowcase,
  StreakCalendar,
  LeaderboardWidget,
  RewardAnimation,
  type Achievement,
  type LeaderboardEntry,
  type Reward
} from "@/components/gamification";
```

### 2. Add to Your Page

```tsx
function MyPage() {
  return (
    <div className="space-y-6">
      {/* Show user's level */}
      <LevelBadge
        level={12}
        currentXP={2450}
        nextLevelXP={3000}
      />

      {/* Show achievements */}
      <AchievementShowcase
        achievements={myAchievements}
      />

      {/* Show streak */}
      <StreakCalendar
        currentStreak={12}
        longestStreak={28}
        streakHistory={streakData}
      />

      {/* Show leaderboard */}
      <LeaderboardWidget
        entries={leaderboardData}
        currentUserId="user-123"
      />
    </div>
  );
}
```

### 3. Show Reward Animation

```tsx
function MyComponent() {
  const [showReward, setShowReward] = useState(false);

  const handleSuccess = () => {
    setShowReward(true);
  };

  return (
    <>
      <button onClick={handleSuccess}>Complete Task</button>

      <RewardAnimation
        reward={{
          type: "xp",
          title: "Bien joué !",
          description: "Vous avez gagné des points",
          value: 50
        }}
        show={showReward}
        onClose={() => setShowReward(false)}
      />
    </>
  );
}
```

## Common Patterns

### Pattern 1: Dashboard Overview

```tsx
import { GamificationSummary } from "@/components/gamification";

<GamificationSummary
  level={12}
  totalXP={15450}
  achievementsUnlocked={8}
  totalAchievements={20}
  currentStreak={12}
  weeklyRank={2}
/>
```

### Pattern 2: Header Integration

```tsx
import { AppHeader } from "@/components/main";

<AppHeader
  showLevel={true}
  userLevel={{
    level: 12,
    currentXP: 2450,
    nextLevelXP: 3000
  }}
/>
```

### Pattern 3: Achievement Grid

```tsx
const achievements: Achievement[] = [
  {
    id: "1",
    name: "Premier Pas",
    description: "Complétez votre première leçon",
    icon: Star,
    color: "from-blue-400 to-blue-600",
    unlocked: true,
    rarity: "common"
  }
];

<AchievementShowcase
  achievements={achievements}
  maxDisplay={6}
/>
```

## Data Fetching Example

```tsx
import { useQuery } from "@tanstack/react-query";

function Dashboard() {
  // Fetch user level
  const { data: level } = useQuery({
    queryKey: ["user", "level"],
    queryFn: () => fetch("/api/user/level").then(r => r.json())
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => fetch("/api/achievements").then(r => r.json())
  });

  if (!level || !achievements) return <Loading />;

  return (
    <div className="space-y-6">
      <LevelBadge {...level} />
      <AchievementShowcase achievements={achievements} />
    </div>
  );
}
```

## Triggering Rewards

```tsx
function QuizComplete() {
  const [reward, setReward] = useState<Reward | null>(null);

  const handleQuizSubmit = async (score: number) => {
    // Award XP
    const xp = score === 100 ? 75 : 50;
    await fetch("/api/user/xp", {
      method: "POST",
      body: JSON.stringify({ xp })
    });

    // Show reward
    setReward({
      type: "xp",
      title: score === 100 ? "Parfait !" : "Bien joué !",
      description: `Quiz complété avec ${score}%`,
      value: xp
    });
  };

  return (
    <>
      <QuizForm onSubmit={handleQuizSubmit} />
      {reward && (
        <RewardAnimation
          reward={reward}
          show={!!reward}
          onClose={() => setReward(null)}
        />
      )}
    </>
  );
}
```

## Styling

All components use Tailwind CSS and respect your theme:

```tsx
// Components automatically adapt to:
// - Light/dark mode
// - Your color scheme
// - Your spacing system
// - Your typography
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  Achievement,
  LeaderboardEntry,
  Reward
} from "@/components/gamification";

const myAchievement: Achievement = {
  id: "1",
  name: "Test",
  description: "Test achievement",
  icon: Star,
  color: "from-blue-400 to-blue-600",
  unlocked: true,
  rarity: "common"
};
```

## Responsive Design

Components are mobile-first and responsive:

```tsx
// Mobile: Full width, stacked
// Tablet: Two columns
// Desktop: Centered, max-width 512px

<div className="space-y-6">
  <LevelBadge {...level} />
  <AchievementShowcase {...achievements} />
</div>
```

## Accessibility

All components are accessible by default:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Color contrast

## Performance

Components are optimized for performance:

- Minimal re-renders
- CSS transforms for animations
- Lazy loading ready
- Small bundle size (~45KB)

## Common Issues

### Issue: Components not showing
**Solution**: Make sure you've imported from the correct path:
```tsx
import { LevelBadge } from "@/components/gamification";
```

### Issue: TypeScript errors
**Solution**: Import types explicitly:
```tsx
import type { Achievement } from "@/components/gamification";
```

### Issue: Animations not smooth
**Solution**: Check for `prefers-reduced-motion`:
```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
```

## Next Steps

1. **Read the full documentation**: See `README.md` for detailed API docs
2. **Check examples**: See `USAGE_EXAMPLES.md` for more patterns
3. **Review design spec**: See `GAMIFICATION_DESIGN_SPEC.md` for design details
4. **Implement backend**: Follow the checklist in `GAMIFICATION_CHECKLIST.md`

## Need Help?

- 📖 Full documentation: `src/components/gamification/README.md`
- 💡 Usage examples: `src/components/gamification/USAGE_EXAMPLES.md`
- 🎨 Visual reference: `src/components/gamification/VISUAL_REFERENCE.md`
- ✅ Implementation checklist: `GAMIFICATION_CHECKLIST.md`
- 📋 Design specification: `GAMIFICATION_DESIGN_SPEC.md`

## Quick Reference

### Component Props

**LevelBadge**
```tsx
level: number
currentXP: number
nextLevelXP: number
compact?: boolean
```

**AchievementBadge**
```tsx
achievement: Achievement
size?: "sm" | "md" | "lg"
onClick?: () => void
```

**StreakCalendar**
```tsx
currentStreak: number
longestStreak: number
streakHistory: StreakDay[]
```

**LeaderboardWidget**
```tsx
entries: LeaderboardEntry[]
currentUserId?: string
title?: string
```

**RewardAnimation**
```tsx
reward: Reward
show: boolean
onClose: () => void
```

## Example Dashboard

Complete example with all components:

```tsx
import {
  LevelBadge,
  AchievementShowcase,
  StreakCalendar,
  LeaderboardWidget,
  GamificationSummary
} from "@/components/gamification";

function Dashboard() {
  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Level */}
      <LevelBadge
        level={12}
        currentXP={2450}
        nextLevelXP={3000}
      />

      {/* Quick Summary */}
      <GamificationSummary
        level={12}
        totalXP={15450}
        achievementsUnlocked={8}
        totalAchievements={20}
        currentStreak={12}
        weeklyRank={2}
      />

      {/* Streak */}
      <StreakCalendar
        currentStreak={12}
        longestStreak={28}
        streakHistory={streakData}
      />

      {/* Achievements */}
      <AchievementShowcase
        achievements={achievements}
      />

      {/* Leaderboard */}
      <LeaderboardWidget
        entries={leaderboard}
        currentUserId="user-123"
      />
    </div>
  );
}
```

That's it! You're ready to use the gamification system. 🎉
