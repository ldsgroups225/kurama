# Test Mode - Implementation Guide

## Quick Start

### Files Created

```
apps/user-application/src/
├── components/
│   ├── learning/
│   │   ├── test-settings-sheet.tsx    # Configuration interface
│   │   ├── test.tsx                   # Test question component
│   │   ├── test-loading.tsx           # Loading screen
│   │   ├── TEST_MODE.md               # Feature documentation
│   │   ├── TEST_DESIGN_SPEC.md        # Visual design specs
│   │   └── IMPLEMENTATION_GUIDE.md    # This file
│   └── ui/
│       └── switch.tsx                 # Toggle switch component (NEW)
└── routes/
    └── _auth/
        └── app/
            └── test-summary.$lessonId.tsx  # Results page
```

### Dependencies

All dependencies are already installed in the project:
- `@radix-ui/react-switch` - Toggle switches
- `motion/react` - Animations
- `lucide-react` - Icons
- `@tanstack/react-router` - Routing

## Integration Steps

### Step 1: Update Lesson Session Route

Add test mode support to `apps/user-application/src/routes/_auth/app/lesson-session.$lessonId.tsx`:

```typescript
import { Test, TestSettingsSheet, TestLoading } from '@/components/learning'
import type { TestSettings } from '@/components/learning/test-settings-sheet'

// Add state management
const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')
const [testSettings, setTestSettings] = useState<TestSettings | null>(null)
const [hasStartedTest, setHasStartedTest] = useState(false)
const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([])
const [showTestLoading, setShowTestLoading] = useState(false)

// Generate test questions based on settings
const testQuestions = useMemo(() => {
  if (!testSettings || !hasStartedTest) return []
  
  const availableTypes = []
  if (testSettings.multipleChoice) availableTypes.push('multiple-choice')
  if (testSettings.trueFalse) availableTypes.push('true-false')
  if (testSettings.written) availableTypes.push('written')
  
  // Shuffle and select questions
  const shuffled = [...cards].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, testSettings.questionCount)
  
  // Assign random question types
  return selected.map(card => ({
    ...card,
    questionType: availableTypes[Math.floor(Math.random() * availableTypes.length)],
  }))
}, [testSettings, hasStartedTest, cards])

// Handle test start
const handleStartTest = useCallback((settings: TestSettings) => {
  setTestSettings(settings)
  setHasStartedTest(true)
  setShowTestSettings(false)
  setTestAnswers([])
  setCurrentCardIndex(0)
  setSessionStats({ correct: 0, incorrect: 0 })
}, [])

// Handle test answer
const handleTestAnswer = useCallback((isCorrect: boolean, userAnswer: string) => {
  const currentQuestion = testQuestions[currentCardIndex]
  const correctAnswer = testSettings?.answerWith === 'term' 
    ? currentQuestion.frontContent || currentQuestion.front
    : currentQuestion.backContent || currentQuestion.back
  
  // Record answer
  setTestAnswers(prev => [...prev, {
    question: testSettings?.answerWith === 'term'
      ? currentQuestion.backContent || currentQuestion.back
      : currentQuestion.frontContent || currentQuestion.front,
    userAnswer,
    correctAnswer,
    isCorrect,
    questionType: currentQuestion.questionType,
  }])
  
  // Update stats
  incrementStat(isCorrect ? 'correct' : 'incorrect')
  
  if (isLastCard) {
    // Show loading screen
    setShowTestLoading(true)
    
    // Navigate to summary after 2 seconds
    setTimeout(() => {
      const finalCorrect = isCorrect ? sessionStats.correct + 1 : sessionStats.correct
      const finalIncorrect = !isCorrect ? sessionStats.incorrect + 1 : sessionStats.incorrect
      
      navigate({
        to: '/app/test-summary/$lessonId',
        params: { lessonId },
        search: {
          correct: finalCorrect,
          incorrect: finalIncorrect,
          total: testQuestions.length,
          answers: JSON.stringify(testAnswers.concat([{
            question: testSettings?.answerWith === 'term'
              ? currentQuestion.backContent || currentQuestion.back
              : currentQuestion.frontContent || currentQuestion.front,
            userAnswer,
            correctAnswer,
            isCorrect,
            questionType: currentQuestion.questionType,
          }])),
        },
      })
    }, 2000)
  } else {
    setCurrentCardIndex(prev => prev + 1)
  }
}, [currentCardIndex, testQuestions, testSettings, sessionStats, isLastCard, navigate, lessonId, testAnswers, incrementStat])

// Show test settings on mount
useEffect(() => {
  if (mode === 'exam' && !hasStartedTest) {
    setShowTestSettings(true)
  }
}, [mode, hasStartedTest])

// Render test mode
const renderLearningMode = () => {
  if (mode === 'exam') {
    if (showTestLoading) {
      return <TestLoading />
    }
    
    if (hasStartedTest && testQuestions.length > 0) {
      const currentQuestion = testQuestions[currentCardIndex]
      return (
        <Test
          card={currentQuestion}
          cardIndex={currentCardIndex}
          totalCards={testQuestions.length}
          questionType={currentQuestion.questionType}
          answerWith={testSettings?.answerWith || 'term'}
          onAnswer={handleTestAnswer}
        />
      )
    }
    
    return null
  }
  
  // ... existing quiz/flashcard rendering
}

// Add test settings sheet
return (
  <div className="min-h-screen bg-background">
    {/* ... existing header and content ... */}
    
    {mode === 'exam' && (
      <TestSettingsSheet
        open={showTestSettings}
        lessonTitle={(lesson as any)?.title || 'Leçon'}
        totalCards={cards.length}
        onOpenChange={setShowTestSettings}
        onStartTest={handleStartTest}
      />
    )}
  </div>
)
```

