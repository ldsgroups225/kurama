import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Download, GraduationCap, Users as UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, DataTable } from '@/components/shared'
import { getUsers, getGradesSimple } from '@/core/functions/users'
import { toast } from 'sonner'

export const Route = createFileRoute('/_admin/users/')({
  component: UsersPage,
})

type UserData = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  profile: {
    userType: 'student' | 'parent' | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    age: number | null
    gender: 'male' | 'female' | null
    city: string | null
    gradeId: number | null
    seriesId: number | null
    xp: number | null
    isCompleted: boolean | null
  } | null
  gradeName: string | null
  seriesName: string | null
}

type Grade = {
  id: number
  name: string
  category: string
}

const userTypeLabels: Record<string, string> = {
  student: 'Élève',
  parent: 'Parent',
}

function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<string>('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [completedFilter, setCompletedFilter] = useState<string>('')

  const { data: gradesData } = useQuery({
    queryKey: ['grades-simple'],
    queryFn: () => getGradesSimple(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search, userTypeFilter, gradeFilter, completedFilter }],
    queryFn: () =>
      getUsers({
        data: {
          page,
          limit: 20,
          search: search || undefined,
          userType: userTypeFilter ? (userTypeFilter as 'student' | 'parent') : undefined,
          gradeId: gradeFilter ? parseInt(gradeFilter) : undefined,
          isCompleted: completedFilter === 'true' ? true : completedFilter === 'false' ? false : undefined,
        },
      }),
  })

  const handleExportCSV = () => {
    if (!data?.users || data.users.length === 0) {
      toast.error('Aucun utilisateur à exporter')
      return
    }

    const headers = ['Nom', 'Email', 'Type', 'Prénom', 'Nom de famille', 'Téléphone', 'Ville', 'Niveau', 'XP', 'Profil complet', 'Date inscription']
    const rows = data.users.map((user: UserData) => [
      user.name,
      user.email,
      user.profile?.userType ? userTypeLabels[user.profile.userType] : '',
      user.profile?.firstName || '',
      user.profile?.lastName || '',
      user.profile?.phone || '',
      user.profile?.city || '',
      user.gradeName || '',
      user.profile?.xp?.toString() || '0',
      user.profile?.isCompleted ? 'Oui' : 'Non',
      new Date(user.createdAt).toLocaleDateString('fr-FR'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Export CSV téléchargé')
  }

  const columns = [
    {
      key: 'user',
      header: 'Utilisateur',
      cell: (user: UserData) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (user: UserData) => {
        if (!user.profile?.userType) {
          return <Badge variant="outline">Non défini</Badge>
        }
        return (
          <Badge variant={user.profile.userType === 'student' ? 'default' : 'secondary'}>
            {user.profile.userType === 'student' ? (
              <GraduationCap className="mr-1 h-3 w-3" />
            ) : (
              <UsersIcon className="mr-1 h-3 w-3" />
            )}
            {userTypeLabels[user.profile.userType]}
          </Badge>
        )
      },
    },
    {
      key: 'grade',
      header: 'Niveau',
      cell: (user: UserData) => (
        <span className="text-sm">
          {user.gradeName || '-'}
          {user.seriesName && ` (${user.seriesName})`}
        </span>
      ),
    },
    {
      key: 'xp',
      header: 'XP',
      cell: (user: UserData) => (
        <Badge variant="outline" className="font-mono">
          {user.profile?.xp?.toLocaleString('fr-FR') || 0}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (user: UserData) => (
        <div className="flex flex-col gap-1">
          {user.profile?.isCompleted ? (
            <Badge className="bg-success text-success-foreground">Profil complet</Badge>
          ) : (
            <Badge variant="outline">Profil incomplet</Badge>
          )}
          {user.emailVerified && (
            <Badge variant="secondary" className="text-xs">Email vérifié</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Inscription',
      cell: (user: UserData) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gérer les utilisateurs de la plateforme"
        actions={
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={userTypeFilter || 'all'}
          onValueChange={(value) => {
            setUserTypeFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="student">Élèves</SelectItem>
            <SelectItem value="parent">Parents</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={gradeFilter || 'all'}
          onValueChange={(value) => {
            setGradeFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {gradesData?.map((grade: Grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={completedFilter || 'all'}
          onValueChange={(value) => {
            setCompletedFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut profil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Profil complet</SelectItem>
            <SelectItem value="false">Profil incomplet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur trouvé"
      />
    </div>
  )
}
