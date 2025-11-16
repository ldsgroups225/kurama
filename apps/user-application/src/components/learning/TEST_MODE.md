# Test Mode - Quizlet-Inspired Implementation

## Overview

Test Mode is a formal assessment tool that simulates an exam environment, allowing students to gauge their readiness. Unlike Quiz Mode (adaptive learning), Test Mode generates a static test upfront based on user-defined settings.

## Design Philosophy

### Key Differences from Quiz Mode

| Feature | Quiz Mode | Test Mode |
|---------|-----------|-----------|
| **Purpose** | Adaptive learning | Formal assessment |
| **Feedback** | Immediate (asymmetric timing) | End of test only |
| **Adaptation** | Dynamic question selection | Static question set |
| **Navigation** | Auto-advance on correct | Auto-advance all (100-200ms) |
| **Results** | Session summary | Detailed answer review |

### Inspiration from Quizlet

Test Mode follows Quizlet's proven patterns:
1. **Configuration First**: Comprehensive settings before starting
2. **No Interruptions**: Smooth flow without feedback during test
3. **Natural Delays**: 50-200ms delays feel human, not instant
4. **Detailed Review**: Complete answer history with correct/incorrect feedback
5. **Actionable Next Steps**: Clear paths for improvement

## Component Architecture

### 1. TestSettingsSheet

Configuration interface before starting the test.

**Location**: `apps/user-application/src/components/learning/test-settings-sheet.tsx`

**Features**:
- Question count slider (5 to max 60, step 5)
- Instant correction toggle (disabled by default)
- Answer direction selection (term/definition)
- Question type toggles (True/False, Multiple Choice, Written)
- Validation: At least one question type must be selected

**Visual Design**:
```
┌─────────────────────────────────────┐
│ 🎯 Lesson Title                     │
│ Configurez votre test               │
├─────────────────────────────────────┤
│ Nombre de questions (max 60)    20  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ ┌─ Correction instantanée ────┐    │
│ │                          ○   │    │
│ └─────────────────────────────┘    │
│                                     │
│ Répondre avec :                     │
│ ┌──────────┐ ┌──────────┐          │
│ │ Anglais  │ │Définition│          │
│ └──────────┘ └──────────┘          │
│                                     │
│ Types de questions                  │
│ ┌─ Vrai ou faux ──────────┐        │
│ │                      ○   │        │
│ └─────────────────────────┘        │
│ ┌─ Choix multiple ─────────┐       │
│ │                      ●   │        │
│ └─────────────────────────┘        │
│ ┌─ Écrit ──────────────────┐       │
│ │                      ○   │        │
│ └─────────────────────────┘        │
│                                     │
│ [ Commencer le test ]               │
└─────────────────────────────────────┘
```

**Settings Interface**:
```typescript
interface TestSettings {
  questionCount: number
  instantCorrection: boolean
  answerWith: 'term' | 'definition'
  trueFalse: boolean
  multipleChoice: boolean
  written: boolean
}
```

### 2. Test Component

Main test interface with no feedback during answering.

**Location**: `apps/user-application/src/components/learning/test.tsx`

**Features**:
- Progress bar (animated width)
- Progress counter (e.g., "3/20")
- Question display
- Three question types:
  - **Multiple Choice**: 4 options with letter labels (A-D)
  - **True/False**: Two large buttons
  - **Written**: Text input with auto-focus
- Auto-advance with natural delays:
  - Multiple Choice: 100ms
  - True/False: 100ms
  - Written: 150ms (slightly longer for typing)

**Visual States**:
```css
/* Default state - clean, minimal */
.option {
  border: 2px solid var(--border);
  transition: all 150ms;
}

/* Hover state - subtle feedback */
.option:hover {
  border-color: var(--primary) / 0.5;
  background: var(--accent);
}

/* Selected state - brief highlight */
.option.selected {
  border-color: var(--primary);
  background: var(--primary) / 0.05;
}

/* After answer - dimmed */
.option.answered {
  opacity: 0.75;
  cursor: default;
}
```

**Auto-Advance Timing**:
```typescript
// Multiple Choice & True/False
setTimeout(() => {
  onAnswer(isCorrect, userAnswer)
}, 100) // Natural human delay

// Written Answer
setTimeout(() => {
  onAnswer(isCorrect, userAnswer)
}, 150) // Slightly longer for typing context
```

### 3. TestLoading Component

Loading screen shown after completing all questions.

**Location**: `apps/user-application/src/components/learning/test-loading.tsx`

**Features**:
- Animated spinner with gradient background
- "Un instant. Nous compilons vos résultats."
- Animated dots for loading indication
- Minimum display time: ~2 seconds (for dramatic effect)

