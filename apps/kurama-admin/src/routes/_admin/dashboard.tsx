import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Layers,
  TrendingUp,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getContentStats,
  getDashboardStats,
  getRecentActivity,
  getSessionGrowth,
  getUserGrowth,
} from '@/core/functions/analytics'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_admin/dashboard')({
  component: DashboardPage,
})

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  delay?: number
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl transition-all hover:shadow-lg hover:border-primary/20 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{value.toLocaleString('fr-FR')}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">
                +
                {trend.value}
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="border-sidebar-border/50 bg-sidebar/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

interface SubjectStat {
  id: number
  name: string
  abbreviation: string
  lessonCount: number
  cardCount: number
  publishedLessonCount: number
}

interface RecentSession {
  id: number
  userId: string
  userName: string | null
  userEmail: string | null
  lessonId: number | null
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

  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['user-growth'],
    queryFn: () => getUserGrowth(),
  })

  const { data: sessionGrowth, isLoading: sessionGrowthLoading } = useQuery({
    queryKey: ['session-growth'],
    queryFn: () => getSessionGrowth(),
  })

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent w-fit">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de la plateforme Kurama
        </p>
      </motion.div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )
          : (
              <>
                <StatCard
                  title="Utilisateurs"
                  value={stats?.users.total || 0}
                  description={`${stats?.users.students || 0} élèves, ${stats?.users.parents || 0} parents`}
                  icon={<Users className="h-4 w-4" />}
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
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <StatCard
                  title="Cartes"
                  value={stats?.content.cards || 0}
                  description={`${stats?.content.subjects || 0} matières`}
                  icon={<Layers className="h-4 w-4" />}
                />
                <StatCard
                  title="Sessions d'étude"
                  value={stats?.sessions.total || 0}
                  description={`${stats?.sessions.today || 0} aujourd'hui`}
                  icon={<Activity className="h-4 w-4" />}
                />
              </>
            )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )
          : (
              <>
                <StatCard
                  title="Profils complétés"
                  value={`${stats?.users.total ? Math.round((stats.users.completedProfiles / stats.users.total) * 100) : 0}%`}
                  description="des utilisateurs inscrits"
                  icon={<CheckCircle className="h-4 w-4" />}
                />
                <StatCard
                  title="Matières actives"
                  value={stats?.content.subjects || 0}
                  description="Matières avec contenu"
                  icon={<GraduationCap className="h-4 w-4" />}
                />
              </>
            )}
      </div>

      {/* Charts */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Croissance des utilisateurs</CardTitle>
            <CardDescription>
              Inscriptions des 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthLoading
              ? (
                  <Skeleton className="h-[200px] w-full" />
                )
              : userGrowth && userGrowth.length > 0
                ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={userGrowth}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          className="text-xs text-muted-foreground"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          className="text-xs text-muted-foreground"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            borderRadius: 'var(--radius)',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                          labelFormatter={value =>
                            new Date(value).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          formatter={(value: number) => [value, 'Inscriptions']}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucune donnée disponible
                    </p>
                  )}
          </CardContent>
        </Card>

        {/* Session Activity Chart */}
        <Card className="border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Activité d'étude</CardTitle>
            <CardDescription>
              Sessions des 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionGrowthLoading
              ? (
                  <Skeleton className="h-[200px] w-full" />
                )
              : sessionGrowth && sessionGrowth.length > 0
                ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={sessionGrowth}>
                        <defs>
                          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          className="text-xs text-muted-foreground"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          className="text-xs text-muted-foreground"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            borderRadius: 'var(--radius)',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                          labelFormatter={value =>
                            new Date(value).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          formatter={(value: number, name: string) => [
                            value,
                            name === 'count' ? 'Sessions' : 'Cartes révisées',
                          ]}
                        />
                        <Bar dataKey="count" fill="url(#colorSessions)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucune donnée disponible
                    </p>
                  )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Content by Subject */}
        <Card className="border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Contenu par matière</CardTitle>
            <CardDescription>
              Répartition des leçons et cartes par matière
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentLoading
              ? (
                  <div className="space-y-3">
                    {[...Array.from({ length: 5 })].map(() => (
                      <div key={generateUUID()} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                )
              : contentStats && contentStats.length > 0
                ? (
                    <div className="space-y-4">
                      {contentStats.map((subject: SubjectStat) => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              {subject.abbreviation}
                            </Badge>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {subject.lessonCount}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {subject.cardCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune matière trouvée
                    </p>
                  )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-sidebar-border/50 bg-sidebar/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières sessions d'étude
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading
              ? (
                  <div className="space-y-3">
                    {[...Array.from({ length: 5 })].map(() => (
                      <div key={generateUUID()} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : recentActivity && recentActivity.length > 0
                ? (
                    <div className="space-y-4">
                      {recentActivity.map((session: RecentSession) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-4 group cursor-default"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <GraduationCap className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {session.userName || session.userEmail || 'Utilisateur'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                              <span className="truncate max-w-[150px]">{session.lessonTitle || 'Leçon'}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              {session.cardsReviewed}
                              {' '}
                              cartes
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              {new Date(session.startedAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune activité récente
                    </p>
                  )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
