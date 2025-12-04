import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createSubjectSchema, type CreateSubjectInput } from '@/lib/schemas'
import { Loader2 } from 'lucide-react'

interface SubjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSubjectInput) => Promise<void>
  defaultValues?: Partial<CreateSubjectInput>
  isEditing?: boolean
  isLoading?: boolean
}

export function SubjectForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing,
  isLoading,
}: SubjectFormProps) {
  const [name, setName] = useState('')
  const [abbreviation, setAbbreviation] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && defaultValues) {
      setName(defaultValues.name || '')
      setAbbreviation(defaultValues.abbreviation || '')
      setDescription(defaultValues.description || '')
      setDisplayOrder(defaultValues.displayOrder || 0)
    } else if (!open) {
      setName('')
      setAbbreviation('')
      setDescription('')
      setDisplayOrder(0)
      setErrors({})
    }
  }, [open, defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const data = {
      name,
      abbreviation,
      description: description || undefined,
      displayOrder,
    }

    const result = createSubjectSchema.safeParse(data)
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la matière' : 'Nouvelle matière'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la matière ci-dessous.'
              : 'Remplissez les informations pour créer une nouvelle matière.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Mathématiques"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abréviation</Label>
            <Input
              id="abbreviation"
              placeholder="MATH"
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value)}
            />
            {errors.abbreviation && <p className="text-sm text-destructive">{errors.abbreviation}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Description de la matière..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Ordre d'affichage</Label>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
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
