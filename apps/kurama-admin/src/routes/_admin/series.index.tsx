import type { UpdateSeriesInput } from '@/core/functions/grades'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Pencil, Plus, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SeriesForm } from '@/components/admin/series'
import { DataTable, PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getSeries,
  updateSeries,
} from '@/core/functions/grades'

export const Route = createFileRoute('/_admin/series/')({
  component: SeriesPage,
})

interface Series {
  id: number
  name: string
  description: string | null
  displayOrder: number
  lessonCount: number
}

function SeriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ['series-admin', { search }],
    queryFn: () => getSeries(),
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSeriesInput) => updateSeries({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series-admin'] })
      setEditingSeries(null)
      toast.success('Série modifiée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la modification')
    },
  })

  // Filter series based on search
  const filteredSeries = seriesData?.filter((series: Series) =>
    !search || series.name.toLowerCase().includes(search.toLowerCase())
    || series.description?.toLowerCase().includes(search.toLowerCase()),
  ) || []

  const columns = [
    {
      key: 'displayOrder',
      header: '#',
      cell: (series: Series) => (
        <span className="text-muted-foreground font-mono text-sm">{series.displayOrder}</span>
      ),
      className: 'w-12',
    },
    {
      key: 'name',
      header: 'Nom',
      cell: (series: Series) => (
        <div className="font-medium">{series.name}</div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (series: Series) => (
        <span className="text-muted-foreground">
          {series.description || '-'}
        </span>
      ),
    },
    {
      key: 'lessonCount',
      header: 'Leçons',
      cell: (series: Series) => (
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="h-3 w-3" />
          {series.lessonCount}
        </Badge>
      ),
      className: 'w-24',
    },
    {
      key: 'actions',
      header: '',
      cell: (series: Series) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingSeries(series)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-16',
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
        title="Séries"
        description="Gérer les séries du Lycée (A, C, D, E)"
        actions={(
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle série
          </Button>
        )}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSeries}
        page={1}
        totalPages={1}
        total={filteredSeries.length}
        onPageChange={() => { }}
        isLoading={isLoading}
        emptyMessage="Aucune série trouvée"
      />

      {formOpen && (
        <SeriesForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={async () => {
            // For now, we'll just show a message since creation isn't implemented
            toast.info('Création de série non implémentée - contactez l\'administrateur système')
            setFormOpen(false)
          }}
          isLoading={false}
        />
      )}

      {editingSeries && (
        <SeriesForm
          key={editingSeries.id}
          open={!!editingSeries}
          onOpenChange={open => !open && setEditingSeries(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ ...data, id: editingSeries.id })
          }}
          defaultValues={{
            name: editingSeries.name,
            description: editingSeries.description || '',
            displayOrder: editingSeries.displayOrder,
          }}
          isEditing
          isLoading={updateMutation.isPending}
        />
      )}
    </motion.div>
  )
}
