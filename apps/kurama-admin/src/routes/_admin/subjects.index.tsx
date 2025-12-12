import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, BookOpen, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader, DataTable, ConfirmDialog } from '@/components/shared'
import { SubjectForm } from '@/components/admin/subjects'
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '@/core/functions/subjects'
import type { CreateSubjectInput, UpdateSubjectInput } from '@/lib/schemas'
import { toast } from 'sonner'

export const Route = createFileRoute('/_admin/subjects/')({
  component: SubjectsPage,
})

type Subject = {
  id: number
  name: string
  abbreviation: string
  description: string | null
  displayOrder: number
  lessonCount: number
  cardCount: number
}

function SubjectsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', { page, search }],
    queryFn: () => getSubjects({ data: { page, limit: 20, search: search || undefined } }),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateSubjectInput) => createSubject({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setFormOpen(false)
      toast.success('Matière créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSubjectInput) => updateSubject({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setEditingSubject(null)
      toast.success('Matière modifiée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubject({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setDeletingSubject(null)
      toast.success('Matière supprimée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const columns = [
    {
      key: 'name',
      header: 'Nom',
      cell: (subject: Subject) => (
        <div>
          <div className="font-medium">{subject.name}</div>
          <div className="text-sm text-muted-foreground">{subject.abbreviation}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (subject: Subject) => (
        <span className="text-muted-foreground line-clamp-1">
          {subject.description || '-'}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'Contenu',
      cell: (subject: Subject) => (
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {subject.lessonCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {subject.cardCount}
          </Badge>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Ordre',
      cell: (subject: Subject) => subject.displayOrder,
      className: 'w-20',
    },
    {
      key: 'actions',
      header: '',
      cell: (subject: Subject) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingSubject(subject)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingSubject(subject)}
            disabled={subject.lessonCount > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24',
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
        title="Matières"
        description="Gérer les matières du programme"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle matière
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
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
      </div>

      <DataTable
        columns={columns}
        data={data?.subjects.map((subject) => {
          // if description is too long, show in ellipsis
          const description = subject.description || ''
          if (description.length > 110) {
            return { ...subject, id: subject.id, description: description.substring(0, 110) + '...' }
          }
          return { ...subject, id: subject.id }
        }) || []}
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Aucune matière trouvée"
      />

      <SubjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
        }}
        isLoading={createMutation.isPending}
      />

      {editingSubject && (
        <SubjectForm
          open={!!editingSubject}
          onOpenChange={(open) => !open && setEditingSubject(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ ...data, id: editingSubject.id })
          }}
          defaultValues={{
            name: editingSubject.name,
            abbreviation: editingSubject.abbreviation,
            description: editingSubject.description ?? undefined,
            displayOrder: editingSubject.displayOrder,
          }}
          isEditing
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
        title="Supprimer la matière"
        description={`Êtes-vous sûr de vouloir supprimer "${deletingSubject?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={() => deletingSubject && deleteMutation.mutate(deletingSubject.id)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </motion.div>
  )
}
