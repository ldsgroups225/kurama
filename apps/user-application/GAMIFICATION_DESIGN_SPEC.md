# Kurama Gamification Design Specification

## Executive Summary

This document outlines the comprehensive gamification system designed for Kurama, an educational platform for BEPC/BAC students in Côte d'Ivoire. The system aims to increase student engagement, motivation, and learning consistency through proven game mechanics adapted for educational contexts.

## Design Goals

1. **Increase Daily Engagement**: Encourage students to study consistently every day
2. **Motivate Progress**: Provide clear visual feedback on learning achievements
3. **Foster Competition**: Create healthy competition through leaderboards
4. **Celebrate Success**: Reward milestones with satisfying animations
5. **Build Habits**: Use streak mechanics to establish study routines
6. **Cultural Relevance**: Design for Ivorian students with French language support

## Core Mechanics

### 1. Experience Points (XP) & Levels

**Purpose**: Provide continuous progression feedback

**Mechanics**:
- Students earn XP for completing study activities
- XP accumulates to unlock new levels
- Each level requires progressively more XP
- Visual progress bar shows advancement

**XP Awards**:
- Complete flashcard: 10 XP
- Finish quiz: 50 XP
- Perfect quiz score: +25 bonus XP
- Daily challenge: 100 XP
- Study streak milestone: 50-200 XP

**Level Progression**:
```
Level 1-10: 500 XP per level
Level 11-25: 750 XP per level
Level 26-50: 1000 XP per level
Level 51+: 1500 XP per level
```

### 2. Achievement System

**Purpose**: Recognize specific accomplishments and milestones

**Rarity Tiers**:
1. **Common** (Gray): Basic achievements, 60% unlock rate
2. **Rare** (Blue): Moderate difficulty, 30% unlock rate
3. **Epic** (Purple): Challenging, 8% unlock rate
4. **Legendary** (Gold): Extremely rare, 2% unlock rate

**Achievement Categories**:

**Learning Achievements**:
- "Premier Pas" (Common): Complete first lesson
- "Étudiant Assidu" (Rare): Complete 50 lessons
- "Maître du Savoir" (Epic): Complete 200 lessons
- "Génie Académique" (Legendary): Complete all subjects

**Quiz Achievements**:
- "Débutant Quiz" (Common): Complete 10 quizzes
- "Maître du Quiz" (Epic): Get 100% on 10 quizzes
- "Champion Quiz" (Legendary): Get 100% on 50 quizzes

**Streak Achievements**:
- "Série de Feu" (Rare): 7-day streak
- "Fusée" (Rare): 30-day streak
- "Légende" (Legendary): 100-day streak

**Subject Mastery**:
- "Mathématicien" (Epic): Complete all math chapters
- "Scientifique" (Epic): Complete all science chapters
- "Littéraire" (Epic): Complete all literature chapters

**Social Achievements**:
- "Ami Studieux" (Common): Join a study group
- "Leader" (Rare): Top 10 on leaderboard
- "Champion" (Legendary): #1 on leaderboard for 4 weeks

### 3. Daily Streaks

**Purpose**: Build consistent study habits

**Mechanics**:
- Streak increments with daily study activity (minimum 15 minutes)
- Streak resets if a day is missed
- Visual calendar shows last 14 days
- Motivational messages based on streak length

**Streak Milestones**:
- 3 days: "Bon début !" + 50 XP
- 7 days: "Une semaine !" + 100 XP + "Série de Feu" badge
- 14 days: "Deux semaines !" + 150 XP
- 30 days: "Un mois !" + 300 XP + "Fusée" badge
- 100 days: "Centenaire !" + 1000 XP + "Légende" badge

**Streak Protection**:
- Students can earn "Streak Freeze" items
- One freeze allows missing one day without breaking streak
- Earned through special challenges or achievements

### 4. Leaderboards

**Purpose**: Foster healthy competition and community

**Types**:
1. **Weekly Leaderboard**: Resets every Monday
2. **Monthly Leaderboard**: Resets first of month
3. **All-Time Leaderboard**: Permanent rankings
4. **Subject Leaderboards**: Per-subject rankings
5. **Class Leaderboards**: School/class specific

**Ranking System**:
- Based on total points earned in period
- Points = XP + Achievement bonuses
- Top 3 get special visual treatment (Trophy, Medal, Award icons)
- Current user always highlighted
- Rank change indicators (↑↓→)

