import type { CreateLessonInput, UpdateLessonInput } from '@/lib/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink, Eye, EyeOff, FileText, Pencil, Plus, Search, Sparkles, Trash2, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BulkCardsDialog, BulkGenerateDialog, LessonForm } from '@/components/admin/lessons'
import { ConfirmDialog, DataTable, PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createLesson,
  deleteLesson,
  getLessons,
  toggleLessonPublish,
  updateLesson,
} from '@/core/functions/lessons'
import { getSubjectsSimple } from '@/core/functions/subjects'

export const Route = createFileRoute('/_admin/lessons/')({
  component: LessonsPage,
})

interface Lesson {
  id: number
  title: string
  description: string | null
  difficulty: string | null
  estimatedDuration: number | null
  isPublished: boolean
  publishedAt: string | null
  displayOrder: number
  createdAt: string
  subjectId: number
  subjectName: string | null
  subjectAbbreviation: string | null
  gradeId: number | null
  gradeName: string | null
  seriesId: number | null
  seriesName: string | null
  cardCount: number
  hasTeachPlan: boolean
}

interface Subject {
  id: number
  name: string
  abbreviation: string
}

function LessonsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [publishedFilter, setPublishedFilter] = useState<string>('')
  const [teachPlanFilter, setTeachPlanFilter] = useState<string>('')
  const [cardsFilter, setCardsFilter] = useState<string>('')
  const [formOpen, setFormOpen] = useState(false)
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false)
  const [bulkCardsOpen, setBulkCardsOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => getSubjectsSimple(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['lessons', { page, search, subjectFilter, publishedFilter, teachPlanFilter, cardsFilter }],
    queryFn: () =>
      getLessons({
        data: {
          page,
          limit: 20,
          search: search || undefined,
          subjectId: subjectFilter ? Number.parseInt(subjectFilter) : undefined,
          isPublished: publishedFilter === '' || publishedFilter === 'all' ? undefined : publishedFilter === 'true',
          hasTeachPlan: teachPlanFilter === '' || teachPlanFilter === 'all' ? undefined : teachPlanFilter === 'true',
          hasCards: cardsFilter === '' || cardsFilter === 'all' ? undefined : cardsFilter === 'true',
        },
      }),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateLessonInput) => createLesson({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setFormOpen(false)
      toast.success('Leçon créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateLessonInput) => updateLesson({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setEditingLesson(null)
      toast.success('Leçon modifiée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: (id: number) => toggleLessonPublish({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Statut de publication modifié')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLesson({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setDeletingLesson(null)
      toast.success('Leçon supprimée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const difficultyLabels: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  }

  const columns = [
    {
      key: 'displayOrder',
      header: '#',
      cell: (lesson: Lesson) => (
        <span className="text-muted-foreground font-mono text-sm">{lesson.displayOrder}</span>
      ),
      className: 'w-12',
    },
    {
      key: 'title',
      header: 'Titre',
      cell: (lesson: Lesson) => (
        <div>
          <Link
            to="/lessons/$lessonId"
            params={{ lessonId: lesson.id.toString() }}
            className="font-medium hover:underline flex items-center gap-1"
          >
            {lesson.title}
            <ExternalLink className="h-3 w-3" />
          </Link>
          <div className="text-sm text-muted-foreground">
            {lesson.subjectName}
            {' '}
            (
            {lesson.subjectAbbreviation}
            )
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Niveau',
      cell: (lesson: Lesson) => (
        <div className="text-sm">
          {lesson.gradeName
            ? (
              <div>
                <span className="font-medium">{lesson.gradeName}</span>
                {lesson.seriesName && (
                  <span className="text-muted-foreground ml-1">
                    (
                    {lesson.seriesName}
                    )
                  </span>
                )}
              </div>
            )
            : (
              <span className="text-muted-foreground">-</span>
            )}
        </div>
      ),
    },
    {
      key: 'teachPlan',
      header: 'Plan IA',
      cell: (lesson: Lesson) => (
        lesson.hasTeachPlan
          ? (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
              <Sparkles className="h-3 w-3" />
              Généré
            </Badge>
          )
          : (
            <span className="text-muted-foreground text-sm">-</span>
          )
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulté',
      cell: (lesson: Lesson) =>
        lesson.difficulty
          ? (
            <Badge variant="outline">
              {difficultyLabels[lesson.difficulty] || lesson.difficulty}
            </Badge>
          )
          : (
            '-'
          ),
    },
    {
      key: 'duration',
      header: 'Durée',
      cell: (lesson: Lesson) =>
        lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : '-',
    },
    {
      key: 'cards',
      header: 'Cartes',
      cell: (lesson: Lesson) => (
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          {lesson.cardCount}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (lesson: Lesson) => (
        <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
          {lesson.isPublished ? 'Publié' : 'Brouillon'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (lesson: Lesson) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePublishMutation.mutate(lesson.id)}
            title={lesson.isPublished ? 'Dépublier' : 'Publier'}
          >
            {lesson.isPublished
              ? (
                <EyeOff className="h-4 w-4" />
              )
              : (
                <Eye className="h-4 w-4" />
              )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingLesson(lesson)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingLesson(lesson)}
            disabled={lesson.cardCount > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-32',
    },
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Leçons"
        description="Gérer les leçons et leur contenu"
        actions={(
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkGenerateOpen(true)}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Plans en lot
            </Button>
            <Button
              variant="outline"
              onClick={() => setBulkCardsOpen(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Cartes en lot
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle leçon
            </Button>
          </div>
        )}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={subjectFilter || 'all'}
          onValueChange={(value) => {
            setSubjectFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les matières" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {subjectsData?.map((subject: Subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={publishedFilter || 'all'}
          onValueChange={(value) => {
            setPublishedFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Publié</SelectItem>
            <SelectItem value="false">Brouillon</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={teachPlanFilter || 'all'}
          onValueChange={(value) => {
            setTeachPlanFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Plan IA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            <SelectItem value="true">Avec plan IA</SelectItem>
            <SelectItem value="false">Sans plan IA</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={cardsFilter || 'all'}
          onValueChange={(value) => {
            setCardsFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Cartes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="true">Avec cartes</SelectItem>
            <SelectItem value="false">Sans cartes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.lessons || []}
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Aucune leçon trouvée"
      />

      {formOpen && (
        <LessonForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data)
          }}
          subjects={subjectsData || []}
          isLoading={createMutation.isPending}
        />
      )}

      {editingLesson && (
        <LessonForm
          key={editingLesson.id}
          open={!!editingLesson}
          onOpenChange={open => !open && setEditingLesson(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ ...data, id: editingLesson.id })
          }}
          subjects={subjectsData || []}
          defaultValues={{
            title: editingLesson.title,
            description: editingLesson.description || '',
            subjectId: editingLesson.subjectId,
            gradeId: editingLesson.gradeId || undefined,
            seriesId: editingLesson.seriesId || undefined,
            difficulty: editingLesson.difficulty as 'easy' | 'medium' | 'hard' | undefined,
            estimatedDuration: editingLesson.estimatedDuration || undefined,
            isPublished: editingLesson.isPublished,
            displayOrder: editingLesson.displayOrder,
          }}
          isEditing
          isLoading={updateMutation.isPending}
        />
      )}

      <BulkGenerateDialog
        open={bulkGenerateOpen}
        onOpenChange={setBulkGenerateOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['lessons'] })
        }}
      />

      <BulkCardsDialog
        open={bulkCardsOpen}
        onOpenChange={setBulkCardsOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['lessons'] })
        }}
      />

      <ConfirmDialog
        open={!!deletingLesson}
        onOpenChange={open => !open && setDeletingLesson(null)}
        title="Supprimer la leçon"
        description={`Êtes-vous sûr de vouloir supprimer "${deletingLesson?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={() => deletingLesson && deleteMutation.mutate(deletingLesson.id)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </motion.div>
  )
}
