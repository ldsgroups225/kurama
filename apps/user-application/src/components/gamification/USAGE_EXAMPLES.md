# Gamification Components - Usage Examples

## Complete Dashboard Integration

```tsx
import { useState } from "react";
import {
  LevelBadge,
  AchievementShowcase,
  StreakCalendar,
  LeaderboardWidget,
  RewardAnimation,
  GamificationSummary,
  type Achievement,
  type LeaderboardEntry,
  type Reward
} from "@/components/gamification";

function StudentDashboard() {
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);

  // Mock user data - replace with real API calls
  const userData = {
    level: 12,
    currentXP: 2450,
    nextLevelXP: 3000,
    totalXP: 15450,
    currentStreak: 12,
    longestStreak: 28,
  };

  const handleActivityComplete = (xpEarned: number) => {
    // Show reward animation
    setCurrentReward({
      type: "xp",
      title: "Bien joué !",
      description: "Vous avez gagné des points d'expérience",
      value: xpEarned,
    });
    setShowReward(true);
  };

  const handleAchievementUnlock = (achievement: Achievement) => {
    setCurrentReward({
      type: "achievement",
      title: "Nouveau Badge !",
      description: achievement.description,
      value: 100,
      icon: <achievement.icon className="h-12 w-12" />,
    });
    setShowReward(true);
  };

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <LevelBadge
        level={userData.level}
        currentXP={userData.currentXP}
        nextLevelXP={userData.nextLevelXP}
      />

      {/* Quick Summary */}
      <GamificationSummary
        level={userData.level}
        totalXP={userData.totalXP}
        achievementsUnlocked={3}
        totalAchievements={6}
        currentStreak={userData.currentStreak}
        weeklyRank={2}
      />

      {/* Other components... */}

      {/* Reward Animation */}
      {currentReward && (
        <RewardAnimation
          reward={currentReward}
          show={showReward}
          onClose={() => {
            setShowReward(false);
            setCurrentReward(null);
          }}
        />
      )}
    </div>
  );
}
```

## Level Badge Variations

### Full Size
```tsx
<LevelBadge
  level={12}
  currentXP={2450}
  nextLevelXP={3000}
/>
```

### Compact (for Header)
```tsx
<LevelBadge
  level={12}
  currentXP={2450}
  nextLevelXP={3000}
  compact
/>
```

## Achievement Badge Examples

### Unlocked Achievement
```tsx
<AchievementBadge
  achievement={{
    id: "streak_7",
    name: "Série de Feu",
    description: "Maintenez une série de 7 jours",
    icon: Flame,
    color: "from-orange-400 to-red-500",
    unlocked: true,
    unlockedAt: new Date("2024-02-01"),
    rarity: "rare"
  }}
  size="md"
/>
```

### Locked Achievement with Progress
```tsx
<AchievementBadge
  achievement={{
    id: "level_50",
    name: "Étudiant Légendaire",
    description: "Atteignez le niveau 50",
    icon: Crown,
    color: "from-amber-400 to-orange-500",
    unlocked: false,
    progress: 12,
    maxProgress: 50,
    rarity: "legendary"
  }}
  size="md"
/>
```

### Small Size (for Grid)
```tsx
<AchievementBadge
  achievement={achievement}
  size="sm"
  onClick={() => showAchievementDetails(achievement)}
/>
```

## Achievement Showcase

```tsx
const achievements: Achievement[] = [
  {
    id: "1",
    name: "Premier Pas",
    description: "Complétez votre première leçon",
    icon: Star,
    color: "from-blue-400 to-blue-600",
    unlocked: true,
    unlockedAt: new Date("2024-01-15"),
    rarity: "common",
  },
  // ... more achievements
];

<AchievementShowcase
  achievements={achievements}
  title="Vos Badges"
  maxDisplay={6}
/>
```

## Streak Calendar

```tsx
const streakData = {
  currentStreak: 12,
  longestStreak: 28,
  streakHistory: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date,
      completed: i >= 2, // Last 12 days completed
      count: i >= 2 ? 1 : 0,
    };
  }),
};

<StreakCalendar
  currentStreak={streakData.currentStreak}
  longestStreak={streakData.longestStreak}
  streakHistory={streakData.streakHistory}
/>
```

## Leaderboard Widget

```tsx
const leaderboardData: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Aminata Koné",
    avatar: "/avatars/aminata.jpg",
    points: 3450,
    rank: 1,
    previousRank: 2,
  },
  {
    id: "2",
    name: "Darius Kassi",
    points: 3240,
    rank: 2,
    previousRank: 1,
    isCurrentUser: true,
  },
  // ... more entries
];

<LeaderboardWidget
  entries={leaderboardData}
  currentUserId="2"
  title="Classement Hebdomadaire"
/>
```

## Reward Animations

### XP Reward
```tsx
<RewardAnimation
  reward={{
    type: "xp",
    title: "Bien joué !",
    description: "Vous avez complété le quiz",
    value: 50,
  }}
  show={showReward}
  onClose={() => setShowReward(false)}
/>
```

### Achievement Unlock
```tsx
<RewardAnimation
  reward={{
    type: "achievement",
    title: "Nouveau Badge !",
    description: "Vous avez débloqué 'Maître du Quiz'",
    value: 100,
    icon: <Trophy className="h-12 w-12 text-amber-500" />,
  }}
  show={showReward}
  onClose={() => setShowReward(false)}
/>
```

