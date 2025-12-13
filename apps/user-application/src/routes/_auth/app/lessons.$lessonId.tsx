import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  ListChecks,
  Target,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getLessonDetails } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'
import { getXPRateText } from '@/lib/xp-rates'

export const Route = createFileRoute('/_auth/app/lessons/$lessonId')({
  component: LessonModePage,
})

type LearningMode = 'flashcards' | 'quiz' | 'exam'

const learningModes = [
  {
    id: 'flashcards' as LearningMode,
    name: 'Flashcards',
    description: 'Mémorise rapidement les concepts clés',
    icon: CreditCard,
    gradient: 'from-amber-400 to-orange-500',
    emoji: '🎴',
    tag: 'Mémorisation',
  },
  {
    id: 'quiz' as LearningMode,
    name: 'Quiz Rapide',
    description: 'Teste tes connaissances en quelques minutes',
    icon: ListChecks,
    gradient: 'from-emerald-400 to-green-600',
    emoji: '🎯',
    tag: 'Entraînement',
  },
  {
    id: 'exam' as LearningMode,
    name: 'Mode Examen',
    description: 'Simulation complète en conditions réelles',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '📝',
    tag: 'Évaluation',
  },
]

function LessonModePage() {
  const { lessonId } = useParams({ from: '/_auth/app/lessons/$lessonId' })
  const navigate = useNavigate()

  useEffect(() => {
    const endTracking = trackRouteLoad('app-lesson-mode')
    return endTracking
  }, [])

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground pb-24">
        <AppHeader title="Leçon" showAvatar={false} className="bg-transparent/0 border-none" />
        <p className="text-zinc-500">Leçon introuvable</p>
        <BottomNav />
      </div>
    )
  }

  const lessonData = lesson as any

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-violet-600/10 blur-[130px]" />
      </div>

      <AppHeader
        title={lessonData?.subject?.name || 'Leçon'}
        showAvatar={false}
        showBackButton
        onBackClick={() =>
          navigate({
            to: '/app/subjects/$subjectId',
            params: { subjectId: String(lessonData?.subjectId) },
          })}
        className="bg-transparent/0 border-none"
      />

      <main className="relative z-10 mx-auto max-w-lg px-5 pt-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main Lesson Card */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-4xl bg-card border border-border p-1">
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="relative p-6 text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-6">
                <BookOpen className="h-10 w-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                {lessonData?.title}
              </h1>

              {lessonData?.description && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {lessonData.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-2">
                {lessonData?.estimatedDuration && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-border hover:bg-muted/80 px-3 py-1.5 h-auto text-xs font-normal gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {lessonData.estimatedDuration}
                    {' '}
                    min
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-border hover:bg-muted/80 px-3 py-1.5 h-auto text-xs font-normal gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  {lessonData?.cards?.length || 0}
                  {' '}
                  cartes
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Mode Selection */}
          <motion.div variants={itemVariants}>
            <div className="px-2 mb-4 flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-400/10">
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Mode d'apprentissage</h2>
            </div>

            <div className="space-y-3">
              {learningModes.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      navigate({
                        to: '/app/lesson-session/$lessonId',
                        params: { lessonId },
                        search: { mode: mode.id },
                      })}
                    className="w-full text-left outline-none group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:bg-accent/50 hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={cn(
                          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-lg',
                          mode.gradient,
                        )}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-foreground">
                              {mode.name}
                            </h3>
                            <Badge className="bg-muted text-muted-foreground border-0 px-1.5 py-0 h-5 text-[10px]">
                              {mode.tag}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                            {mode.description}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-xp font-medium">
                            <Zap className="w-3 h-3" />
                            <span>{getXPRateText(mode.id)}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
