import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, X, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared'
import {
  getGrades,
  getSeries,
  getLevelSeriesMappings,
  toggleGradeActive,
  toggleLevelSeries,
  updateGrade,
  updateSeries,
} from '@/core/functions/grades'
import { toast } from 'sonner'

export const Route = createFileRoute('/_admin/grades/')({
  component: GradesPage,
})

type Grade = {
  id: number
  name: string
  slug: string
  category: string
  isActive: boolean
  displayOrder: number
  lessonCount: number
}

type Series = {
  id: number
  name: string
  description: string | null
  displayOrder: number
  lessonCount: number
}

type LevelSeriesMapping = {
  gradeId: number
  seriesId: number
}

function GradesPage() {
  const queryClient = useQueryClient()
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)

  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades-admin'],
    queryFn: () => getGrades(),
  })

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['series-admin'],
    queryFn: () => getSeries(),
  })

  const { data: mappingsData } = useQuery({
    queryKey: ['level-series-mappings'],
    queryFn: () => getLevelSeriesMappings(),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => toggleGradeActive({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-admin'] })
      toast.success('Statut modifié')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const toggleMappingMutation = useMutation({
    mutationFn: (data: { gradeId: number; seriesId: number; enabled: boolean }) =>
      toggleLevelSeries({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-series-mappings'] })
      toast.success('Association modifiée')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateGradeMutation = useMutation({
    mutationFn: (data: { id: number; name?: string; displayOrder?: number }) =>
      updateGrade({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-admin'] })
      setEditingGrade(null)
      toast.success('Niveau modifié')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateSeriesMutation = useMutation({
    mutationFn: (data: { id: number; name?: string; description?: string; displayOrder?: number }) =>
      updateSeries({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series-admin'] })
      setEditingSeries(null)
      toast.success('Série modifiée')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const isLoading = gradesLoading || seriesLoading

  // Check if a grade-series mapping exists
  const hasMapping = (gradeId: number, seriesId: number) => {
    return mappingsData?.some(
      (m: LevelSeriesMapping) => m.gradeId === gradeId && m.seriesId === seriesId
    )
  }

  // Filter grades by category
  const lyceeGrades = gradesData?.filter((g: Grade) => g.category === 'LYCEE') || []
  const collegeGrades = gradesData?.filter((g: Grade) => g.category === 'COLLEGE') || []
  const primaireGrades = gradesData?.filter((g: Grade) => g.category === 'PRIMAIRE') || []

  const categoryLabels: Record<string, string> = {
    PRIMAIRE: 'Primaire',
    COLLEGE: 'Collège',
    LYCEE: 'Lycée',
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Niveau & Série"
        description="Gérer les niveaux scolaires et les séries du Lycée"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Grades Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Niveaux scolaires</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-center">Leçons</TableHead>
                    <TableHead className="text-center">Actif</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradesData?.map((grade: Grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {grade.displayOrder}
                      </TableCell>
                      <TableCell className="font-medium">{grade.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[grade.category] || grade.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{grade.lessonCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={grade.isActive}
                          onCheckedChange={() => toggleActiveMutation.mutate(grade.id)}
                          disabled={toggleActiveMutation.isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingGrade(grade)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Series Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Séries (Lycée)</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Leçons</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seriesData?.map((s: Series) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {s.displayOrder}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s.lessonCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSeries(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Matrix: Lycée Grades x Series */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Matrice Niveau-Série (Lycée)</h2>
            <p className="text-sm text-muted-foreground">
              Définissez quelles séries sont disponibles pour chaque niveau du Lycée
            </p>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Niveau</TableHead>
                    {seriesData?.map((s: Series) => (
                      <TableHead key={s.id} className="text-center min-w-[100px]">
                        {s.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lyceeGrades.map((grade: Grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {grade.name}
                      </TableCell>
                      {seriesData?.map((s: Series) => {
                        const enabled = hasMapping(grade.id, s.id)
                        return (
                          <TableCell key={s.id} className="text-center">
                            <Button
                              variant={enabled ? 'default' : 'outline'}
                              size="sm"
                              className={enabled ? 'bg-green-600 hover:bg-green-700' : ''}
                              onClick={() =>
                                toggleMappingMutation.mutate({
                                  gradeId: grade.id,
                                  seriesId: s.id,
                                  enabled: !enabled,
                                })
                              }
                              disabled={toggleMappingMutation.isPending}
                            >
                              {enabled ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary by Category */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Primaire</h3>
              <p className="text-2xl font-bold">{primaireGrades.length}</p>
              <p className="text-sm text-muted-foreground">
                {primaireGrades.filter((g: Grade) => g.isActive).length} actifs
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Collège</h3>
              <p className="text-2xl font-bold">{collegeGrades.length}</p>
              <p className="text-sm text-muted-foreground">
                {collegeGrades.filter((g: Grade) => g.isActive).length} actifs
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Lycée</h3>
              <p className="text-2xl font-bold">{lyceeGrades.length}</p>
              <p className="text-sm text-muted-foreground">
                {lyceeGrades.filter((g: Grade) => g.isActive).length} actifs • {seriesData?.length || 0} séries
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Dialog */}
      <GradeEditDialog
        grade={editingGrade}
        onClose={() => setEditingGrade(null)}
        onSave={(data) => updateGradeMutation.mutate(data)}
        isLoading={updateGradeMutation.isPending}
      />

      {/* Edit Series Dialog */}
      <SeriesEditDialog
        series={editingSeries}
        onClose={() => setEditingSeries(null)}
        onSave={(data) => updateSeriesMutation.mutate(data)}
        isLoading={updateSeriesMutation.isPending}
      />
    </motion.div>
  )
}


// Grade Edit Dialog
function GradeEditDialog({
  grade,
  onClose,
  onSave,
  isLoading,
}: {
  grade: Grade | null
  onClose: () => void
  onSave: (data: { id: number; name?: string; displayOrder?: number }) => void
  isLoading: boolean
}) {
  const [name, setName] = useState(grade?.name || '')
  const [displayOrder, setDisplayOrder] = useState(grade?.displayOrder || 0)

  // Reset form when grade changes
  React.useEffect(() => {
    if (grade) {
      setName(grade.name)
      setDisplayOrder(grade.displayOrder)
    }
  }, [grade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!grade) return
    onSave({
      id: grade.id,
      name: name !== grade.name ? name : undefined,
      displayOrder: displayOrder !== grade.displayOrder ? displayOrder : undefined,
    })
  }

  return (
    <Dialog open={!!grade} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le niveau</DialogTitle>
          <DialogDescription>
            Modifiez les informations du niveau scolaire.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name || grade?.name || ''}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Ordre d'affichage</Label>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              value={displayOrder || grade?.displayOrder || 0}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Series Edit Dialog
function SeriesEditDialog({
  series,
  onClose,
  onSave,
  isLoading,
}: {
  series: Series | null
  onClose: () => void
  onSave: (data: { id: number; name?: string; description?: string; displayOrder?: number }) => void
  isLoading: boolean
}) {
  const [name, setName] = useState(series?.name || '')
  const [description, setDescription] = useState(series?.description || '')
  const [displayOrder, setDisplayOrder] = useState(series?.displayOrder || 0)

  // Reset form when series changes
  React.useEffect(() => {
    if (series) {
      setName(series.name)
      setDescription(series.description || '')
      setDisplayOrder(series.displayOrder)
    }
  }, [series])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!series) return
    onSave({
      id: series.id,
      name: name !== series.name ? name : undefined,
      description: description !== (series.description || '') ? description : undefined,
      displayOrder: displayOrder !== series.displayOrder ? displayOrder : undefined,
    })
  }

  return (
    <Dialog open={!!series} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la série</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la série.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="series-name">Nom</Label>
            <Input
              id="series-name"
              value={name || series?.name || ''}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="series-description">Description</Label>
            <Input
              id="series-description"
              value={description || series?.description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Série Littéraire"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="series-displayOrder">Ordre d'affichage</Label>
            <Input
              id="series-displayOrder"
              type="number"
              min={0}
              value={displayOrder || series?.displayOrder || 0}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
