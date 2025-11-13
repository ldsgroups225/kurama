# Gamification Components for Kurama

A comprehensive set of gamification components designed to increase student engagement and motivation in the Kurama learning platform.

## Components Overview

### 1. LevelBadge
Displays user's current level and XP progress with visual feedback.

**Features:**
- Animated gradient badge with level number
- Progress bar showing XP to next level
- Compact mode for header integration
- Sparkle animation for visual appeal

**Usage:**
```tsx
<LevelBadge
  level={12}
  currentXP={2450}
  nextLevelXP={3000}
  compact={false}
/>
```

### 2. AchievementBadge
Individual achievement/badge display with rarity system.

**Features:**
- Four rarity levels: Common, Rare, Epic, Legendary
- Locked/unlocked states
- Progress tracking for incomplete achievements
- Color-coded by rarity
- Unlock date display

**Usage:**
```tsx
<AchievementBadge
  achievement={{
    id: "1",
    name: "Premier Pas",
    description: "Complétez votre première leçon",
    icon: Star,
    color: "from-blue-400 to-blue-600",
    unlocked: true,
    unlockedAt: new Date(),
    rarity: "rare"
  }}
  size="md"
/>
```

### 3. AchievementShowcase
Grid display of multiple achievements with summary.

**Features:**
- Shows unlocked/total count
- Grid layout (3 columns)
- Empty state for no achievements
- "View all" link for full collection

**Usage:**
```tsx
<AchievementShowcase
  achievements={achievementsArray}
  title="Vos Badges"
  maxDisplay={6}
/>
```

### 4. StreakCalendar
Visual calendar showing daily study streak.

**Features:**
- 14-day history display
- Current streak counter
- Longest streak record
- Flame icons for completed days
- Motivational messages based on streak length
- Today indicator with ring highlight

**Usage:**
```tsx
<StreakCalendar
  currentStreak={12}
  longestStreak={28}
  streakHistory={[
    { date: new Date(), completed: true, count: 1 }
  ]}
/>
```

### 5. LeaderboardWidget
Competitive ranking display with user highlighting.

**Features:**
- Top 5 users display
- Special icons for top 3 (Trophy, Medal, Award)
- Rank change indicators (up/down/same)
- Current user highlighting
- Points display
- "View full leaderboard" link

**Usage:**
```tsx
<LeaderboardWidget
  entries={[
    {
      id: "1",
      name: "Aminata Koné",
      points: 3450,
      rank: 1,
      previousRank: 2
    }
  ]}
  currentUserId="2"
  title="Classement Hebdomadaire"
/>
```

### 6. RewardAnimation
Full-screen celebration modal for achievements and rewards.

**Features:**
- Animated sparkles background
- Bouncing icon animation
- Type-specific colors (XP, Achievement, Level Up, Streak)
- Value display with animation
- Backdrop blur effect

**Usage:**
```tsx
<RewardAnimation
  reward={{
    type: "achievement",
    title: "Nouveau Badge !",
    description: "Vous avez débloqué 'Maître du Quiz'",
    value: 100,
    icon: <Trophy />
  }}
  show={showReward}
  onClose={() => setShowReward(false)}
/>
```

## Design Principles

### Color System
- **XP/Common**: Blue gradient (from-blue-400 to-blue-600)
- **Achievements**: Amber/Orange (from-amber-400 to-orange-500)
- **Level Up**: Purple (from-purple-400 to-purple-600)
- **Streak**: Orange/Red (from-orange-400 to-red-500)
- **Rare**: Blue (from-blue-400 to-blue-600)
- **Epic**: Purple (from-purple-400 to-purple-600)
- **Legendary**: Gold (from-amber-400 to-orange-500)

### Rarity System
1. **Common** (Gray): Basic achievements, easy to unlock
2. **Rare** (Blue): Moderate difficulty, requires consistent effort
3. **Epic** (Purple): Challenging achievements, significant milestones
4. **Legendary** (Gold): Extremely rare, major accomplishments

### Animation Guidelines
- Use subtle animations for continuous elements (pulse, float)
- Reserve dramatic animations for reward moments
- Maintain 60fps performance
- Respect user's motion preferences

## Integration Example

```tsx
import {
  LevelBadge,
  AchievementShowcase,
  StreakCalendar,
  LeaderboardWidget,
  RewardAnimation
} from "@/components/gamification";

function Dashboard() {
  return (
    <div className="space-y-6">
      <LevelBadge level={12} currentXP={2450} nextLevelXP={3000} />
      <StreakCalendar {...streakData} />
      <AchievementShowcase achievements={achievements} />
      <LeaderboardWidget entries={leaderboard} />
    </div>
  );
}
```

## Data Structure

### Achievement Type
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}
```

### LeaderboardEntry Type
```typescript
interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  previousRank?: number;
  isCurrentUser?: boolean;
}
```

### Reward Type
```typescript
interface Reward {
  type: "xp" | "achievement" | "level_up" | "streak";
  title: string;
  description: string;
  value?: number;
  icon?: React.ReactNode;
}
```

## Backend Integration Points

1. **User Level System**
   - GET `/api/user/level` - Current level and XP
   - POST `/api/user/xp` - Award XP points

2. **Achievements**
   - GET `/api/achievements` - All achievements with unlock status
   - POST `/api/achievements/:id/unlock` - Unlock achievement

3. **Streak Tracking**
   - GET `/api/user/streak` - Current and historical streak data
   - POST `/api/user/streak/check-in` - Daily check-in

4. **Leaderboard**
   - GET `/api/leaderboard?period=week` - Leaderboard data
   - GET `/api/user/rank` - Current user's rank

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA labels
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Screen reader friendly
- Focus indicators
- Reduced motion support

## Performance Considerations

- Lazy load achievement images
- Virtualize long leaderboard lists
- Debounce animation triggers
- Use CSS transforms for animations
- Optimize re-renders with React.memo

## Future Enhancements

1. **Social Features**
   - Share achievements on social media
   - Challenge friends
   - Study groups with shared goals

2. **Advanced Gamification**
   - Daily/weekly quests
   - Seasonal events
   - Power-ups and boosters
   - Customizable avatars

3. **Analytics**
   - Engagement metrics
   - Achievement unlock rates
   - Streak retention analysis
   - A/B testing framework

## Testing

```bash
# Run component tests
pnpm test gamification

# Visual regression tests
pnpm test:visual gamification

# Accessibility tests
pnpm test:a11y gamification
```

## Support

For questions or issues with gamification components, contact the Kurama development team or open an issue in the project repository.
