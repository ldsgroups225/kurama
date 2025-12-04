import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardStats, getContentStats, getRecentActivity } from '@/core/functions/analytics'

export const Route = createFileRoute('/_admin/dashboard')({
  component: DashboardPage,
})

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-success">+{trend.value}</span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

type SubjectStat = {
  id: number
  name: string
  abbreviation: string
  lessonCount: number
  cardCount: number
  publishedLessonCount: number
}

type RecentSession = {
  id: number
  userId: string
  userName: string | null
  userEmail: string | null
  lessonId: number
  lessonTitle: string | null
  mode: string
  cardsReviewed: number
  cardsCorrect: number
  duration: number | null
  startedAt: string
  endedAt: string | null
}

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  const { data: contentStats, isLoading: contentLoading } = useQuery({
    queryKey: ['content-stats'],
    queryFn: () => getContentStats(),
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => getRecentActivity(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme Kurama
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Utilisateurs"
              value={stats?.users.total || 0}
              description={`${stats?.users.students || 0} élèves, ${stats?.users.parents || 0} parents`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              trend={
                stats?.users.newThisWeek
                  ? { value: stats.users.newThisWeek, label: 'cette semaine' }
                  : undefined
              }
            />
            <StatCard
              title="Leçons"
              value={stats?.content.lessons || 0}
              description={`${stats?.content.publishedLessons || 0} publiées`}
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Cartes"
              value={stats?.content.cards || 0}
              description={`${stats?.content.subjects || 0} matières`}
              icon={<Layers className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Sessions d'étude"
              value={stats?.sessions.total || 0}
              description={`${stats?.sessions.today || 0} aujourd'hui`}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Profils complétés"
              value={stats?.users.completedProfiles || 0}
              description={`${stats?.users.total ? Math.round((stats.users.completedProfiles / stats.users.total) * 100) : 0}% des utilisateurs`}
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Matières"
              value={stats?.content.subjects || 0}
              description="Matières disponibles"
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content by Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu par matière</CardTitle>
            <CardDescription>
              Répartition des leçons et cartes par matière
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : contentStats && contentStats.length > 0 ? (
              <div className="space-y-3">
                {contentStats.map((subject: SubjectStat) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{subject.abbreviation}</Badge>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{subject.lessonCount} leçons</span>
                      <span>•</span>
                      <span>{subject.cardCount} cartes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune matière trouvée
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières sessions d'étude
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((session: RecentSession) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.userName || session.userEmail || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.lessonTitle || 'Leçon'} • {session.cardsReviewed} cartes
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(session.startedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune activité récente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
