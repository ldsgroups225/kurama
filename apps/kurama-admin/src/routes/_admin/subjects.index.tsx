import type { CreateSubjectInput, UpdateSubjectInput } from '@/lib/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Check, FileText, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SubjectForm } from '@/components/admin/subjects'
import { ConfirmDialog, DataTable, PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  bulkDeleteSubjects,
  bulkToggleSubjectsActive,
  createSubject,
  deleteSubject,
  getSubjects,
  toggleSubjectActive,
  updateSubject,
} from '@/core/functions/subjects'

export const Route = createFileRoute('/_admin/subjects/')({
  component: SubjectsPage,
})

interface Subject {
  id: number
  name: string
  abbreviation: string
  description: string | null
  displayOrder: number
  isActive: boolean
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
  const [selectedIds, setSelectedIds] = useState(() => new Set<number>())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

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

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) =>
      toggleSubjectActive({ data: { id, isActive } }),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success(`Matière ${isActive ? 'activée' : 'désactivée'} avec succès`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteSubjects({ data: ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setBulkDeleteOpen(false)
      setSelectedIds(new Set())
      toast.success(`${result.deleted} matière(s) supprimée(s) avec succès`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const bulkActiveMutation = useMutation({
    mutationFn: (data: { ids: number[], isActive: boolean }) => bulkToggleSubjectsActive({ data }),
    onSuccess: (result, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setSelectedIds(new Set())
      toast.success(`${result.updated} matière(s) ${isActive ? 'activée(s)' : 'désactivée(s)'} avec succès`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
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
      className: 'w-32 min-w-32',
    },
    {
      key: 'description',
      header: 'Description',
      cell: (subject: Subject) => (
        <span className="text-muted-foreground block truncate" title={subject.description || undefined}>
          {subject.description || '-'}
        </span>
      ),
      className: 'max-w-xs',
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
      className: 'w-36',
    },
    {
      key: 'active',
      header: 'Actif',
      cell: (subject: Subject) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={subject.isActive}
            onCheckedChange={checked =>
              toggleActiveMutation.mutate({ id: subject.id, isActive: checked })}
            disabled={toggleActiveMutation.isPending}
          />
          <span className="text-sm text-muted-foreground">
            {subject.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
      ),
      className: 'w-28',
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
          selectedIds.size > 0
            ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size}
                    {' '}
                    sélectionné
                    {selectedIds.size > 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkActiveMutation.mutate({ ids: Array.from(selectedIds), isActive: true })}
                    disabled={bulkActiveMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Activer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkActiveMutation.mutate({ ids: Array.from(selectedIds), isActive: false })}
                    disabled={bulkActiveMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Désactiver
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer (
                    {selectedIds.size}
                    )
                  </Button>
                </div>
              )
            : (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle matière
                </Button>
              )
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
        data={data?.subjects || []}
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Aucune matière trouvée"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={subject => subject.id}
      />

      {formOpen && (
        <SubjectForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data)
          }}
          isLoading={createMutation.isPending}
        />
      )}

      {editingSubject && (
        <SubjectForm
          key={editingSubject.id}
          open={!!editingSubject}
          onOpenChange={open => !open && setEditingSubject(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ ...data, id: editingSubject.id })
          }}
          defaultValues={{
            name: editingSubject.name,
            abbreviation: editingSubject.abbreviation,
            description: editingSubject.description ?? undefined,
            displayOrder: editingSubject.displayOrder,
            isActive: editingSubject.isActive,
          }}
          isEditing
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deletingSubject}
        onOpenChange={open => !open && setDeletingSubject(null)}
        title="Supprimer la matière"
        description={`Êtes-vous sûr de vouloir supprimer "${deletingSubject?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={() => deletingSubject && deleteMutation.mutate(deletingSubject.id)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Supprimer les matières sélectionnées"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} matière${selectedIds.size > 1 ? 's' : ''} ? Cette action est irréversible. Les matières avec des leçons ne seront pas supprimées.`}
        confirmLabel={`Supprimer (${selectedIds.size})`}
        onConfirm={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
        isLoading={bulkDeleteMutation.isPending}
        variant="destructive"
      />
    </motion.div>
  )
}
