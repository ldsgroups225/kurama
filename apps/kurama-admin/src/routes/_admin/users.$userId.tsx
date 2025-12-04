import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  GraduationCap,
  BookOpen,
  Trophy,
  Clock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || 'Utilisateur'}
        description={user.email}
        actions={
          <Button variant="outline" asChild>
            <Link to="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        }
      />

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {user.profile?.userType
                  ? userTypeLabels[user.profile.userType] || user.profile.userType
                  : 'Non défini'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Niveau</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {user.profile?.gradeName || 'Non défini'}
                {user.profile?.seriesName && ` (${user.profile.seriesName})`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>XP Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.profile?.xp || 0} XP</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inscrit le</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="sessions">Sessions d'étude</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="font-medium">{user.profile?.firstName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{user.profile?.lastName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{user.profile?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ville</p>
                  <p className="font-medium">{user.profile?.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Âge</p>
                  <p className="font-medium">{user.profile?.age || '-'}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Statut du profil</p>
                <Badge variant={user.profile?.isCompleted ? 'default' : 'secondary'}>
                  {user.profile?.isCompleted ? 'Profil complet' : 'Profil incomplet'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions d'étude récentes</CardTitle>
              <CardDescription>
                Les 10 dernières sessions d'étude de l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session.lessonTitle || 'Leçon inconnue'}</p>
                          <p className="text-sm text-muted-foreground">
                            Mode: {session.mode} • {session.cardsReviewed} cartes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {session.cardsCorrect}/{session.cardsReviewed} correctes
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {session.duration ? `${Math.round(session.duration / 60)} min` : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune session d'étude
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
