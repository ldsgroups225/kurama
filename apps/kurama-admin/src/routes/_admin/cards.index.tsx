import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Copy, Search, Eye, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PageHeader, DataTable, ConfirmDialog } from '@/components/shared'
import { CardForm, CardPreview, BulkImportDialog } from '@/components/admin/cards'
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  duplicateCard,
  getLessonsSimple,
  bulkCreateCards,
} from '@/core/functions/cards'
import type { CreateCardInput, UpdateCardInput, CardOption } from '@/lib/schemas'
import { toast } from 'sonner'

export const Route = createFileRoute('/_admin/cards/')({
  component: CardsPage,
})

type Card = {
  id: number
  lessonId: number
  lessonTitle: string | null
  cardType: string
  frontContent: string
  backContent: string
  question: string | null
  options: CardOption[] | null
  correctAnswer: string | null
  explanation: string | null
  hints: string[] | null
  timeLimit: number | null
  points: number | null
  difficulty: number | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

type Lesson = {
  id: number
  title: string
  subjectId: number
}

const cardTypeLabels: Record<string, string> = {
  basic: 'Basique',
  multichoice: 'Choix multiple',
  true_false: 'Vrai/Faux',
  fill_blank: 'Texte à trous',
}

function CardsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [lessonFilter, setLessonFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [deletingCard, setDeletingCard] = useState<Card | null>(null)
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const { data: lessonsData } = useQuery({
    queryKey: ['lessons-simple'],
    queryFn: () => getLessonsSimple(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['cards', { page, search, lessonFilter, typeFilter }],
    queryFn: () =>
      getCards({
        data: {
          page,
          limit: 20,
          search: search || undefined,
          lessonId: lessonFilter ? parseInt(lessonFilter) : undefined,
          cardType: typeFilter ? (typeFilter as 'basic' | 'multichoice' | 'true_false' | 'fill_blank') : undefined,
        },
      }),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateCardInput) => createCard({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setFormOpen(false)
      toast.success('Carte créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCardInput) => updateCard({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setEditingCard(null)
      toast.success('Carte modifiée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => duplicateCard({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Carte dupliquée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la duplication')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCard({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setDeletingCard(null)
      toast.success('Carte supprimée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const bulkImportMutation = useMutation({
    mutationFn: (data: { lessonId: number; cards: CreateCardInput[] }) =>
      bulkCreateCards({ data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setImportOpen(false)
      toast.success(`${result.created} carte(s) importée(s) avec succès`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'import')
    },
  })

  const columns = [
    {
      key: 'frontContent',
      header: 'Contenu',
      cell: (card: Card) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{card.frontContent}</div>
          <div className="text-sm text-muted-foreground truncate">
            {card.lessonTitle || 'Sans leçon'}
          </div>
        </div>
      ),
    },
    {
      key: 'cardType',
      header: 'Type',
      cell: (card: Card) => (
        <Badge variant="outline">
          {cardTypeLabels[card.cardType] || card.cardType}
        </Badge>
      ),
    },
    {
      key: 'points',
      header: 'Points',
      cell: (card: Card) => (
        <Badge variant="secondary">{card.points || 10} pts</Badge>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulté',
      cell: (card: Card) => {
        const diff = card.difficulty || 0
        return (
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i < diff ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            ))}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      cell: (card: Card) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreviewCard(card)}
            title="Aperçu"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => duplicateMutation.mutate(card.id)}
            title="Dupliquer"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingCard(card)}
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingCard(card)}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-40',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartes"
        description="Gérer les cartes de révision"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle carte
            </Button>
          </div>
        }
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
          value={lessonFilter || 'all'}
          onValueChange={(value) => {
            setLessonFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les leçons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les leçons</SelectItem>
            {lessonsData?.map((lesson: Lesson) => (
              <SelectItem key={lesson.id} value={lesson.id.toString()}>
                {lesson.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={typeFilter || 'all'}
          onValueChange={(value) => {
            setTypeFilter(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(cardTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.cards || []}
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Aucune carte trouvée"
      />

      <CardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
        }}
        lessons={lessonsData || []}
        isLoading={createMutation.isPending}
      />

      {editingCard && (
        <CardForm
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ ...data, id: editingCard.id })
          }}
          lessons={lessonsData || []}
          defaultValues={{
            lessonId: editingCard.lessonId,
            cardType: editingCard.cardType as 'basic' | 'multichoice' | 'true_false' | 'fill_blank',
            frontContent: editingCard.frontContent,
            backContent: editingCard.backContent,
            question: editingCard.question || undefined,
            options: editingCard.options || undefined,
            correctAnswer: editingCard.correctAnswer || undefined,
            explanation: editingCard.explanation || undefined,
            points: editingCard.points || 10,
            difficulty: editingCard.difficulty || 0,
            displayOrder: editingCard.displayOrder,
          }}
          isEditing
          isLoading={updateMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deletingCard}
        onOpenChange={(open) => !open && setDeletingCard(null)}
        title="Supprimer la carte"
        description={`Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={() => deletingCard && deleteMutation.mutate(deletingCard.id)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      {/* Preview Sheet */}
      <Sheet open={!!previewCard} onOpenChange={(open) => !open && setPreviewCard(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Aperçu de la carte</SheetTitle>
          </SheetHeader>
          {previewCard && (
            <div className="mt-6">
              <CardPreview
                cardType={previewCard.cardType as 'basic' | 'multichoice' | 'true_false' | 'fill_blank'}
                frontContent={previewCard.frontContent}
                backContent={previewCard.backContent}
                question={previewCard.question || undefined}
                options={previewCard.options || undefined}
                correctAnswer={previewCard.correctAnswer || undefined}
                explanation={previewCard.explanation || undefined}
                points={previewCard.points || 10}
                difficulty={previewCard.difficulty || 0}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        lessonId={lessonFilter ? parseInt(lessonFilter) : 0}
        onImport={async (cards) => {
          if (!lessonFilter) {
            toast.error('Veuillez sélectionner une leçon pour l\'import')
            return
          }
          const lessonIdNum = parseInt(lessonFilter)
          await bulkImportMutation.mutateAsync({
            lessonId: lessonIdNum,
            cards: cards.map((card) => ({
              lessonId: lessonIdNum,
              cardType: card.cardType,
              frontContent: card.frontContent || '',
              backContent: card.backContent || '',
              question: card.question,
              options: card.options?.map((opt, idx) => ({
                id: idx.toString(),
                text: opt,
                isCorrect: card.correctAnswer === idx,
              })),
              correctAnswer: card.correctAnswer?.toString(),
              explanation: card.explanation,
              points: card.points || 10,
              difficulty: card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 2 : card.difficulty === 'hard' ? 3 : 1,
              displayOrder: 0,
            })),
          })
        }}
        isLoading={bulkImportMutation.isPending}
      />
    </div>
  )
}
