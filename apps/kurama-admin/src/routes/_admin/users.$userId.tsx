import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  Trophy,
  User,
} from 'lucide-react'
import { motion } from 'motion/react'
import { PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserDetail, getUserSessions } from '@/core/functions/users'

export const Route = createFileRoute('/_admin/users/$userId')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const { userId } = Route.useParams()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => getUserDetail({ data: userId }),
  })

  const { data: sessions } = useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => getUserSessions({ data: { userId, limit: 10 } }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
        <Button asChild className="mt-4">
          <Link to="/users">Retour aux utilisateurs</Link>
        </Button>
      </div>
    )
  }

  const userTypeLabels: Record<string, string> = {
    student: 'Élève',
    parent: 'Parent',
  }

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || 'Utilisateur'}
        description={user.email}
        actions={(
          <Button variant="outline" asChild>
            <Link to="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        )}
      />

      {/* User Info Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardDescription>Type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-lg">
                  {user.profile?.userType
                    ? userTypeLabels[user.profile.userType] || user.profile.userType
                    : 'Non défini'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardDescription>Niveau</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-lg">
                  {user.profile?.gradeName || 'Non défini'}
                  {user.profile?.seriesName && ` (${user.profile.seriesName})`}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardDescription>XP Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-lg">
                  {user.profile?.xp || 0}
                  {' '}
                  XP
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardDescription>Inscrit le</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-lg">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-background/50 backdrop-blur-xl border border-border/50">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="sessions">Sessions d'étude</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prénom</p>
                    <p className="font-medium text-lg">{user.profile?.firstName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nom</p>
                    <p className="font-medium text-lg">{user.profile?.lastName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                    <p className="font-medium text-lg">{user.profile?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ville</p>
                    <p className="font-medium text-lg">{user.profile?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Âge</p>
                    <p className="font-medium text-lg">{user.profile?.age || '-'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Statut du profil</p>
                  <Badge variant={user.profile?.isCompleted ? 'default' : 'secondary'} className="px-4 py-1">
                    {user.profile?.isCompleted ? 'Profil complet' : 'Profil incomplet'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Sessions d'étude récentes</CardTitle>
                <CardDescription>
                  Les 10 dernières sessions d'étude de l'utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0
                  ? (
                      <div className="space-y-3">
                        {sessions.map(session => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{session.lessonTitle || 'Leçon inconnue'}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  Mode:
                                  {' '}
                                  <span className="text-foreground">{session.mode}</span>
                                  {' '}
                                  •
                                  {' '}
                                  {session.cardsReviewed}
                                  {' '}
                                  cartes
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                {session.cardsCorrect}
                                /
                                {session.cardsReviewed}
                                {' '}
                                correctes
                              </Badge>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                {session.duration ? `${Math.round(session.duration / 60)} min` : '-'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  : (
                      <p className="text-center text-muted-foreground py-12">
                        Aucune session d'étude
                      </p>
                    )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
