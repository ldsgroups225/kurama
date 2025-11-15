# Quiz Mode - Quizlet Learn Mode Implementation

## Overview

The Quiz Mode is an adaptive learning system inspired by Quizlet's Learn Mode, implementing spaced repetition and intelligent question adaptation to optimize student retention and learning outcomes.

## Core Features

### 1. Learning Objectives (Bottom Sheet)

When starting a quiz session, users are presented with three learning objectives:

- **Mémoriser tout** (Memorize All) - Recommended
  - Studies all cards until complete mastery
  - Uses spaced repetition algorithm
  - Adapts question difficulty based on performance

- **Réviser les favoris** (Review Starred)
  - Focuses on cards marked as favorites
  - Targeted review for challenging content
  - Shorter, focused sessions

- **Révision rapide** (Quick Review)
  - Fast-paced review of all cards
  - No mastery tracking
  - Ideal for pre-exam cramming

### 2. Adaptive Question Types

The system uses three question formats that adapt based on user performance:

#### Multiple Choice (Default)
- 4 options with one correct answer
- Visual feedback with color-coded states
- Letter-based option labels (A, B, C, D)
- Instant validation on selection

#### Written Answer
- Free-form text input
- "Vous ne savez pas ?" (Don't know) option
- Fuzzy matching for answer validation
- Keyboard submit support (Enter key)

#### True/False (Planned)
- Binary choice questions
- Quick assessment format
- Used for confidence building

### 3. Question States & Feedback

Each question progresses through distinct states:

1. **Answering** - Initial state, user selecting answer
2. **Correct** - Green feedback, positive reinforcement
3. **Incorrect** - Orange feedback, shows correct answer
4. **Learning** - When user selects "Don't know", educational feedback

### 4. Visual Design System

Following Kurama's semantic color utilities:

```tsx
// Success state
border-success bg-success text-success

// Error state  
border-error bg-error text-error

// Warning/Learning state
border-warning bg-warning text-warning

// Primary interactions
bg-gradient-xp (for buttons and highlights)
```

### 5. Progress Tracking

- **Badge Counter**: Shows current question / total questions
- **Session Stats**: Tracks correct/incorrect answers
- **Performance Metrics**: Used for spaced repetition algorithm

## Component Architecture

### QuizSettingsSheet

Bottom sheet component for selecting learning objectives.

**Props:**
```typescript
interface QuizSettingsSheetProps {
  open: boolean
  lessonTitle: string
  totalCards: number
  onOpenChange: (open: boolean) => void
  onStartQuiz: (mode: 'memorize-all' | 'review-starred' | 'quick-review') => void
}
```

**Features:**
- Radix UI Sheet component (bottom drawer)
- Three learning mode cards with icons and descriptions
- Responsive design with hover states
- Semantic color gradients

### Quiz Component

Main quiz interface with adaptive question rendering.

**Props:**
```typescript
interface QuizProps {
  card: any // Flashcard data
  cardIndex: number
  totalCards: number
  questionType?: 'multiple-choice' | 'written' | 'true-false'
  onAnswer: (isCorrect: boolean) => void
}
```

**Features:**
- Dynamic question type rendering
- State management for answer selection
- Visual feedback system
- Audio and star buttons (for future features)
- Accessibility-compliant interactions

## Spaced Repetition Algorithm (SM-2)

The Quiz Mode is designed to integrate with the SM-2 algorithm stored in the database:

### Database Schema

```typescript
userProgress {
  easeFactor: integer // 2.5 * 1000 (default)
  interval: integer // Days until next review
  repetitions: integer // Number of successful reviews
  lastReviewedAt: timestamp
  nextReviewAt: timestamp
  totalReviews: integer
  correctReviews: integer
}
```

### Algorithm Flow

1. **Initial Presentation**: Card shown with easiest question type (multiple choice)
2. **Performance Tracking**: Record correct/incorrect responses
3. **Difficulty Adaptation**: 
   - Correct → Increase interval, maintain/increase ease factor
   - Incorrect → Reset interval, decrease ease factor
4. **Question Type Progression**:
   - Multiple Choice → Written Answer → True/False
   - Adapts based on mastery level

### Guidance Fading

As users demonstrate mastery, question difficulty increases:

```
New Card → Multiple Choice (4 options)
  ↓ (2 correct)
Familiar → Multiple Choice (harder distractors)
  ↓ (3 correct)
Learning → Written Answer
  ↓ (4 correct)
Mastered → True/False (confidence check)
```

## User Experience Flow

### UX Philosophy

The quiz interface implements **asymmetric feedback timing** to optimize learning:

- **Correct answers**: Auto-advance after 800ms
  - Provides positive reinforcement
  - Maintains momentum and engagement
  - Reduces friction for confident learners
  
- **Incorrect answers**: Manual continue button
  - Gives time to review the correct answer
  - Encourages reflection on mistakes
  - User controls when to proceed

This pattern is inspired by Duolingo and Quizlet's proven learning mechanics.

### 1. Session Start
```
User clicks "Quiz" mode
  ↓
Bottom sheet appears with learning objectives
  ↓
User selects objective (e.g., "Mémoriser tout")
  ↓
Quiz session begins
```

### 2. Question Interaction

#### Correct Answer Flow (Auto-advance)
```
Question displayed with options
  ↓
User selects CORRECT answer
  ↓
Immediate visual feedback (green state)
  ↓
Auto-advance after 800ms
  ↓
Next question (or summary if last card)
```

#### Incorrect Answer Flow (Manual continue)
```
Question displayed with options
  ↓
User selects INCORRECT answer OR "Vous ne savez pas ?"
  ↓
Immediate feedback (orange/red state)
  ↓
Shows correct answer
  ↓
"Continuer" button appears
  ↓
User clicks to proceed
  ↓
Next question (or summary if last card)
```

### 3. Session End
```
All cards reviewed
  ↓
Navigate to summary page
  ↓
Show performance stats and XP earned
```

## Integration Points

### Session Route (`lesson-session.$lessonId.tsx`)

```typescript
// Quiz mode state
const [showQuizSettings, setShowQuizSettings] = useState(mode === 'quiz')
const [quizMode, setQuizMode] = useState<QuizMode | null>(null)
const [hasStartedQuiz, setHasStartedQuiz] = useState(false)

// Show settings on mount
useEffect(() => {
  if (mode === 'quiz' && !hasStartedQuiz) {
    setShowQuizSettings(true)
  }
}, [mode, hasStartedQuiz])
```

### Learning Functions (`core/functions/learning.ts`)

Future integration for:
- Fetching cards based on spaced repetition schedule
- Updating user progress after each answer
- Calculating next review dates
- Tracking session statistics

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Logical tab order
- **Color Contrast**: WCAG 2.1 AA compliant
- **Touch Targets**: Minimum 44x44px for mobile

## Performance Optimizations

- **State Reset**: Efficient state cleanup on card change
- **Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Components loaded on demand
- **Animation Performance**: GPU-accelerated transitions

## Future Enhancements

### Phase 1 (Current)
- ✅ Quiz settings bottom sheet
- ✅ Multiple choice questions
- ✅ Written answer input
- ✅ Visual feedback system
- ✅ Progress tracking

### Phase 2 (Planned)
- [ ] True/False question type
- [ ] Audio pronunciation (TTS)
- [ ] Star/favorite cards
- [ ] Image support in questions
- [ ] Hint system

### Phase 3 (Advanced)
- [ ] Machine learning model for prediction
- [ ] Personalized difficulty adaptation
- [ ] Collaborative filtering for distractors
- [ ] Analytics dashboard
- [ ] Study streak integration

## Testing Strategy

### Unit Tests
```typescript
describe('Quiz Component', () => {
  it('renders multiple choice options', () => {})
  it('handles answer selection', () => {})
  it('shows correct feedback state', () => {})
  it('navigates to next question', () => {})
})
```

### Integration Tests
```typescript
describe('Quiz Session Flow', () => {
  it('shows settings sheet on quiz mode start', () => {})
  it('tracks correct/incorrect answers', () => {})
  it('navigates to summary on completion', () => {})
})
```

### E2E Tests
```typescript
describe('Complete Quiz Session', () => {
  it('completes full quiz workflow', () => {})
  it('updates user progress in database', () => {})
  it('awards XP on completion', () => {})
})
```

## Design Inspiration

Based on Quizlet's Learn Mode with Kurama-specific adaptations:

### Quizlet Features Implemented
- ✅ Learning objective selection
- ✅ Adaptive question types
- ✅ "Don't know" option
- ✅ Immediate feedback
- ✅ Progress indicators

### Kurama Enhancements
- 🎨 Semantic color system
- 🇫🇷 French localization (Ivorian context)
- 🎯 Ministry-aligned content
- 🏆 Gamification integration (XP, levels)
- 📱 Mobile-first design

## Resources

- [Quizlet Learn Mode Blog](https://quizlet.com/blog/how-learn-mode-works)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Spaced Repetition Research](https://www.gwern.net/Spaced-repetition)
- [Kurama Design System](../../../styles.css)

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Status**: ✅ Implemented