### Step 2: Update Mode Selection

In `apps/user-application/src/routes/_auth/app/lessons.$lessonId.tsx`, ensure the "Test" mode button navigates correctly:

```typescript
<Button
  size="lg"
  variant="outline"
  className="w-full justify-start gap-3 border-2"
  onClick={() =>
    navigate({
      to: '/app/lesson-session/$lessonId',
      params: { lessonId },
      search: { mode: 'exam' },
    })}
>
  <ClipboardCheck className="h-5 w-5" />
  <div className="flex-1 text-left">
    <div className="font-semibold">Test</div>
    <div className="text-sm text-muted-foreground">
      Évaluez vos connaissances
    </div>
  </div>
</Button>
```

### Step 3: Add TypeScript Types

Create or update type definitions:

```typescript
// In a types file or at the top of the session route
interface TestAnswer {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionType: string
}

interface TestSettings {
  questionCount: number
  instantCorrection: boolean
  answerWith: 'term' | 'definition'
  trueFalse: boolean
  multipleChoice: boolean
  written: boolean
}
```

## Testing Checklist

### Manual Testing

- [ ] **Configuration Sheet**
  - [ ] Opens automatically when mode is 'exam'
  - [ ] Slider adjusts question count (5-60)
  - [ ] Toggles work correctly
  - [ ] Answer direction selection works
  - [ ] At least one question type must be selected
  - [ ] "Commencer le test" button is disabled when no types selected
  - [ ] Sheet closes on start

- [ ] **Test Session**
  - [ ] Progress bar animates correctly
  - [ ] Progress counter updates (e.g., "3/20")
  - [ ] Questions display correctly
  - [ ] Multiple choice options are shuffled
  - [ ] True/False buttons work
  - [ ] Written input accepts text
  - [ ] Auto-advance happens after 100-150ms
  - [ ] No feedback shown during test
  - [ ] All questions are answered

- [ ] **Loading Screen**
  - [ ] Appears after last question
  - [ ] Spinner rotates smoothly
  - [ ] Text displays correctly
  - [ ] Dots animate in sequence
  - [ ] Displays for at least 2 seconds
  - [ ] Navigates to summary automatically

- [ ] **Summary Screen**
  - [ ] Score calculated correctly
  - [ ] Donut chart displays correct proportions
  - [ ] Correct/Incorrect counts match
  - [ ] Performance message appropriate for score
  - [ ] "Révisez les X termes manqués" shows if incorrect > 0
  - [ ] Answer review expands/collapses
  - [ ] All answers listed correctly
  - [ ] Correct answers show green badge
  - [ ] Incorrect answers show red badge with correct answer
  - [ ] Navigation buttons work

### Automated Testing

```typescript
// Example test suite
describe('Test Mode', () => {
  describe('TestSettingsSheet', () => {
    it('validates at least one question type', () => {
      // Test validation logic
    })
    
    it('limits question count to available cards', () => {
      // Test max question logic
    })
  })
  
  describe('Test Component', () => {
    it('auto-advances after answer selection', async () => {
      // Test auto-advance timing
    })
    
    it('records answers correctly', () => {
      // Test answer recording
    })
  })
  
  describe('TestSummary', () => {
    it('calculates score correctly', () => {
      // Test score calculation
    })
    
    it('displays all answers', () => {
      // Test answer display
    })
  })
})
```

## Common Issues & Solutions

### Issue 1: Settings Sheet Not Opening

**Symptom**: Sheet doesn't appear when clicking "Test" mode

**Solution**: Check that `mode === 'exam'` in the route search params and that `showTestSettings` state is properly initialized:

```typescript
const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')

useEffect(() => {
  if (mode === 'exam' && !hasStartedTest) {
    setShowTestSettings(true)
  }
}, [mode, hasStartedTest])
```

