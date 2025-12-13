import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, ChevronRight, Clock, Lock, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getLessonsBySubject } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/subjects/$subjectId')({
  component: LessonsPage,
})

const difficultyConfigs: Record<string, { color: string, label: string, emoji: string }> = {
  easy: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Facile', emoji: '😊' },
  medium: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'Moyen', emoji: '🤔' },
  hard: { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: 'Difficile', emoji: '💪' },
}

function LessonsPage() {
  const { subjectId } = useParams({ from: '/_auth/app/subjects/$subjectId' })
  const navigate = useNavigate()

  useEffect(() => {
    const endTracking = trackRouteLoad('app-lessons')
    return endTracking
  }, [])

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', subjectId],
    queryFn: () => getLessonsBySubject({ data: Number(subjectId) }),
  })

  const subjectName = lessons?.[0]?.subject?.name || 'Leçons'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background - Blue/Indigo for Study Focus */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <AppHeader
        title={subjectName}
        showAvatar={false}
        showBackButton
        onBackClick={() => navigate({ to: '/app/subjects' })}
        className="bg-transparent/0 border-none"
      />

      <main className="relative z-10 mx-auto max-w-lg px-5 pt-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-muted mb-4 shadow-xl border border-border">
            <BookOpen className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Choisis ta leçon 📚</h2>
          <p className="text-muted-foreground px-8">Progresse étape par étape pour maîtriser la matière.</p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <LogoLoader size="md" />
          </div>
        )}

        {!isLoading && lessons && lessons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-border rounded-3xl bg-muted/30">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium text-foreground">Aucune leçon disponible</p>
            <p className="text-sm text-muted-foreground">
              De nouvelles leçons arrivent bientôt ! 🚀
            </p>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {lessons?.map((lesson, index) => {
            const isLocked = (lesson as any).isLocked ?? false
            const isCompleted = (lesson as any).isCompleted ?? false
            const difficulty = (lesson as any).difficulty as string
            const estDuration = (lesson as any).estimatedDuration

            const Content = (
              <div className={cn(
                'group relative overflow-hidden rounded-3xl border p-1 transition-all',
                isLocked
                  ? 'border-border bg-muted/20 opacity-60 grayscale'
                  : 'border-border bg-card backdrop-blur-xl hover:bg-accent/50 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10',
              )}
              >
                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/10 backdrop-blur-[1px]">
                    <div className="bg-muted p-2 rounded-full border border-border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}

                <div className="p-4 relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className={cn(
                        'text-lg font-bold mb-1 trantision-colors',
                        isLocked ? 'text-zinc-500' : 'text-foreground group-hover:text-indigo-300',
                      )}
                      >
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-zinc-400 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="shrink-0 pt-1">
                      {isCompleted
                        ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )
                        : !isLocked
                          ? (
                            <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground group-hover:bg-indigo-500/20 group-hover:text-indigo-500 flex items-center justify-center transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          )
                          : null}
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-border pl-2 gap-1.5 font-normal">
                      <span className={cn(
                        'flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
                        isCompleted ? 'bg-emerald-500 text-black' : 'bg-foreground/10 text-muted-foreground',
                      )}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xs">Leçon</span>
                    </Badge>

                    {estDuration && (
                      <Badge variant="outline" className="border-white/10 text-zinc-400 gap-1.5 font-normal bg-transparent">
                        <Clock className="w-3 h-3" />
                        {estDuration}
                        {' '}
                        min
                      </Badge>
                    )}

                    {difficulty && difficultyConfigs[difficulty] && (
                      <Badge variant="outline" className={cn('gap-1.5 font-normal border', difficultyConfigs[difficulty].color)}>
                        <span>{difficultyConfigs[difficulty].emoji}</span>
                        {difficultyConfigs[difficulty].label}
                      </Badge>
                    )}

                    {isCompleted && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                        <Sparkles className="w-3 h-3" />
                        Complété
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )

            return (
              <motion.div key={lesson.id} variants={itemVariants}>
                {isLocked
                  ? (
                    Content
                  )
                  : (
                    <Link
                      to="/app/lessons/$lessonId"
                      params={{ lessonId: String(lesson.id) }}
                      className="block outline-none"
                    >
                      {Content}
                    </Link>
                  )}
              </motion.div>
            )
          })}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