### Level Up
```tsx
<RewardAnimation
  reward={{
    type: "level_up",
    title: "Niveau Supérieur !",
    description: "Vous êtes maintenant niveau 13",
    value: 13,
    icon: <Star className="h-12 w-12 text-purple-500" />,
  }}
  show={showReward}
  onClose={() => setShowReward(false)}
/>
```

### Streak Milestone
```tsx
<RewardAnimation
  reward={{
    type: "streak",
    title: "Série Incroyable !",
    description: "30 jours d'affilée !",
    value: 200,
    icon: <Flame className="h-12 w-12 text-orange-500" />,
  }}
  show={showReward}
  onClose={() => setShowReward(false)}
/>
```

## Gamification Summary

```tsx
<GamificationSummary
  level={12}
  totalXP={15450}
  achievementsUnlocked={8}
  totalAchievements={20}
  currentStreak={12}
  weeklyRank={2}
/>
```

## Integration with App Header

```tsx
import { AppHeader } from "@/components/main";

<AppHeader
  showLevel={true}
  userLevel={{
    level: 12,
    currentXP: 2450,
    nextLevelXP: 3000,
  }}
/>
```

## Triggering Rewards on Actions

```tsx
function QuizComplete() {
  const [showReward, setShowReward] = useState(false);

  const handleQuizSubmit = async (score: number) => {
    // Calculate XP
    const baseXP = 50;
    const bonusXP = score === 100 ? 25 : 0;
    const totalXP = baseXP + bonusXP;

    // Update backend
    await updateUserXP(totalXP);

    // Show reward
    setCurrentReward({
      type: "xp",
      title: score === 100 ? "Parfait !" : "Bien joué !",
      description: `Quiz complété avec ${score}%`,
      value: totalXP,
    });
    setShowReward(true);

    // Check for achievements
    if (score === 100) {
      checkAchievement("perfect_quiz");
    }
  };

  return (
    <>
      <QuizForm onSubmit={handleQuizSubmit} />
      {currentReward && (
        <RewardAnimation
          reward={currentReward}
          show={showReward}
          onClose={() => setShowReward(false)}
        />
      )}
    </>
  );
}
```

## Backend Integration Pattern

```tsx
// hooks/useGamification.ts
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGamification() {
  const { data: userLevel } = useQuery({
    queryKey: ["user", "level"],
    queryFn: () => fetch("/api/user/level").then(r => r.json()),
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => fetch("/api/achievements").then(r => r.json()),
  });

  const { data: streak } = useQuery({
    queryKey: ["user", "streak"],
    queryFn: () => fetch("/api/user/streak").then(r => r.json()),
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", "weekly"],
    queryFn: () => fetch("/api/leaderboard?period=week").then(r => r.json()),
  });

  const awardXP = useMutation({
    mutationFn: (xp: number) =>
      fetch("/api/user/xp", {
        method: "POST",
        body: JSON.stringify({ xp }),
      }),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["user", "level"]);
    },
  });

  return {
    userLevel,
    achievements,
    streak,
    leaderboard,
    awardXP,
  };
}

// Usage in component
function Dashboard() {
  const { userLevel, achievements, streak, leaderboard } = useGamification();

  if (!userLevel) return <Loading />;

  return (
    <div className="space-y-6">
      <LevelBadge {...userLevel} />
      <AchievementShowcase achievements={achievements} />
      <StreakCalendar {...streak} />
      <LeaderboardWidget entries={leaderboard} />
    </div>
  );
}
```

## Responsive Layout Example

```tsx
function ResponsiveGamification() {
  return (
    <div className="space-y-6">
      {/* Mobile: Stack vertically */}
      <div className="lg:hidden space-y-4">
        <LevelBadge {...levelData} />
        <GamificationSummary {...summaryData} />
        <StreakCalendar {...streakData} />
      </div>

      {/* Desktop: Two-column grid */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LevelBadge {...levelData} />
          <StreakCalendar {...streakData} />
        </div>
        <div className="space-y-6">
          <AchievementShowcase {...achievementData} />
          <LeaderboardWidget {...leaderboardData} />
        </div>
      </div>
    </div>
  );
}
```

## Testing Examples

```tsx
// __tests__/gamification.test.tsx
import { render, screen } from "@testing-library/react";
import { LevelBadge } from "@/components/gamification";

describe("LevelBadge", () => {
  it("displays current level", () => {
    render(<LevelBadge level={12} currentXP={2450} nextLevelXP={3000} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("shows correct progress percentage", () => {
    render(<LevelBadge level={12} currentXP={2450} nextLevelXP={3000} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveStyle({ width: "81.67%" });
  });

  it("displays XP remaining", () => {
    render(<LevelBadge level={12} currentXP={2450} nextLevelXP={3000} />);
    expect(screen.getByText(/550 XP restants/)).toBeInTheDocument();
  });
});
```

## Accessibility Example

```tsx
<LevelBadge
  level={12}
  currentXP={2450}
  nextLevelXP={3000}
  aria-label={`Niveau 12, 2450 sur 3000 points d'expérience`}
  role="status"
  aria-live="polite"
/>
```

## Animation Control

```tsx
// Respect user's motion preferences
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

<RewardAnimation
  reward={reward}
  show={showReward}
  onClose={handleClose}
  disableAnimations={prefersReducedMotion}
/>
```