### Issue 2: Auto-Advance Not Working

**Symptom**: Questions don't advance automatically after selection

**Solution**: Ensure `setTimeout` is called correctly and `onAnswer` callback is invoked:

```typescript
const handleOptionSelect = (index: number) => {
  if (isAnswered) return
  
  setSelectedAnswer(index)
  setIsAnswered(true)
  
  const isCorrect = options[index] === correctAnswer
  
  setTimeout(() => {
    onAnswer(isCorrect, options[index])
  }, 100) // Must call onAnswer in setTimeout
}
```

### Issue 3: Loading Screen Skipped

**Symptom**: Navigates directly to summary without loading screen

**Solution**: Set loading state before navigation and use setTimeout:

```typescript
if (isLastCard) {
  setShowTestLoading(true)
  
  setTimeout(() => {
    navigate({ /* ... */ })
  }, 2000) // Minimum 2 seconds
}
```

### Issue 4: Answers Not Showing in Summary

**Symptom**: Summary shows score but no answer review

**Solution**: Ensure answers are properly serialized and passed via search params:

```typescript
search: {
  answers: JSON.stringify(testAnswers),
}

// In summary route
const answers: TestAnswer[] = JSON.parse(answersJson || '[]')
```

### Issue 5: Progress Bar Not Animating

**Symptom**: Progress bar jumps instead of animating

**Solution**: Use Framer Motion's `motion.div` with proper transition:

```typescript
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
  transition={{ duration: 0.3 }}
  className="h-full bg-gradient-streak"
/>
```

## Performance Optimization

### 1. Memoize Test Questions

```typescript
const testQuestions = useMemo(() => {
  // Expensive computation
  return generateQuestions(cards, settings)
}, [cards, settings])
```

### 2. Lazy Load Summary Components

```typescript
const TestSummary = lazy(() => import('./test-summary'))

// In render
<Suspense fallback={<LoadingSpinner />}>
  <TestSummary />
</Suspense>
```

### 3. Optimize Answer Storage

```typescript
// Use functional updates to avoid stale closures
setTestAnswers(prev => [...prev, newAnswer])
```

### 4. Debounce Written Input

```typescript
const [debouncedAnswer] = useDebounce(userAnswer, 300)
```

## Accessibility Enhancements

### 1. Keyboard Navigation

```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && questionType === 'written') {
      handleWrittenSubmit()
    }
    if (e.key >= '1' && e.key <= '4' && questionType === 'multiple-choice') {
      handleOptionSelect(Number(e.key) - 1)
    }
  }
  
  window.addEventListener('keypress', handleKeyPress)
  return () => window.removeEventListener('keypress', handleKeyPress)
}, [questionType])
```

### 2. Screen Reader Announcements

```typescript
// Announce progress
<div role="status" aria-live="polite" className="sr-only">
  Question {cardIndex + 1} of {totalCards}
</div>

// Announce completion
<div role="status" aria-live="polite" className="sr-only">
  Test completed. Calculating results.
</div>
```

### 3. Focus Management

```typescript
// Auto-focus written input
<input
  ref={inputRef}
  autoFocus
  type="text"
  // ...
/>

// Focus first option on mount
useEffect(() => {
  if (questionType === 'multiple-choice') {
    firstOptionRef.current?.focus()
  }
}, [cardIndex])
```

## Future Enhancements

### Phase 1 (Completed)
- ✅ Configuration sheet
- ✅ Multiple choice questions
- ✅ True/False questions
- ✅ Written questions
- ✅ Loading screen
- ✅ Results summary
- ✅ Answer review

### Phase 2 (Next)
- [ ] Instant correction mode
- [ ] Timer mode with countdown
- [ ] Matching questions
- [ ] Image-based questions
- [ ] PDF export
- [ ] Print functionality

### Phase 3 (Future)
- [ ] Test history tracking
- [ ] Performance analytics
- [ ] Adaptive difficulty
- [ ] Peer comparison
- [ ] Study recommendations

## Support & Resources

### Documentation
- [TEST_MODE.md](./TEST_MODE.md) - Feature overview and architecture
- [TEST_DESIGN_SPEC.md](./TEST_DESIGN_SPEC.md) - Visual design specifications
- [QUIZ_MODE.md](./QUIZ_MODE.md) - Quiz mode comparison

### Design References
- Quizlet Test Mode screenshots (provided)
- Kurama design system (styles.css)
- shadcn/ui components

### Code Examples
- Quiz Mode implementation (quiz.tsx)
- Session management (lesson-session.$lessonId.tsx)
- Summary screen (lesson-summary.$lessonId.tsx)

---

**Version**: 1.0.0
**Last Updated**: November 15, 2025
**Status**: ✅ Ready for Integration
**Maintainer**: Kurama Development Team