**Visual Design**:
```
┌─────────────────────────────────────┐
│                                     │
│         ⟳ (rotating spinner)        │
│                                     │
│  Un instant. Nous compilons vos     │
│         résultats.                  │
│                                     │
│  Analyse de vos réponses en cours...│
│                                     │
│            • • •                    │
│        (animated dots)              │
│                                     │
└─────────────────────────────────────┘
```

### 4. TestSummary Route

Comprehensive results page with answer review.

**Location**: `apps/user-application/src/routes/_auth/app/test-summary.$lessonId.tsx`

**Features**:
- Performance header with emoji (🎉 for ≥70%, 📚 for <50%)
- Circular progress chart (donut chart)
- Correct/Incorrect breakdown
- Next steps section:
  - "Révisez les X termes manqués" (if incorrect > 0)
  - "Effectuer un nouveau test"
- Expandable answer review:
  - Question text
  - User's answer (with ✓ or ✗)
  - Correct answer (if wrong)
  - Correct/Incorrect badge

**Visual Design**:
```
┌─────────────────────────────────────┐
│            🎉                        │
│  Vous êtes en train d'apprendre !   │
│                                     │
│ ┌─ Vos résultats ─────────────────┐ │
│ │   ⭕ 35%                         │ │
│ │  (donut chart)                  │ │
│ │                                 │ │
│ │  ✓ Correct        7             │ │
│ │  ✗ Incorrect     13             │ │
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
│ │ Question 1                      │ │
│ │ ✗ Votre réponse: Ribosomes      │ │
│ │ ✓ Réponse correcte: Chromosomes │ │
│ │ [ Incorrect ]                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Answer Review Interface**:
```typescript
interface TestAnswer {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionType: string
}
```

## User Flow

### Complete Test Journey

```
1. Mode Selection
   User clicks "Test" mode from lesson page
   ↓
2. Configuration
   TestSettingsSheet appears
   User configures:
   - Question count (20)
   - Question types (Multiple Choice ✓)
   - Answer direction (Term)
   Clicks "Commencer le test"
   ↓
3. Test Session
   For each question:
   - Question displayed
   - User selects answer
   - Brief highlight (100-150ms)
   - Auto-advance to next
   No feedback during test
   ↓
4. Loading Screen
   After last question:
   - TestLoading component shows
   - "Nous compilons vos résultats"
   - Minimum 2 seconds display
   ↓
5. Results Summary
   Navigate to test-summary route
   - Performance celebration
   - Score breakdown
   - Answer review
   - Next steps
```

### Timing Breakdown

```
Question Display:     0ms
User Thinks:          Variable (user-controlled)
User Clicks:          0ms
Selection Highlight:  100-150ms (auto-advance delay)
Next Question:        0ms (immediate)

Total per question:   ~100-150ms overhead
20 questions:         ~2-3 seconds total overhead
```

## Integration with Session Route

The test mode integrates into the existing lesson session route:

```typescript
// In lesson-session.$lessonId.tsx

const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')
const [testSettings, setTestSettings] = useState<TestSettings | null>(null)
const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([])
const [showTestLoading, setShowTestLoading] = useState(false)

// Generate test questions based on settings
const testQuestions = useMemo(() => {
  if (!testSettings) return []
  
  // Generate questions based on settings
  const questions = generateTestQuestions(
    cards,
    testSettings.questionCount,
    testSettings.trueFalse,
    testSettings.multipleChoice,
    testSettings.written,
    testSettings.answerWith
  )
  
  return questions
}, [testSettings, cards])

// Handle test answer
const handleTestAnswer = (isCorrect: boolean, userAnswer: string) => {
  const currentQuestion = testQuestions[currentCardIndex]
  
  setTestAnswers(prev => [...prev, {
    question: currentQuestion.question,
    userAnswer,
    correctAnswer: currentQuestion.correctAnswer,
    isCorrect,
    questionType: currentQuestion.type,
  }])
  
  incrementStat(isCorrect ? 'correct' : 'incorrect')
  
  if (isLastCard) {
    // Show loading screen
    setShowTestLoading(true)
    
    // Navigate to summary after 2 seconds
    setTimeout(() => {
      navigateToTestSummary()
    }, 2000)
  } else {
    setCurrentCardIndex(prev => prev + 1)
  }
}
```

## Styling Conventions

### Color System

Following Kurama's semantic utilities:

```css
/* Test Mode Primary */
.bg-gradient-streak /* Orange gradient for test mode */
.text-streak

/* Success States */
.bg-success /* Light green background */
.text-success /* Green text */
.bg-gradient-success /* Green gradient */

/* Error States */
.bg-error /* Light red background */
.text-error /* Red text */
.bg-gradient-error /* Red gradient */

