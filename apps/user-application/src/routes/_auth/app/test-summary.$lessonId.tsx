import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { BarChart3, Home, Lock, RefreshCw, Trophy, Unlock } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

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
  answers?: string
  xpEarned?: number
  masteryCount?: number
  isLessonCompleted?: string
  nextLessonUnlocked?: string
  nextLessonTitle?: string
}

export const Route = createFileRoute('/_auth/app/test-summary/$lessonId')({
  component: TestSummaryPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      correct: Number(search.correct) || 0,
      incorrect: Number(search.incorrect) || 0,
      total: Number(search.total) || 0,
      answers: (search.answers as string) || '[]',
      xpEarned: search.xpEarned ? Number(search.xpEarned) : undefined,
      masteryCount: search.masteryCount ? Number(search.masteryCount) : undefined,
      isLessonCompleted: search.isLessonCompleted as string | undefined,
      nextLessonUnlocked: search.nextLessonUnlocked as string | undefined,
      nextLessonTitle: search.nextLessonTitle as string | undefined,
    }
  },
})

function TestSummaryPage() {
  const { lessonId } = useParams({ from: '/_auth/app/test-summary/$lessonId' })
  const {
    correct,
    incorrect,
    total,
    answers: answersJson,
    xpEarned,
    masteryCount: masteryCountParam,
    isLessonCompleted: isLessonCompletedParam,
    nextLessonUnlocked: nextLessonUnlockedParam,
    nextLessonTitle: nextLessonTitleParam,
  } = useSearch({
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
  const actualXpEarned = xpEarned ?? (correct ?? 0) * 10

  const masteryResult = masteryCountParam !== undefined
    ? {
        masteryCount: masteryCountParam,
        masteryRequired: 2,
        isCompleted: isLessonCompletedParam === 'true',
        nextLessonUnlocked: nextLessonUnlockedParam === 'true',
        nextLessonTitle: nextLessonTitleParam ?? null,
      }
    : null

  const isSuccess = score >= 70

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden pb-24">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        {isSuccess
          ? (
              <div className="absolute top-[20%] right-[50%] translate-x-1/2 w-[80%] h-[40%] rounded-full opacity-30 blur-[130px] bg-linear-to-r from-emerald-600 to-cyan-600" />
            )
          : (
              <div className="absolute top-[20%] right-[50%] translate-x-1/2 w-[80%] h-[40%] rounded-full opacity-30 blur-[130px] bg-linear-to-r from-orange-600 to-red-600" />
            )}
      </div>

      <AppHeader title="Résultats du Test" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />

      <main className="relative z-10 mx-auto max-w-lg px-6 pt-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header Result */}
          <motion.div variants={itemVariants} className="text-center space-y-2 py-6">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border backdrop-blur-md shadow-2xl">
              <span className="text-4xl">
                {isSuccess ? '🎉' : '💪'}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {isSuccess ? 'Excellent Travail !' : 'On continue les efforts !'}
            </h2>
            <p className="text-muted-foreground">
              {isSuccess
                ? 'Vous maîtrisez ce sujet avec brio.'
                : 'Ne lâchez rien, la maîtrise vient avec la pratique.'}
            </p>
          </motion.div>

          {/* Mastery Progress Card (Highlighted) */}
          {masteryResult && (
            <motion.div variants={itemVariants}>
              <Card className={cn(
                'relative overflow-hidden border-0 bg-card backdrop-blur-xl',
                masteryResult.isCompleted ? 'ring-1 ring-emerald-500/50' : 'ring-1 ring-border',
              )}
              >
                {masteryResult.isCompleted && (
                  <div className="absolute inset-0 bg-emerald-500/5" />
                )}
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center',
                      masteryResult.isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground',
                    )}
                    >
                      {masteryResult.isCompleted ? <Trophy className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">
                        {masteryResult.isCompleted ? 'Leçon Maîtrisée' : 'Progression'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {masteryResult.masteryCount}
                        {' '}
                        /
                        {masteryResult.masteryRequired}
                        {' '}
                        succès requis
                      </p>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(masteryResult.masteryCount / masteryResult.masteryRequired) * 100}%` }}
                      className={cn('h-full', masteryResult.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500')}
                    />
                  </div>

                  {masteryResult.nextLessonUnlocked && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400">
                      <Unlock className="h-4 w-4" />
                      <span className="text-sm font-bold">Prochaine leçon débloquée !</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Score Detail Card */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <Card className="bg-card border-border backdrop-blur-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-2 text-sm text-muted-foreground">Score</div>
                <div className={cn('text-3xl font-bold', isSuccess ? 'text-emerald-500' : 'text-orange-500')}>
                  {score}
                  %
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border backdrop-blur-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-2 text-sm text-muted-foreground">XP Gagnés</div>
                <div className="text-3xl font-bold text-yellow-500">
                  +
                  {actualXpEarned}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Answers Toggle */}
          <motion.div variants={itemVariants}>
            <button
              type="button"
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex w-full items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Détail des réponses
                <span className="ml-2 rounded-full bg-background px-2 text-xs text-muted-foreground">{answers.length}</span>
              </span>
              <span className="text-xs text-indigo-500">
                {showAnswers ? 'Masquer' : 'Voir tout'}
              </span>
            </button>

            {showAnswers && (
              <div className="mt-4 space-y-3">
                {answers.map((answer, i) => (
                  <motion.div
                    key={generateUUID()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-0 bg-card backdrop-blur-sm overflow-hidden">
                      <div className={cn(
                        'h-1 w-full',
                        answer.isCorrect ? 'bg-emerald-500' : 'bg-red-500',
                      )}
                      />
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-foreground mb-3">{answer.question}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Votre réponse</span>
                            <span className={cn(
                              'font-bold',
                              answer.isCorrect ? 'text-emerald-400' : 'text-red-400',
                            )}
                            >
                              {answer.userAnswer}
                            </span>
                          </div>
                          {!answer.isCorrect && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Correct</span>
                              <span className="font-bold text-emerald-500">{answer.correctAnswer}</span>
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

          {/* Actions */}
          <motion.div variants={itemVariants} className="space-y-3 pt-2">
            {incorrectCount > 0 && (
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold"
                onClick={() => navigate({
                  to: '/app/lesson-session/$lessonId',
                  params: { lessonId },
                  search: { mode: 'quiz' },
                })}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Revoir les erreurs (
                {incorrectCount}
                )
              </Button>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="ghost"
                className="flex-1 border border-border bg-card hover:bg-accent text-foreground"
                onClick={() => navigate({ to: '/app' })}
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold"
                onClick={() => navigate({
                  to: '/app/lesson-session/$lessonId',
                  params: { lessonId },
                  search: { mode: 'exam' },
                })}
              >
                <Lock className="mr-2 h-4 w-4" />
                Nouveau Test
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
