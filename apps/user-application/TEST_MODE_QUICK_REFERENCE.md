# Test Mode - Quick Reference Card

## 🚀 Quick Start

### Import Components
```typescript
import { 
  Test, 
  TestSettingsSheet, 
  TestLoading 
} from '@/components/learning'
import type { TestSettings } from '@/components/learning/test-settings-sheet'
```

### Basic Setup
```typescript
// State
const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')
const [testSettings, setTestSettings] = useState<TestSettings | null>(null)
const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([])
const [showTestLoading, setShowTestLoading] = useState(false)

// Handlers
const handleStartTest = (settings: TestSettings) => {
  setTestSettings(settings)
  setShowTestSettings(false)
}

const handleTestAnswer = (isCorrect: boolean, userAnswer: string) => {
  // Record answer
  // Update stats
  // Navigate if last question
}
```

## 📋 Component Props

### TestSettingsSheet
```typescript
<TestSettingsSheet
  open={boolean}
  lessonTitle={string}
  totalCards={number}
  onOpenChange={(open: boolean) => void}
  onStartTest={(settings: TestSettings) => void}
/>
```

### Test
```typescript
<Test
  card={any}
  cardIndex={number}
  totalCards={number}
  questionType={'multiple-choice' | 'written' | 'true-false'}
  answerWith={'term' | 'definition'}
  onAnswer={(isCorrect: boolean, userAnswer: string) => void}
/>
```

### TestLoading
```typescript
<TestLoading />
// No props - just displays loading screen
```

## 🎨 Color Classes

### Primary (Test Mode)
```css
bg-gradient-streak          /* Orange gradient */
bg-gradient-streak-horizontal
text-streak
bg-streak
```

### Status
```css
bg-success / text-success   /* Green - correct */
bg-error / text-error       /* Red - incorrect */
bg-gradient-success
bg-gradient-error
```

## ⏱️ Timing Constants

```typescript
const AUTO_ADVANCE_DELAY = {
  MULTIPLE_CHOICE: 100,  // ms
  TRUE_FALSE: 100,       // ms
  WRITTEN: 150,          // ms
}

const LOADING_SCREEN_DURATION = 2000  // ms
```

## 📊 Data Structures

### TestSettings
```typescript
interface TestSettings {
  questionCount: number        // 5-60
  instantCorrection: boolean   // false by default
  answerWith: 'term' | 'definition'
  trueFalse: boolean
  multipleChoice: boolean
  written: boolean
}
```

### TestAnswer
```typescript
interface TestAnswer {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionType: string
}
```

## 🔄 User Flow

```
Settings → Test → Loading → Summary
   ↓         ↓        ↓         ↓
Configure  Answer  Calculate  Review
```

## 🎯 Key Features

### Settings
- ✅ Question count slider (5-60)
- ✅ Instant correction toggle
- ✅ Answer direction (term/definition)
- ✅ Question type selection (T/F, MC, Written)

### Test
- ✅ Progress bar animation
- ✅ Auto-advance (100-150ms)
- ✅ No feedback during test
- ✅ Three question types

### Loading
- ✅ Rotating spinner
- ✅ 2-second minimum display
- ✅ Animated dots

### Summary
- ✅ Donut chart
- ✅ Detailed breakdown
- ✅ Answer review
- ✅ Next steps

## 🐛 Common Issues

### Settings not opening?
```typescript
// Check mode and state
const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')

useEffect(() => {
  if (mode === 'exam' && !hasStartedTest) {
    setShowTestSettings(true)
  }
}, [mode, hasStartedTest])
```

### Auto-advance not working?
```typescript
// Ensure setTimeout is called
setTimeout(() => {
  onAnswer(isCorrect, userAnswer)
}, 100)  // Don't forget the delay!
```

### Loading screen skipped?
```typescript
// Set loading state before navigation
if (isLastCard) {
  setShowTestLoading(true)
  setTimeout(() => navigate(...), 2000)
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (min-width: 0px) {
  max-width: 100%;
  padding: 16px;
}

/* Tablet */
@media (min-width: 640px) {
  max-width: 640px;
  padding: 24px;
}

/* Desktop */
@media (min-width: 1024px) {
  max-width: 768px;
}
```

