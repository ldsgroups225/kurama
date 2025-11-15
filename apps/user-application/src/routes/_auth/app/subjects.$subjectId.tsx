import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLessonsBySubject } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/subjects/$subjectId')({
  component: LessonsPage,
})

function LessonsPage() {
  const { subjectId } = useParams({ from: '/_auth/app/subjects/$subjectId' })
  const navigate = useNavigate()

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-lessons')
    return endTracking
  }, [])

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', subjectId],
    queryFn: () => getLessonsBySubject({ data: Number(subjectId) }),
  })

  // Get subject name from first lesson (all lessons have same subject)
  const subjectName = lessons?.[0]?.subject?.name || 'Leçons'

  const difficultyColors: Record<string, string> = {
    easy: 'bg-success text-success',
    medium: 'bg-warning text-warning',
    hard: 'bg-error text-error',
  }

  const difficultyLabels: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  }

  const difficultyEmojis: Record<string, string> = {
    easy: '😊',
    medium: '🤔',
    hard: '💪',
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title={subjectName}
        showAvatar={false}
        showBackButton
        onBackClick={() => navigate({ to: '/app/subjects' })}
      />

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {/* Motivational Header */}
        <div className="py-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">Choisis ta leçon 📚</h2>
          <p className="text-muted-foreground">Chaque leçon te rapproche de ton objectif !</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {lessons && lessons.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className={`
                mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50
              `}
              />
              <p className="mb-2 text-lg font-medium">Aucune leçon disponible</p>
              <p className="text-sm text-muted-foreground">
                De nouvelles leçons arrivent bientôt ! 🚀
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          {lessons?.map((lesson, index) => (
            <Link
              key={lesson.id}
              to="/app/lessons/$lessonId"
              params={{ lessonId: String(lesson.id) }}
              aria-label={`Leçon ${index + 1}: ${lesson.title}`}
            >
              <Card className={`
                group cursor-pointer overflow-hidden border-2 transition-all
                duration-200
                hover:scale-[1.01] hover:border-primary/50 hover:shadow-xl
              `}
              >
                <div className={`
                  pointer-events-none absolute inset-0 bg-linear-to-br
                  from-transparent to-primary/5 opacity-0 transition-opacity
                  group-hover:opacity-100
                `}
                />

                {/* Lesson Number Badge */}
                <div className={`
                  absolute top-3 left-3 flex h-8 w-8 items-center justify-center
                  rounded-full bg-primary/10 text-sm font-bold text-primary
                  shadow-sm
                `}
                >
                  {index + 1}
                </div>

                <CardHeader className="relative pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className={`
                        mb-1 text-lg transition-colors
                        group-hover:text-primary
                      `}
                      >
                        {lesson.title}
                      </CardTitle>
                      {lesson.description && (
                        <p className={`
                          line-clamp-2 text-sm text-muted-foreground
                        `}
                        >
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className={`
                      h-5 w-5 shrink-0 text-muted-foreground transition-all
                      group-hover:translate-x-1 group-hover:text-primary
                    `}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {lesson.difficulty && (
                      <Badge
                        variant="secondary"
                        className={`
                          ${difficultyColors[lesson.difficulty] || ''}
                          text-xs font-medium
                        `}
                      >
                        {difficultyEmojis[lesson.difficulty]}
                        {' '}
                        {difficultyLabels[lesson.difficulty] || lesson.difficulty}
                      </Badge>
                    )}
                    {lesson.estimatedDuration && (
                      <div className={`
                        flex items-center gap-1 rounded-full bg-muted/50 px-2.5
                        py-1 text-xs text-muted-foreground
                      `}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {lesson.estimatedDuration}
                          {' '}
                          min
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
