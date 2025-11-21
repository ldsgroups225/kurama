import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Check, Home, Lock, RefreshCw, Trophy, Unlock, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { submitTestResult } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

interface TestAnswer {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionType: string
}

interface SearchParams {
  correct?: number
  incorrect?: number
  total?: number
  answers?: string // JSON stringified array of TestAnswer
}

export const Route = createFileRoute('/_auth/app/test-summary/$lessonId')({
  component: TestSummaryPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      correct: Number(search.correct) || 0,
      incorrect: Number(search.incorrect) || 0,
      total: Number(search.total) || 0,
      answers: (search.answers as string) || '[]',
    }
  },
})

function TestSummaryPage() {
  const { lessonId } = useParams({ from: '/_auth/app/test-summary/$lessonId' })
  const { correct, incorrect, total, answers: answersJson } = useSearch({
    from: '/_auth/app/test-summary/$lessonId',
  })
  const navigate = useNavigate()
  const [showAnswers, setShowAnswers] = useState(false)

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('test-summary')
    return endTracking
  }, [])

  const answers: TestAnswer[] = JSON.parse(answersJson || '[]')
  const score = (total ?? 0) > 0 ? Math.round(((correct ?? 0) / (total ?? 1)) * 100) : 0
  const incorrectCount = incorrect ?? 0

  // Mastery tracking state
  const [masteryResult, setMasteryResult] = useState<{
    masteryCount: number
    masteryRequired: number
    isCompleted: boolean
    nextLessonUnlocked: boolean
    nextLessonTitle: string | null
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Submit test result on mount
  useEffect(() => {
    const submitResult = async () => {
      if (isSubmitting)
        return
      setIsSubmitting(true)

      try {
        const result = await submitTestResult({
          data: {
            lessonId: Number(lessonId),
            correctCount: correct ?? 0,
            totalCount: total ?? 1,
          },
        })
        setMasteryResult(result)
      }
      catch (error) {
        console.error('Failed to submit test result:', error)
      }
      finally {
        setIsSubmitting(false)
      }
    }

    submitResult()
  }, [lessonId, correct, total, isSubmitting])

  // Determine performance message
  let performanceMessage = ''
  let performanceEmoji = '💡'

  if (score >= 90) {
    performanceMessage = ''
  }
  else if (score >= 70) {
    performanceMessage = ''
  }
  else if (score < 50) {
    performanceMessage = `Exercez-vous avec le mode Apprendre sur les termes qui vous posent problème, jusqu'à ce que vous les maîtrisiez.`
    performanceEmoji = '📚'
  }
  else {
    performanceMessage = `Exercez-vous avec le mode Apprendre sur les termes qui vous posent problème, jusqu'à ce que vous les maîtrisiez.`
    performanceEmoji = '💪'
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={`${total}/${total}`} showAvatar={false} />

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8 pb-24">
        {/* Performance Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="space-y-4 text-center"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="text-8xl">
                {score >= 70 ? '🎉' : performanceEmoji}
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {score >= 70 ? 'Vous êtes en train d\'apprendre !' : 'Vous êtes en train d\'apprendre !'}
            </h2>
            {performanceMessage && (
              <p className="mx-auto max-w-md text-base text-muted-foreground">
                {performanceMessage}
              </p>
            )}
          </div>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Vos résultats</h3>

              {/* Score Circle */}
              <div className="mb-6 flex items-center gap-6">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90 transform">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-border"
                    />
                    {/* Correct answers arc */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${((correct ?? 0) / (total ?? 1)) * 351.86} 351.86`}
                      className="text-success transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    {/* Incorrect answers arc */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${((incorrect ?? 0) / (total ?? 1)) * 351.86} 351.86`}
                      strokeDashoffset={`-${((correct ?? 0) / (total ?? 1)) * 351.86}`}
                      className="text-error transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {score}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Correct</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{correct}</span>
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          {correct}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
                      <X className="h-5 w-5 text-error" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Incorrect</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-error">{incorrect}</span>
                        <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                          {incorrectCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mastery Progress Card */}
        {masteryResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className={`border-2 ${masteryResult.isCompleted
              ? 'border-success/50 bg-success/5'
              : masteryResult.masteryCount > 0
                ? 'border-primary/50 bg-primary/5'
                : 'border-border'
            }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Mastery Header */}
                  <div className="flex items-center gap-3">
                    {masteryResult.isCompleted
                      ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                            <Trophy className="h-6 w-6 text-success" />
                          </div>
                        )
                      : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                            <Lock className="h-6 w-6 text-primary" />
                          </div>
                        )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {masteryResult.isCompleted ? 'Leçon maîtrisée !' : 'Progression de maîtrise'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {masteryResult.masteryCount}
                        /
                        {masteryResult.masteryRequired}
                        {' '}
                        tests réussis
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(masteryResult.masteryCount / masteryResult.masteryRequired) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-full ${masteryResult.isCompleted ? 'bg-success' : 'bg-primary'
                      }`}
                    />
                  </div>

                  {/* Feedback Message */}
                  {score >= 80 && !masteryResult.isCompleted && (
                    <div className="rounded-lg bg-primary/10 p-3 text-sm">
                      <p className="font-medium text-primary">
                        🎯 Excellent ! Plus que
                        {' '}
                        {masteryResult.masteryRequired - masteryResult.masteryCount}
                        {' '}
                        test(s) réussi(s) pour débloquer la prochaine leçon !
                      </p>
                    </div>
                  )}

                  {masteryResult.nextLessonUnlocked && masteryResult.nextLessonTitle && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="rounded-lg bg-success/10 p-4 text-center"
                    >
                      <Unlock className="mx-auto mb-2 h-8 w-8 text-success" />
                      <p className="font-semibold text-success">
                        🎉 Nouvelle leçon débloquée !
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {masteryResult.nextLessonTitle}
                      </p>
                    </motion.div>
                  )}

                  {masteryResult.isCompleted && (
                    <div className="rounded-lg bg-success/10 p-3 text-center text-sm font-medium text-success">
                      ✅ Vous avez maîtrisé cette leçon !
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Prochaines étapes</h3>

          {incorrectCount > 0 && (
            <Button
              size="lg"
              className="w-full justify-start gap-3 bg-gradient-xp text-lg font-semibold"
              onClick={() =>
                navigate({
                  to: '/app/lesson-session/$lessonId',
                  params: { lessonId },
                  search: { mode: 'quiz' },
                })}
            >
              <RefreshCw className="h-5 w-5" />
              <div className="flex-1 text-left">
                <div>
                  Révisez les
                  {' '}
                  {incorrectCount}
                  {' '}
                  termes manqués
                </div>
              </div>
            </Button>
          )}

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
            <Lock className="h-5 w-5" />
            <div className="flex-1 text-left">Effectuer un nouveau test</div>
          </Button>
        </motion.div>

        {/* Answers Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full text-left"
          >
            <h3 className="text-lg font-semibold">
              Vos réponses
              {' '}
              <span className="text-sm font-normal text-muted-foreground">
                (
                {showAnswers ? 'Masquer' : 'Afficher'}
                )
              </span>
            </h3>
          </button>

          {showAnswers && (
            <div className="space-y-3">
              {answers.map(answer => (
                <motion.div
                  key={`${answer.question}-${answer.userAnswer}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: answers.indexOf(answer) * 0.05 }}
                >
                  <Card
                    className={cn(
                      'border-2',
                      answer.isCorrect ? 'border-success/20' : 'border-error/20',
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 font-medium">{answer.question}</div>

                      <div className="space-y-2">
                        {/* User's answer */}
                        <div className="flex items-start gap-2">
                          {answer.isCorrect
                            ? (
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                              )
                            : (
                                <X className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                              )}
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Votre réponse</div>
                            <div
                              className={cn(
                                'font-medium',
                                answer.isCorrect ? 'text-success' : 'text-error',
                              )}
                            >
                              {answer.userAnswer}
                            </div>
                          </div>
                        </div>

                        {/* Correct answer (if wrong) */}
                        {!answer.isCorrect && (
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground">Réponse correcte</div>
                              <div className="font-medium text-success">{answer.correctAnswer}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Correct badge */}
                      <div
                        className={cn(
                          'mt-3 w-full rounded-lg py-2 text-center text-sm font-semibold',
                          answer.isCorrect
                            ? 'bg-success text-white'
                            : 'bg-error text-white',
                        )}
                      >
                        {answer.isCorrect
                          ? (
                              <div className="flex items-center justify-center gap-2">
                                <Check className="h-4 w-4" />
                                Correct
                              </div>
                            )
                          : (
                              <div className="flex items-center justify-center gap-2">
                                <X className="h-4 w-4" />
                                Incorrect
                              </div>
                            )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 pt-4"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2"
            onClick={() => navigate({ to: '/app' })}
          >
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
