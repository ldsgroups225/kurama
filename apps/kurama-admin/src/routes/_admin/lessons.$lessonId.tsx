import type { LessonTeachPlanMetadata } from '@kurama/data-ops/drizzle/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AttachmentsSheet } from '@/components/admin/lessons/attachments-sheet'
import { MarkdownRenderer, PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  generateCardsFromPlan,
  generateTeachPlan,
  saveGeneratedCards,
  updateTeachPlan,
} from '@/core/functions/ai-generation'
import { getCards } from '@/core/functions/cards'
import { getLesson } from '@/core/functions/lessons'
import { getGradesSimple } from '@/core/functions/users'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_admin/lessons/$lessonId')({
  component: LessonDetailPage,
})

// Fallback grades if API fails
const defaultGrades = [
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Seconde',
  'Première',
  'Terminale',
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function LessonDetailPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const lessonIdNum = Number.parseInt(lessonId)

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [editedTeachPlan, setEditedTeachPlan] = useState('')
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [cardGenerateDialogOpen, setCardGenerateDialogOpen] = useState(false)
  const [generationParams, setGenerationParams] = useState({
    country: 'Côte d\'Ivoire',
    grade: '', // Will be set when dialog opens
    language: 'French' as 'French' | 'English',
    schoolYear: '2025-2026',
    customInstructions: '',
  })
  const [cardAmount, setCardAmount] = useState(15)
  const [generatedCards, setGeneratedCards] = useState<Array<{
    lessonId: number
    cardType: string
    frontContent: string
    backContent: string
    question?: string
    options?: Array<{ id: string, text: string, isCorrect: boolean }>
    correctAnswer?: string
    explanation?: string
    displayOrder: number
    points: number
    difficulty: number
  }>>([])
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  // Queries
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonIdNum],
    queryFn: () => getLesson({ data: lessonIdNum }),
  })

  const { data: cardsData } = useQuery({
    queryKey: ['cards', { lessonId: lessonIdNum }],
    queryFn: () => getCards({ data: { lessonId: lessonIdNum, page: 1, limit: 100 } }),
  })

  const { data: gradesData } = useQuery({
    queryKey: ['grades-simple'],
    queryFn: () => getGradesSimple(),
  })

  // Get grades list from API or use defaults
  const grades = gradesData?.map((g: { name: string }) => g.name) || defaultGrades

  // Mutations
  const generatePlanMutation = useMutation({
    mutationFn: () =>
      generateTeachPlan({
        data: {
          lessonId: lessonIdNum,
          ...generationParams,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonIdNum] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setGenerateDialogOpen(false)
      toast.success('Plan de leçon généré avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la génération')
    },
  })

  const generateCardsMutation = useMutation({
    mutationFn: () =>
      generateCardsFromPlan({
        data: {
          lessonId: lessonIdNum,
          cardType: 'flashcard', // Always generate complete cards
          amount: cardAmount,
        },
      }),
    onSuccess: (result) => {
      const data = result as { success: boolean, cards: typeof generatedCards }
      setGeneratedCards(data.cards)
      setCardGenerateDialogOpen(false)
      setPreviewDialogOpen(true)
      toast.success(`${data.cards.length} cartes générées`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la génération des cartes')
    },
  })

  const saveCardsMutation = useMutation({
    mutationFn: () =>
      saveGeneratedCards({
        data: {
          lessonId: lessonIdNum,
          cards: generatedCards.map(card => ({
            lessonId: card.lessonId,
            cardType: card.cardType as 'basic' | 'multichoice' | 'true_false' | 'fill_blank',
            frontContent: card.frontContent,
            backContent: card.backContent,
            question: card.question,
            options: card.options,
            correctAnswer: card.correctAnswer,
            explanation: card.explanation,
            displayOrder: card.displayOrder,
            points: card.points ?? 10,
            difficulty: card.difficulty ?? 0,
          })),
        },
      }),
    onSuccess: (result) => {
      const data = result as { success: boolean, savedCount: number }
      queryClient.invalidateQueries({ queryKey: ['cards', { lessonId: lessonIdNum }] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setPreviewDialogOpen(false)
      setGeneratedCards([])
      toast.success(`${data.savedCount} cartes enregistrées`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'enregistrement')
    },
  })

  const updatePlanMutation = useMutation({
    mutationFn: () =>
      updateTeachPlan({
        data: {
          lessonId: lessonIdNum,
          teachPlan: editedTeachPlan,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonIdNum] })
      setIsEditing(false)
      toast.success('Plan de leçon mis à jour')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    },
  })

  const handleStartEdit = () => {
    setEditedTeachPlan(lesson?.teachPlan || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedTeachPlan('')
  }

  const difficultyLabels: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Leçon non trouvée</p>
        <Button asChild className="mt-4">
          <Link to="/lessons">Retour aux leçons</Link>
        </Button>
      </div>
    )
  }

  const metadata = lesson.teachPlanMetadata as LessonTeachPlanMetadata | null

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title={lesson.title}
        description={lesson.description || 'Aucune description'}
        actions={(
          <div className="flex gap-2">
            <AttachmentsSheet
              lessonId={lessonIdNum}
              subjectId={lesson.subjectId}
              subjectName={lesson.subjectName ?? undefined}
              gradeId={lesson.gradeId ?? undefined}
              seriesId={lesson.seriesId ?? undefined}
            />
            <Button variant="outline" asChild>
              <Link to="/lessons">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
        )}
      />

      {/* Lesson metadata */}
      <motion.div variants={item} className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-wrap gap-4 items-center">
        <Badge variant="outline" className="gap-2 px-3 py-1.5 text-base border-primary/20 bg-primary/5">
          <BookOpen className="h-4 w-4 text-primary" />
          {lesson.subjectName}
        </Badge>
        {lesson.difficulty && (
          <Badge variant="secondary" className="px-3 py-1.5 text-base">
            {difficultyLabels[lesson.difficulty] || lesson.difficulty}
          </Badge>
        )}
        {lesson.estimatedDuration && (
          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-base border-primary/20 bg-primary/5">
            <Clock className="h-4 w-4 text-primary" />
            {lesson.estimatedDuration}
            {' '}
            min
          </Badge>
        )}
        <Badge
          variant={lesson.isPublished ? 'default' : 'secondary'}
          className="px-3 py-1.5 text-base"
        >
          {lesson.isPublished ? 'Publié' : 'Brouillon'}
        </Badge>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 text-base border-primary/20 bg-primary/5">
          <FileText className="h-4 w-4 text-primary" />
          {cardsData?.total || 0}
          {' '}
          cartes
        </Badge>
      </motion.div>

      {/* Teach Plan Section */}
      <motion.div variants={item}>
        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/50">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                Plan d'enseignement
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {lesson.teachPlanGeneratedAt
                  ? `Généré le ${new Date(lesson.teachPlanGeneratedAt).toLocaleDateString('fr-FR')}`
                  : 'Aucun plan généré'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {lesson.teachPlan && !isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCardGenerateDialogOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Générer des cartes
                  </Button>
                </>
              )}
              <Button
                size="sm"
                onClick={() => {
                  // Auto-fill from previous metadata if available
                  const prevMetadata = lesson.teachPlanMetadata as LessonTeachPlanMetadata | null
                  if (prevMetadata) {
                    setGenerationParams({
                      country: prevMetadata.country || 'Côte d\'Ivoire',
                      grade: prevMetadata.grade || grades[0] || '3ème',
                      language: (prevMetadata.language as 'French' | 'English') || 'French',
                      schoolYear: '2025-2026',
                      customInstructions: '',
                    })
                  }
                  else {
                    // Set default grade to first available
                    setGenerationParams(prev => ({
                      ...prev,
                      grade: grades[0] || '3ème',
                    }))
                  }
                  setGenerateDialogOpen(true)
                }}
                disabled={generatePlanMutation.isPending}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {lesson.teachPlan ? 'Régénérer' : 'Générer avec IA'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing
              ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedTeachPlan}
                      onChange={e => setEditedTeachPlan(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Contenu Markdown du plan de leçon..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                      </Button>
                      <Button
                        onClick={() => updatePlanMutation.mutate()}
                        disabled={updatePlanMutation.isPending}
                      >
                        {updatePlanMutation.isPending
                          ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )
                          : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                )
              : lesson.teachPlan
                ? (
                    <div className="space-y-6">
                      <MarkdownRenderer content={lesson.teachPlan} />

                      {/* Sources */}
                      {metadata?.sources && metadata.sources.length > 0 && (
                        <div className="border-t pt-6">
                          <h4 className="text-sm font-semibold mb-3">Sources</h4>
                          <ul className="space-y-2">
                            {metadata.sources.map(source => (
                              <li key={generateUUID()} className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <a
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {source.title || source.uri}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                : (
                    <div className="text-center py-12">
                      <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">Aucun plan d'enseignement</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Cliquez sur "Générer avec IA" pour créer un plan de leçon basé sur le curriculum ivoirien.
                      </p>
                    </div>
                  )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Generate Plan Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Générer un plan de leçon</DialogTitle>
            <DialogDescription>
              Configurez les paramètres pour générer un plan de leçon avec l'IA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input
                value={generationParams.country}
                onChange={e =>
                  setGenerationParams({ ...generationParams, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau scolaire</Label>
              <Select
                value={generationParams.grade}
                onValueChange={value =>
                  setGenerationParams({ ...generationParams, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select
                value={generationParams.language}
                onValueChange={(value: 'French' | 'English') =>
                  setGenerationParams({ ...generationParams, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="English">Anglais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Année scolaire</Label>
              <Input
                value={generationParams.schoolYear}
                onChange={e =>
                  setGenerationParams({ ...generationParams, schoolYear: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions personnalisées (optionnel)</Label>
              <Textarea
                value={generationParams.customInstructions}
                onChange={e =>
                  setGenerationParams({
                    ...generationParams,
                    customInstructions: e.target.value,
                  })}
                placeholder="Ex: Inclure des exemples pratiques..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => generatePlanMutation.mutate()}
              disabled={generatePlanMutation.isPending}
            >
              {generatePlanMutation.isPending
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  )
                : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer
                    </>
                  )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Cards Dialog */}
      <Dialog open={cardGenerateDialogOpen} onOpenChange={setCardGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Générer des cartes</DialogTitle>
            <DialogDescription>
              Créez des cartes d'étude complètes (flashcards + quiz) à partir du plan de leçon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Nombre de cartes</Label>
                <span className="text-sm font-medium tabular-nums">{cardAmount}</span>
              </div>
              <Slider
                value={[cardAmount]}
                onValueChange={([value]) => value !== undefined && setCardAmount(value)}
                min={5}
                max={30}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Chaque carte inclura le contenu recto/verso et des options de quiz.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardGenerateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => generateCardsMutation.mutate()}
              disabled={generateCardsMutation.isPending}
            >
              {generateCardsMutation.isPending
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  )
                : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer
                    </>
                  )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Generated Cards Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu des cartes générées</DialogTitle>
            <DialogDescription>
              {generatedCards.length}
              {' '}
              cartes ont été générées. Vérifiez-les avant de les enregistrer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {generatedCards.map((card, index) => (
              <Card key={generateUUID()}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    Carte
                    {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-4">
                  {/* Flashcard section */}
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs font-semibold text-primary">📚 Flashcard</span>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Recto:</span>
                      <MarkdownRenderer content={card.frontContent} className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Verso:</span>
                      <MarkdownRenderer content={card.backContent} className="text-sm" />
                    </div>
                  </div>

                  {/* Quiz section */}
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs font-semibold text-primary">❓ Quiz</span>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Question:</span>
                      <MarkdownRenderer content={card.question || ''} className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Options:</span>
                      <ul className="mt-1 space-y-1">
                        {card.options?.map(opt => (
                          <li
                            key={opt.id}
                            className={`text-sm ${opt.isCorrect ? 'text-green-600 font-medium' : ''}`}
                          >
                            {opt.id}
                            .
                            {opt.text}
                            {' '}
                            {opt.isCorrect && '✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {card.explanation && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Explication:
                        </span>
                        <p className="text-sm text-muted-foreground">{card.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => saveCardsMutation.mutate()}
              disabled={saveCardsMutation.isPending}
            >
              {saveCardsMutation.isPending
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  )
                : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                      {' '}
                      {generatedCards.length}
                      {' '}
                      cartes
                    </>
                  )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
