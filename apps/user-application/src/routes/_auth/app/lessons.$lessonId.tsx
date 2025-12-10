import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  ListChecks,
} from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getLessonDetails } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/lessons/$lessonId')({
  component: LessonModePage,
})

type LearningMode = 'flashcards' | 'quiz' | 'exam'

const learningModes = [
  {
    id: 'flashcards' as LearningMode,
    name: 'Flashcards',
    description: 'Révision avec des cartes mémoire interactives',
    icon: CreditCard,
    color: 'bg-gradient-xp',
    textColor: 'text-xp',
    emoji: '🎴',
    benefit: 'Mémorise facilement',
  },
  {
    id: 'quiz' as LearningMode,
    name: 'Quiz',
    description: 'Testez vos connaissances avec des questions',
    icon: ListChecks,
    color: 'bg-gradient-level',
    textColor: 'text-level',
    emoji: '🎯',
    benefit: 'Teste tes connaissances',
  },
  {
    id: 'exam' as LearningMode,
    name: 'Examen',
    description: 'Simulation d\'examen chronométré',
    icon: FileText,
    color: 'bg-gradient-streak',
    textColor: 'text-streak',
    emoji: '📝',
    benefit: 'Prépare-toi comme un pro',
  },
]

function LessonModePage() {
  const { lessonId } = useParams({ from: '/_auth/app/lessons/$lessonId' })
  const navigate = useNavigate()

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-lesson-mode')
    return endTracking
  }, [])

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Leçon" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <LogoLoader size="md" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Leçon" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Leçon introuvable</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  const lessonData = lesson as any

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title={lessonData?.subject?.name || 'Leçon'}
        showAvatar={false}
        showBackButton
        onBackClick={() =>
          navigate({
            to: '/app/subjects/$subjectId',
            params: { subjectId: String(lessonData?.subjectId) },
          })}
      />

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {/* Lesson Overview Card */}
        <Card className="overflow-hidden border-2">
          <div className={`
            pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5
            to-transparent
          `}
          />
          <CardHeader className="relative">
            <div className="flex items-start gap-4">
              <div className={`
                flex h-16 w-16 items-center justify-center rounded-2xl
                bg-primary/10 shadow-lg
              `}
              >
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="mb-2 text-xl">{lessonData?.title}</CardTitle>
                {lessonData?.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {lessonData.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {lessonData?.estimatedDuration && (
                <div className={`
                  flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5
                  text-sm text-muted-foreground
                `}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {lessonData.estimatedDuration}
                    {' '}
                    min
                  </span>
                </div>
              )}
              <div className={`
                flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5
                text-sm text-muted-foreground
              `}
              >
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">
                  {lessonData?.cards?.length || 0}
                  {' '}
                  cartes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Header */}
        <div className="py-2 text-center">
          <h2 className="mb-1 text-xl font-bold">Choisis ton mode d'apprentissage 🎯</h2>
          <p className="text-sm text-muted-foreground">Sélectionne comment tu veux étudier cette leçon</p>
        </div>

        {/* Learning Modes - Clickable Cards */}
        <div className="grid grid-cols-1 gap-4">
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
                className="w-full text-left"
              >
                <Card className={`
                  group cursor-pointer overflow-hidden border-2 transition-all
                  duration-200
                  hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl
                `}
                >
                  <div className={`
                    pointer-events-none absolute inset-0 bg-linear-to-br
                    from-transparent to-primary/5 opacity-0 transition-opacity
                    group-hover:opacity-100
                  `}
                  />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            flex h-16 w-16 items-center justify-center
                            rounded-2xl
                            ${mode.color}
                            shadow-lg transition-transform duration-200
                            group-hover:scale-110
                          `}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <CardTitle className={`
                              text-lg transition-colors
                              group-hover:text-primary
                            `}
                            >
                              {mode.name}
                            </CardTitle>
                            <span className="text-xl">{mode.emoji}</span>
                          </div>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {mode.description}
                          </p>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 font-medium text-primary"
                          >
                            {mode.benefit}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className={`
                        h-6 w-6 shrink-0 text-muted-foreground transition-all
                        group-hover:translate-x-1 group-hover:text-primary
                      `}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </button>
            )
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