## ♿ Accessibility

### Keyboard Shortcuts
- `Enter`: Submit written answer
- `1-4`: Select option A-D
- `Tab`: Navigate elements
- `Escape`: Close settings

### ARIA Labels
```html
<div role="progressbar" aria-valuenow={current} aria-valuemax={total}>
<button aria-label="Option A: Chromosomes">
<div role="status" aria-live="polite">
```

## 🎨 Animation Timing

```typescript
// Entrance
transition={{ duration: 0.3 }}

// Progress bar
transition={{ duration: 0.3 }}

// Loading spinner
transition={{ duration: 2, repeat: Infinity }}

// Summary chart
transition={{ duration: 1, delay: 0.3 }}
```

## 📦 File Locations

```
components/learning/
├── test-settings-sheet.tsx
├── test.tsx
├── test-loading.tsx
└── index.ts (exports)

components/ui/
└── switch.tsx

routes/_auth/app/
└── test-summary.$lessonId.tsx
```

## 🔗 Navigation

### To Test Mode
```typescript
navigate({
  to: '/app/lesson-session/$lessonId',
  params: { lessonId },
  search: { mode: 'exam' },
})
```

### To Summary
```typescript
navigate({
  to: '/app/test-summary/$lessonId',
  params: { lessonId },
  search: {
    correct: number,
    incorrect: number,
    total: number,
    answers: JSON.stringify(testAnswers),
  },
})
```

## 🧪 Testing

### Unit Test Example
```typescript
describe('Test Component', () => {
  it('auto-advances after answer', async () => {
    const onAnswer = vi.fn()
    render(<Test {...props} onAnswer={onAnswer} />)
    
    fireEvent.click(screen.getByText('Option A'))
    
    await waitFor(() => {
      expect(onAnswer).toHaveBeenCalled()
    }, { timeout: 200 })
  })
})
```

## 📚 Documentation

- [TEST_MODE.md](./src/components/learning/TEST_MODE.md) - Complete feature docs
- [TEST_DESIGN_SPEC.md](./src/components/learning/TEST_DESIGN_SPEC.md) - Visual specs
- [IMPLEMENTATION_GUIDE.md](./src/components/learning/IMPLEMENTATION_GUIDE.md) - Integration guide
- [QUIZ_VS_TEST_COMPARISON.md](./QUIZ_VS_TEST_COMPARISON.md) - Feature comparison

## 🎯 Quick Checklist

### Before Integration
- [ ] Read IMPLEMENTATION_GUIDE.md
- [ ] Review existing session route
- [ ] Check card data structure
- [ ] Verify navigation setup

### During Integration
- [ ] Import components
- [ ] Add state management
- [ ] Generate test questions
- [ ] Handle answer recording
- [ ] Navigate to summary

### After Integration
- [ ] Test all question types
- [ ] Verify auto-advance timing
- [ ] Check loading screen
- [ ] Validate summary display
- [ ] Test answer review

### Before Deployment
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Check accessibility
- [ ] Verify performance
- [ ] Review documentation

## 💡 Pro Tips

1. **Memoize question generation** - Use `useMemo` to avoid re-shuffling
2. **Functional state updates** - Avoid stale closures with `setState(prev => ...)`
3. **GPU acceleration** - Use `transform` and `opacity` for animations
4. **Lazy load summary** - Split bundle for better performance
5. **Test on mobile** - Touch targets and responsive design

## 🆘 Support

### Need Help?
- Check [IMPLEMENTATION_GUIDE.md](./src/components/learning/IMPLEMENTATION_GUIDE.md)
- Review [TEST_MODE.md](./src/components/learning/TEST_MODE.md)
- Look at Quiz Mode implementation (quiz.tsx)
- Check existing session route (lesson-session.$lessonId.tsx)

### Found a Bug?
1. Check diagnostics: `getDiagnostics(['path/to/file.tsx'])`
2. Review console for errors
3. Verify props are correct
4. Check state management
5. Test in isolation

---

**Version**: 1.0.0
**Last Updated**: November 15, 2025
**Status**: ✅ Ready to Use
