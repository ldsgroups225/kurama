# Test Mode - Navigation Flow

## Complete User Journey

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER STARTS HERE                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Dashboard/Home Page                                        │
│  Route: /app                                                        │
│  Component: apps/user-application/src/routes/_auth/app/index.tsx   │
│                                                                     │
│  User sees:                                                         │
│  - List of subjects                                                 │
│  - Recent lessons                                                   │
│  - Progress overview                                                │
│                                                                     │
│  Action: Click on a subject (e.g., "Biologie")                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Subject Lessons Page                                       │
│  Route: /app/subjects/$subjectId                                   │
│  Component: apps/user-application/src/routes/_auth/app/            │
│             subjects.$subjectId.tsx                                 │
│                                                                     │
│  User sees:                                                         │
│  - List of lessons in the subject                                   │
│  - Lesson titles, descriptions                                      │
│  - Difficulty badges                                                │
│  - Duration estimates                                               │
│                                                                     │
│  Action: Click on a lesson (e.g., "Cell Division")                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Lesson Detail Page (Mode Selection)                        │
│  Route: /app/lessons/$lessonId                                     │
│  Component: apps/user-application/src/routes/_auth/app/            │
│             lessons.$lessonId.tsx                                   │
│                                                                     │
│  User sees THREE learning modes:                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📚 Flashcards                                               │  │
│  │    Parcourez les cartes à votre rythme                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 🎯 Quiz                                                     │  │
│  │    Testez vos connaissances de manière interactive          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📝 Test                                                     │  │
│  │    Évaluez vos connaissances                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Action: Click on "Test" button                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Test Configuration (Settings Sheet)                        │
│  Route: /app/lesson-session/$lessonId?mode=exam                   │
│  Component: TestSettingsSheet (opens automatically)                │
│                                                                     │
│  User configures:                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 🎯 Cell Division - Mitosis and Meiosis                     │  │
│  │ Configurez votre test                                       │  │
│  │                                                             │  │
│  │ Nombre de questions (max 60)                           20   │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │                                                             │  │
│  │ ┌─ Correction instantanée ──────────────────────┐          │  │
│  │ │                                            ○   │          │  │
│  │ └───────────────────────────────────────────────┘          │  │
│  │                                                             │  │
│  │ Répondre avec :                                             │  │
│  │ ┌──────────────┐ ┌──────────────┐                          │  │
│  │ │ Anglais, ... │ │ Définition   │                          │  │
│  │ └──────────────┘ └──────────────┘                          │  │
│  │                                                             │  │
│  │ Types de questions                                          │  │
│  │ ┌─ Vrai ou faux ────────────────────────┐                  │  │
│  │ │                                    ○   │                  │  │
│  │ └───────────────────────────────────────┘                  │  │
│  │ ┌─ Choix multiple ──────────────────────┐                  │  │
│  │ │                                    ●   │                  │  │
│  │ └───────────────────────────────────────┘                  │  │
│  │ ┌─ Écrit ───────────────────────────────┐                  │  │
│  │ │                                    ○   │                  │  │
│  │ └───────────────────────────────────────┘                  │  │
│  │                                                             │  │
│  │ [ Commencer le test ]                                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Action: Click "Commencer le test"                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Test Session (Answering Questions)                         │
│  Route: /app/lesson-session/$lessonId?mode=exam                   │
│  Component: Test component                                          │
│                                                                     │
│  For each question (1 to 20):                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │                                                             │  │
│  │ 3/20                                                        │  │
│  │                                                             │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ What two-rod structures contain the cell's DNA?     │   │  │
│  │ │                                                     │   │  │
│  │ │ ┌─────────────────────────────────────────────────┐ │   │  │
│  │ │ │ (A) Alleles                                     │ │   │  │
│  │ │ └─────────────────────────────────────────────────┘ │   │  │
│  │ │ ┌─────────────────────────────────────────────────┐ │   │  │
│  │ │ │ (B) Mitochondria                                │ │   │  │
│  │ │ └─────────────────────────────────────────────────┘ │   │  │
│  │ │ ┌─────────────────────────────────────────────────┐ │   │  │
│  │ │ │ (C) Ribosomes                                   │ │   │  │
│  │ │ └─────────────────────────────────────────────────┘ │   │  │
│  │ │ ┌─────────────────────────────────────────────────┐ │   │  │
│  │ │ │ (D) Chromosomes                                 │ │   │  │
│  │ │ └─────────────────────────────────────────────────┘ │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  User clicks answer → Brief highlight (100ms) → Auto-advance       │
│  NO FEEDBACK shown during test                                     │
│                                                                     │
│  Repeat for all 20 questions...                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Loading Screen (Calculating Results)                       │
│  Route: /app/lesson-session/$lessonId?mode=exam                   │
│  Component: TestLoading                                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │                                                             │  │
│  │                    ⟳ (rotating spinner)                    │  │
│  │                 (gradient background)                       │  │
│  │                                                             │  │
│  │         Un instant. Nous compilons vos résultats.           │  │
│  │                                                             │  │
│  │         Analyse de vos réponses en cours...                 │  │
│  │                                                             │  │
│  │                       • • •                                 │  │
│  │                   (animated dots)                           │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Duration: 2 seconds (minimum)                                      │
│  Auto-navigates to summary after calculation                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Test Results Summary                                       │
│  Route: /app/test-summary/$lessonId                                │
│  Component: apps/user-application/src/routes/_auth/app/            │
│             test-summary.$lessonId.tsx                              │
│                                                                     │
│  User sees:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 20/20                                                       │  │
│  │                                                             │  │
│  │                    🎉                                       │  │
│  │         Vous êtes en train d'apprendre !                    │  │
│  │                                                             │  │
│  │ ┌─ Vos résultats ─────────────────────────────────────┐   │  │
│  │ │   ⭕ 35%                                             │   │  │
│  │ │  (donut chart)                                      │   │  │
│  │ │                                                     │   │  │
│  │ │  ✓ Correct        7                                │   │  │
│  │ │  ✗ Incorrect     13                                │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │ Prochaines étapes                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ 🔄 Révisez les 13 termes manqués                   │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ 🔒 Effectuer un nouveau test                       │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │ Vos réponses (Afficher) ▼                                  │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ What two-rod structures contain the cell's DNA?     │   │  │
│  │ │ ✗ Votre réponse: Ribosomes                         │   │  │
│  │ │ ✓ Réponse correcte: Chromosomes                    │   │  │
│  │ │ [ Incorrect ]                                       │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ ... (all 20 answers)                                        │  │
│  │                                                             │  │
│  │ [ Retour à l'accueil ]                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Actions available:                                                 │
│  - Review missed terms (navigates to Quiz mode)                    │
│  - Take new test (navigates back to Step 4)                        │
│  - Return home (navigates to Step 1)                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Code Implementation

### Step 3: Lesson Detail Page - Add Test Button

**File**: `apps/user-application/src/routes/_auth/app/lessons.$lessonId.tsx`

```typescript
import { ClipboardCheck } from 'lucide-react'

// In the render section, add Test mode button:
<Button
  size="lg"
  variant="outline"
  className="w-full justify-start gap-3 border-2"
  onClick={() =>
    navigate({
      to: '/app/lesson-session/$lessonId',
      params: { lessonId },
      search: { mode: 'exam' },  // ← This triggers Test Mode
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

### Step 4-6: Session Route - Handle Test Mode

**File**: `apps/user-application/src/routes/_auth/app/lesson-session.$lessonId.tsx`

```typescript
import { Test, TestSettingsSheet, TestLoading } from '@/components/learning'
import type { TestSettings } from '@/components/learning/test-settings-sheet'

function SessionPage() {
  const { mode } = useSearch({ from: '/_auth/app/lesson-session/$lessonId' })
  
  // Test mode state
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
    
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, testSettings.questionCount)
    
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
      // Show loading screen
      if (showTestLoading) {
        return <TestLoading />
      }
      
      // Show test questions
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

  return (
    <div className="min-h-screen bg-background">
      <SessionHeader {...headerProps} />
      
      <main className="mx-auto max-w-lg py-6 px-4">
        {renderLearningMode()}
      </main>

      {/* Test Settings Sheet */}
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
}
```

## URL Parameters

### Mode Parameter
The `mode` search parameter determines which learning mode to use:

- `mode=flashcards` → Flashcard mode
- `mode=quiz` → Quiz mode
- `mode=exam` → **Test mode** ✅

### Example URLs

```
# Navigate to Test mode
/app/lesson-session/lesson-123?mode=exam

# Navigate to Quiz mode
/app/lesson-session/lesson-123?mode=quiz

# Navigate to Flashcard mode
/app/lesson-session/lesson-123?mode=flashcards
```

## Navigation Helper Functions

```typescript
// Navigate to Test mode
const goToTestMode = (lessonId: string) => {
  navigate({
    to: '/app/lesson-session/$lessonId',
    params: { lessonId },
    search: { mode: 'exam' },
  })
}

// Navigate to Test summary
const goToTestSummary = (lessonId: string, results: TestResults) => {
  navigate({
    to: '/app/test-summary/$lessonId',
    params: { lessonId },
    search: {
      correct: results.correct,
      incorrect: results.incorrect,
      total: results.total,
      answers: JSON.stringify(results.answers),
    },
  })
}

// Navigate back to lesson detail
const goToLessonDetail = (lessonId: string) => {
  navigate({
    to: '/app/lessons/$lessonId',
    params: { lessonId },
  })
}
```

## State Flow

```typescript
// Initial state (mode === 'exam')
showTestSettings: true
hasStartedTest: false
testSettings: null
testAnswers: []
showTestLoading: false

// After configuration
showTestSettings: false
hasStartedTest: true
testSettings: { questionCount: 20, ... }
testAnswers: []
showTestLoading: false

// During test (answering questions)
showTestSettings: false
hasStartedTest: true
testSettings: { questionCount: 20, ... }
testAnswers: [answer1, answer2, ...]
showTestLoading: false

// After last question
showTestSettings: false
hasStartedTest: true
testSettings: { questionCount: 20, ... }
testAnswers: [answer1, answer2, ..., answer20]
showTestLoading: true  // ← Shows loading screen

// After 2 seconds → Navigate to summary
```

## Quick Start Checklist

To enable Test Mode navigation:

1. ✅ **Add Test button** to lesson detail page (`lessons.$lessonId.tsx`)
2. ✅ **Import components** in session route (`lesson-session.$lessonId.tsx`)
3. ✅ **Add state management** for test mode
4. ✅ **Handle mode === 'exam'** in render logic
5. ✅ **Create test summary route** (`test-summary.$lessonId.tsx`)
6. ✅ **Test the complete flow** from lesson → test → summary

---

**Last Updated**: November 15, 2025
**Status**: ✅ Complete Navigation Flow
