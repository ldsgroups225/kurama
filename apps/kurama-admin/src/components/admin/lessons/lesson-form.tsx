import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'

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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>()
  const [isPublished, setIsPublished] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && defaultValues) {
      setSubjectId(defaultValues.subjectId || 0)
      setTitle(defaultValues.title || '')
      setDescription(defaultValues.description || '')
      setDifficulty(defaultValues.difficulty || '')
      setEstimatedDuration(defaultValues.estimatedDuration)
      setIsPublished(defaultValues.isPublished || false)
      setDisplayOrder(defaultValues.displayOrder || 0)
    } else if (!open) {
      setSubjectId(0)
      setTitle('')
      setDescription('')
      setDifficulty('')
      setEstimatedDuration(undefined)
      setIsPublished(false)
      setDisplayOrder(0)
      setErrors({})
    }
  }, [open, defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const data = {
      subjectId,
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

    await onSubmit(result.data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Introduction aux équations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Description de la leçon..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3">
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
