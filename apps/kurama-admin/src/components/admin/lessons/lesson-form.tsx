import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createLessonSchema, type CreateLessonInput } from '@/lib/schemas'
import { getGradesSimple, getSeriesSimple } from '@/core/functions/users'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Subject {
  id: number
  name: string
  abbreviation: string
}

interface LessonFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateLessonInput) => Promise<void>
  subjects: Subject[]
  defaultValues?: Partial<CreateLessonInput>
  isEditing?: boolean
  isLoading?: boolean
}

const STORAGE_KEY = 'kurama-admin-lesson-form'

interface StoredFormData {
  subjectId: number
  gradeId?: number
  seriesId?: number
  difficulty: string
  estimatedDuration?: number
  isPublished: boolean
}

function loadStoredFormData(): StoredFormData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveFormData(data: StoredFormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

export function LessonForm({
  open,
  onOpenChange,
  onSubmit,
  subjects,
  defaultValues,
  isEditing,
  isLoading,
}: LessonFormProps) {
  const [subjectId, setSubjectId] = useState<number>(0)
  const [gradeId, setGradeId] = useState<number | undefined>()
  const [seriesId, setSeriesId] = useState<number | undefined>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>()
  const [isPublished, setIsPublished] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch grades and series
  const { data: gradesData } = useQuery({
    queryKey: ['grades-simple'],
    queryFn: () => getGradesSimple(),
    enabled: open,
  })

  const { data: seriesData } = useQuery({
    queryKey: ['series-simple'],
    queryFn: () => getSeriesSimple(),
    enabled: open,
  })

  // Check if selected grade is Lycée (needs series)
  const selectedGrade = gradesData?.find((g) => g.id === gradeId)
  const isLycee = selectedGrade?.category === 'LYCEE'

  useEffect(() => {
    if (open && defaultValues) {
      // Editing mode: use provided values
      setSubjectId(defaultValues.subjectId || 0)
      setGradeId(defaultValues.gradeId)
      setSeriesId(defaultValues.seriesId)
      setTitle(defaultValues.title || '')
      setDescription(defaultValues.description || '')
      setDifficulty(defaultValues.difficulty || '')
      setEstimatedDuration(defaultValues.estimatedDuration)
      setIsPublished(defaultValues.isPublished || false)
      setDisplayOrder(defaultValues.displayOrder || 0)
    } else if (open && !isEditing) {
      // Creating mode: restore from localStorage (except title/description)
      const stored = loadStoredFormData()
      if (stored) {
        setSubjectId(stored.subjectId || 0)
        setGradeId(stored.gradeId)
        setSeriesId(stored.seriesId)
        setDifficulty(stored.difficulty || '')
        setEstimatedDuration(stored.estimatedDuration)
        setIsPublished(stored.isPublished || false)
      }
      setTitle('')
      setDescription('')
    } else if (!open) {
      setSubjectId(0)
      setGradeId(undefined)
      setSeriesId(undefined)
      setTitle('')
      setDescription('')
      setDifficulty('')
      setEstimatedDuration(undefined)
      setIsPublished(false)
      setDisplayOrder(0)
      setErrors({})
    }
  }, [open, defaultValues, isEditing])

  // Clear series when grade changes to non-Lycée
  useEffect(() => {
    if (!isLycee && seriesId) {
      setSeriesId(undefined)
    }
  }, [isLycee, seriesId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const data = {
      subjectId,
      gradeId: gradeId || undefined,
      seriesId: isLycee ? seriesId : undefined,
      title,
      description: description || undefined,
      difficulty: difficulty as 'easy' | 'medium' | 'hard' | undefined || undefined,
      estimatedDuration,
      isPublished,
      displayOrder,
    }

    const result = createLessonSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      const issues = result.error.issues || []
      for (const issue of issues) {
        const path = issue.path[0]
        if (path !== undefined) {
          fieldErrors[String(path)] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    // Save form data to localStorage (excluding title/description/displayOrder)
    saveFormData({
      subjectId,
      gradeId,
      seriesId: isLycee ? seriesId : undefined,
      difficulty,
      estimatedDuration,
      isPublished,
    })

    await onSubmit(result.data)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto border-border/50 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la leçon' : 'Nouvelle leçon'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la leçon ci-dessous.'
              : 'Remplissez les informations pour créer une nouvelle leçon.'}
          </DialogDescription>
        </DialogHeader>
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="subjectId">Matière</Label>
            <Select
              value={subjectId?.toString() || ''}
              onValueChange={(value) => setSubjectId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name} ({subject.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId}</p>}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradeId">Niveau (optionnel)</Label>
              <Select
                value={gradeId?.toString() || 'none'}
                onValueChange={(value) => setGradeId(value === 'none' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {gradesData?.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLycee && (
              <div className="space-y-2">
                <Label htmlFor="seriesId">Série</Label>
                <Select
                  value={seriesId?.toString() || 'none'}
                  onValueChange={(value) => setSeriesId(value === 'none' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une série" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {seriesData?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Introduction aux équations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </motion.div>

          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Description de la leçon..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Durée (min)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min={1}
                placeholder="15"
                value={estimatedDuration || ''}
                onChange={(e) => setEstimatedDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-2">
            <Label htmlFor="displayOrder">Ordre d'affichage</Label>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              placeholder="0"
              value={displayOrder || ''}
              onChange={(e) => setDisplayOrder(e.target.value ? parseInt(e.target.value) : 0)}
            />
            <p className="text-sm text-muted-foreground">
              Position de la leçon dans la liste (0 = premier)
            </p>
          </motion.div>

          <motion.div variants={item} className="flex flex-row items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="space-y-0.5">
              <Label>Publier</Label>
              <p className="text-sm text-muted-foreground">
                Rendre la leçon visible aux étudiants
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </motion.div>

          <motion.div variants={item} className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