**Privacy**:
- Students can opt-out of public leaderboards
- Display name customization
- Avatar selection

### 5. Daily Challenges

**Purpose**: Provide focused daily goals

**Structure**:
- One challenge per day
- Resets at midnight (Abidjan timezone)
- Countdown timer shows time remaining
- Bonus XP for completion (100-200 XP)

**Challenge Types**:
- "Révision Rapide": Complete 25 flashcards
- "Quiz Master": Complete 3 quizzes with 80%+ score
- "Sujet du Jour": Study specific subject for 30 minutes
- "Vitesse": Complete 50 cards in under 15 minutes
- "Perfectionniste": Get 100% on any quiz

## Visual Design System

### Color Palette

**Primary Colors**:
- Primary: `hsl(var(--primary))` - Brand color
- Background: `hsl(var(--background))` - Main background
- Foreground: `hsl(var(--foreground))` - Text color

**Gamification Colors**:
- XP/Common: Blue (#60A5FA to #3B82F6)
- Achievements: Amber/Orange (#FBBF24 to #F97316)
- Level Up: Purple (#C084FC to #9333EA)
- Streak: Orange/Red (#FB923C to #EF4444)
- Success: Green (#4ADE80)
- Warning: Yellow (#FACC15)
- Error: Red (#F87171)

**Rarity Colors**:
- Common: Gray (#9CA3AF to #6B7280)
- Rare: Blue (#60A5FA to #2563EB)
- Epic: Purple (#C084FC to #7C3AED)
- Legendary: Gold (#FBBF24 to #F97316)

### Typography

**Font Family**: System font stack (optimized for French)
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Font Sizes**:
- Heading 1: 2xl (24px) - Section titles
- Heading 2: lg (18px) - Subsection titles
- Body: sm (14px) - Regular text
- Caption: xs (12px) - Secondary text
- Badge: 2xl-4xl (24-36px) - Level numbers

**Font Weights**:
- Bold: 700 - Headings, important numbers
- Semibold: 600 - Labels
- Medium: 500 - Body text
- Regular: 400 - Secondary text

### Spacing System

Based on 4px grid:
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)

### Component Specifications

#### Level Badge (Full)
- **Size**: Full width, 80px height
- **Border Radius**: 12px
- **Shadow**: lg (0 10px 15px -3px rgba(0,0,0,0.1))
- **Badge Circle**: 64px diameter
- **Progress Bar**: 8px height, full width
- **Animation**: Pulse on level up

#### Level Badge (Compact)
- **Size**: Full width, 40px height
- **Badge Circle**: 40px diameter
- **Progress Bar**: 6px height
- **Icon**: 16px sparkle

#### Achievement Badge
- **Small**: 64px circle, 16px icon
- **Medium**: 80px circle, 36px icon
- **Large**: 96px circle, 44px icon
- **Card Padding**: 16px
- **Border Radius**: 12px
- **Shadow**: Hover elevation

#### Streak Calendar
- **Grid**: 7 columns (days of week)
- **Cell Size**: 40x40px
- **Cell Spacing**: 8px
- **Flame Icon**: 16px
- **Border Radius**: 8px per cell

#### Leaderboard Entry
- **Height**: 64px
- **Avatar**: 40px circle
- **Padding**: 12px
- **Border Radius**: 12px
- **Rank Badge**: 32px width

### Animation Specifications

#### Micro-interactions
- **Hover**: 150ms ease-out scale(1.02)
- **Press**: 100ms ease-in scale(0.98)
- **Focus**: 200ms ease ring appearance

#### Progress Animations
- **XP Bar Fill**: 500ms ease-out
- **Level Up**: 1000ms bounce + sparkle burst
- **Achievement Unlock**: 800ms scale + fade in

#### Celebration Animations
- **Sparkle Float**: 2-4s linear infinite
- **Badge Bounce**: 2s ease-in-out infinite
- **Confetti**: 3s ease-out (one-time)

### Responsive Behavior

**Mobile (< 640px)**:
- Single column layout
- Full-width components
- Compact badges in header
- Bottom navigation

**Tablet (640px - 1024px)**:
- Two-column grid for stats
- Larger touch targets
- Side navigation option

**Desktop (> 1024px)**:
- Max width: 512px (centered)
- Hover states enabled
- Keyboard navigation
- Sidebar navigation

## User Experience Flow

### First-Time User
1. Welcome screen explains gamification
2. Start at Level 1, 0 XP
3. First lesson completion triggers tutorial
4. Unlock "Premier Pas" achievement
5. Celebration animation
6. Encourage daily return for streak

### Daily Return User
1. See greeting with current streak
2. Daily challenge highlighted
3. Progress toward next level visible
4. Recent achievements showcased
5. Leaderboard position shown

### Achievement Unlock Flow
1. Complete qualifying action
2. Reward animation appears (full screen)
3. Show achievement details
4. Display XP bonus
5. Update profile
6. Option to share (future)

### Level Up Flow
1. XP bar fills to 100%
2. Dramatic animation (sparkles, sound)
3. New level number revealed
4. Bonus reward (streak freeze, etc.)
5. Next level goal shown

## Accessibility Considerations

### Visual
- Color contrast ratio ≥ 4.5:1 for text
- Icons paired with text labels
- Progress bars have text alternatives
- Animations respect `prefers-reduced-motion`

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Escape key closes modals
- Enter/Space activates buttons

### Screen Readers
- ARIA labels on all icons
- Progress announcements
- Achievement unlock announcements
- Leaderboard rank announcements

### Cognitive
- Clear visual hierarchy
- Consistent patterns
- Simple language (French, A2-B1 level)
- Optional tutorial mode

## Performance Targets

- **Initial Load**: < 2s on 3G
- **Animation FPS**: 60fps minimum
- **Image Optimization**: WebP with fallbacks
- **Bundle Size**: < 50KB for gamification components
- **Lighthouse Score**: > 90

## Localization

### French Language
All text in French (Ivorian context):
- "Niveau" (Level)
- "Points d'expérience" (Experience Points)
- "Série" (Streak)
- "Classement" (Leaderboard)
- "Badges" (Achievements)
- "Défi du jour" (Daily Challenge)

### Cultural Considerations
- Use local time zone (Africa/Abidjan)
- School calendar awareness (vacation periods)
- Exam preparation focus (BEPC/BAC)
- Community/group emphasis

## Analytics & Metrics

### Key Performance Indicators (KPIs)

**Engagement**:
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session duration
- Sessions per user per day

**Gamification Specific**:
- Achievement unlock rate
- Average streak length
- Streak retention (7-day, 30-day)
- Level distribution
- Leaderboard participation rate

**Learning Outcomes**:
- Correlation: XP vs. quiz scores
- Retention: Gamified vs. non-gamified users
- Completion rates by level
- Subject engagement by gamification element

### A/B Testing Opportunities
1. XP reward amounts
2. Achievement difficulty
3. Leaderboard visibility
4. Streak freeze mechanics
5. Daily challenge types

## Implementation Phases

### Phase 1: Core Mechanics (Completed)
- ✅ Level & XP system
- ✅ Achievement badges
- ✅ Streak calendar
- ✅ Leaderboard widget
- ✅ Reward animations
- ✅ Dashboard integration

### Phase 2: Backend Integration (Next)
- [ ] User level API
- [ ] Achievement tracking
- [ ] Streak persistence
- [ ] Leaderboard rankings
- [ ] XP calculation engine

### Phase 3: Advanced Features
- [ ] Daily challenges system
- [ ] Streak freeze items
- [ ] Social sharing
- [ ] Study groups
- [ ] Seasonal events

### Phase 4: Optimization
- [ ] Performance tuning
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] User feedback integration

## Success Criteria

**Quantitative**:
- 40% increase in DAU within 3 months
- 60% of users maintain 7+ day streak
- 80% achievement unlock rate for common badges
- 25% increase in average session duration

**Qualitative**:
- Positive user feedback (> 4.0/5.0 rating)
- Reduced churn rate
- Increased word-of-mouth referrals
- Teacher/parent approval

## Maintenance & Updates

### Weekly
- Monitor leaderboard integrity
- Check achievement unlock rates
- Review user feedback

### Monthly
- Add new achievements
- Adjust XP rewards based on data
- Update daily challenges
- Seasonal theme updates

### Quarterly
- Major feature additions
- A/B test results analysis
- User research sessions
- Performance optimization

## Conclusion

This gamification system is designed to transform Kurama into an engaging, motivating learning platform that helps Ivorian students succeed in their BEPC/BAC preparation. By combining proven game mechanics with educational best practices and cultural awareness, we create an experience that makes learning both effective and enjoyable.

The system is built to scale, with clear paths for future enhancements while maintaining simplicity and accessibility for all students.
