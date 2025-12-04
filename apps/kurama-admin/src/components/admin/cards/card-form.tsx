import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { createCardSchema, type CreateCardInput, type CardOption } from '@/lib/schemas'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Lesson {
  id: number
  title: string
  subjectId: number
}

interface CardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCardInput) => Promise<void>
  lessons: Lesson[]
  defaultValues?: Partial<CreateCardInput>
  isEditing?: boolean
  isLoading?: boolean
}

const cardTypeLabels: Record<string, string> = {
  basic: 'Basique',
  multichoice: 'Choix multiple',
  true_false: 'Vrai/Faux',
  fill_blank: 'Texte à trous',
}

export function CardForm({
  open,
  onOpenChange,
  onSubmit,
  lessons,
  defaultValues,
  isEditing,
  isLoading,
}: CardFormProps) {
  const [lessonId, setLessonId] = useState<number>(0)
  const [cardType, setCardType] = useState<'basic' | 'multichoice' | 'true_false' | 'fill_blank'>('basic')
  const [frontContent, setFrontContent] = useState('')
  const [backContent, setBackContent] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<CardOption[]>([])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [points, setPoints] = useState(10)
  const [difficulty, setDifficulty] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && defaultValues) {
      setLessonId(defaultValues.lessonId || 0)
      setCardType(defaultValues.cardType || 'basic')
      setFrontContent(defaultValues.frontContent || '')
      setBackContent(defaultValues.backContent || '')
      setQuestion(defaultValues.question || '')
      setOptions(defaultValues.options || [])
      setCorrectAnswer(defaultValues.correctAnswer || '')
      setExplanation(defaultValues.explanation || '')
      setPoints(defaultValues.points || 10)
      setDifficulty(defaultValues.difficulty || 0)
    } else if (!open) {
      resetForm()
    }
  }, [open, defaultValues])

  const resetForm = () => {
    setLessonId(0)
    setCardType('basic')
    setFrontContent('')
    setBackContent('')
    setQuestion('')
    setOptions([])
    setCorrectAnswer('')
    setExplanation('')
    setPoints(10)
    setDifficulty(0)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const data: CreateCardInput = {
      lessonId,
      cardType,
      frontContent,
      backContent,
      question: question || undefined,
      options: options.length > 0 ? options : undefined,
      correctAnswer: correctAnswer || undefined,
      explanation: explanation || undefined,
      points,
      difficulty,
      displayOrder: 0,
    }

    const result = createCardSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
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

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: '', isCorrect: false }])
  }

  const removeOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id))
  }

  const updateOption = (id: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la carte' : 'Nouvelle carte'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la carte ci-dessous.'
              : 'Remplissez les informations pour créer une nouvelle carte.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lessonId">Leçon</Label>
              <Select
                value={lessonId?.toString() || ''}
                onValueChange={(value) => setLessonId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une leçon" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lessonId && <p className="text-sm text-destructive">{errors.lessonId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardType">Type de carte</Label>
              <Select
                value={cardType}
                onValueChange={(value) => setCardType(value as typeof cardType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cardTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frontContent">Contenu recto</Label>
            <Textarea
              id="frontContent"
              placeholder="Question ou terme à apprendre..."
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              rows={3}
            />
            {errors.frontContent && <p className="text-sm text-destructive">{errors.frontContent}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="backContent">Contenu verso</Label>
            <Textarea
              id="backContent"
              placeholder="Réponse ou définition..."
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              rows={3}
            />
            {errors.backContent && <p className="text-sm text-destructive">{errors.backContent}</p>}
          </div>

          {cardType === 'multichoice' && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        updateOption(option.id, 'isCorrect', checked === true)
                      }
                    />
                    <Input
                      placeholder="Texte de l'option..."
                      value={option.text}
                      onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          )}

          {cardType === 'true_false' && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Réponse correcte</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Vrai</SelectItem>
                  <SelectItem value="false">Faux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {cardType === 'fill_blank' && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Réponse attendue</Label>
              <Input
                id="correctAnswer"
                placeholder="Mot ou phrase à compléter..."
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Utilisez ___ dans le contenu recto pour indiquer le blanc à remplir.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="explanation">Explication (optionnel)</Label>
            <Textarea
              id="explanation"
              placeholder="Explication supplémentaire..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté (0-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min={0}
                max={5}
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value) || 0)}
              />
            </div>
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