/* Progress Bar */
.bg-gradient-streak /* Animated progress */
```

### Spacing & Layout

```css
/* Container */
max-width: 640px (max-w-2xl for summary)
padding: 24px (px-6)
gap: 24px (space-y-6)

/* Progress Bar */
height: 4px (h-1)
border-radius: 9999px (rounded-full)

/* Question Card */
padding: 24px (p-6)
border: 2px solid

/* Options */
padding: 16px (p-4)
gap: 12px (gap-3)
border-radius: 8px (rounded-lg)

/* Summary Cards */
padding: 16px (p-4)
border: 2px solid
```

### Animation Timing

```css
/* Option hover */
transition: all 150ms ease-in-out

/* Progress bar */
transition: width 300ms ease-out

/* Card entrance */
initial: { opacity: 0, y: 10 }
animate: { opacity: 1, y: 0 }
transition: { delay: index * 0.05 }

/* Loading spinner */
animate: { rotate: 360 }
transition: { duration: 2, repeat: Infinity }
```

## Accessibility

### Keyboard Navigation

- All options keyboard accessible
- Enter key submits written answers
- Tab order: question → options → next
- Focus indicators visible

### Screen Reader Support

```html
<div role="progressbar" aria-valuenow={cardIndex + 1} aria-valuemax={totalCards}>
  {cardIndex + 1} / {totalCards}
</div>

<button aria-label="Option A: Chromosomes">
  <span aria-hidden="true">A</span>
  Chromosomes
</button>

<div role="status" aria-live="polite">
  Test terminé. Calcul des résultats...
</div>
```

### Color Contrast

- All text meets WCAG 2.1 AA standards
- Success/Error colors have sufficient contrast
- Focus indicators clearly visible

## Performance Considerations

### Optimization Strategies

1. **Question Generation**: Memoized with useMemo
2. **Answer Storage**: Efficient array updates
3. **Animations**: GPU-accelerated (transform, opacity)
4. **Loading Screen**: Minimum 2s prevents jarring transitions
5. **Summary Rendering**: Lazy loading of answer cards

### Bundle Size

- Reuses existing components (Card, Button, Badge)
- Minimal new code (~500 lines total)
- No external dependencies beyond Radix UI

## Testing Strategy

### Unit Tests

```typescript
describe('TestSettingsSheet', () => {
  it('validates at least one question type selected', () => {})
  it('limits question count to available cards', () => {})
  it('updates settings on user interaction', () => {})
})

describe('Test Component', () => {
  it('auto-advances after answer selection', () => {})
  it('records user answers correctly', () => {})
  it('handles all question types', () => {})
})

describe('TestSummary', () => {
  it('calculates score correctly', () => {})
  it('displays answer review', () => {})
  it('shows appropriate next steps', () => {})
})
```

### Integration Tests

```typescript
describe('Complete Test Flow', () => {
  it('completes full test workflow', async () => {
    // 1. Open test settings
    // 2. Configure test
    // 3. Answer all questions
    // 4. See loading screen
    // 5. View results
  })
})
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Configuration sheet
- ✅ Multiple choice questions
- ✅ True/False questions
- ✅ Written questions
- ✅ Loading screen
- ✅ Results summary
- ✅ Answer review

### Phase 2 (Planned)
- [ ] Instant correction mode (show feedback immediately)
- [ ] Timer mode (countdown timer)
- [ ] Matching questions
- [ ] Image-based questions
- [ ] PDF export of results
- [ ] Print functionality

### Phase 3 (Advanced)
- [ ] Test history tracking
- [ ] Performance analytics
- [ ] Difficulty-based question selection
- [ ] Adaptive test length
- [ ] Peer comparison
- [ ] Study recommendations

## Design Rationale

### Why No Feedback During Test?

Test Mode simulates a real exam environment where:
1. Students must commit to answers without immediate validation
2. Builds confidence in decision-making
3. Reduces anxiety from instant feedback
4. Encourages careful thinking before answering
5. Provides comprehensive review at the end

### Why Auto-Advance?

1. **Maintains Flow**: No manual "Next" button clicking
2. **Feels Natural**: 100-150ms mimics human processing
3. **Reduces Friction**: Smooth, uninterrupted experience
4. **Exam-Like**: Real exams don't pause between questions
5. **Efficient**: Completes test faster

### Why Loading Screen?

1. **Dramatic Effect**: Builds anticipation for results
2. **Processing Time**: Allows calculation of statistics
3. **Transition Buffer**: Smooth shift from test to results
4. **User Expectation**: Matches Quizlet's pattern
5. **Prevents Jarring**: Avoids instant jump to results

---

**Design System**: Kurama v1.0
**Last Updated**: November 15, 2025
**Status**: ✅ Implemented
**Inspiration**: Quizlet Test Mode
**Target Audience**: Students (ages 10-18)
