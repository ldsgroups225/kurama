import type { UserProfileWithRelations } from '@kurama/data-ops/drizzle/schema'
import type { ParentProfile, StudentProfile } from '@kurama/data-ops/zod-schema/profile'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useToast } from '@/components/ui/use-toast'
import { submitProfile } from '@/core/functions/profile'
import { ArrowLeft, Loader2, Plus, X } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface ProfileEditFormProps {
  profile: UserProfileWithRelations | undefined
  onBack: () => void
  onSuccess: () => void
}

const SUBJECTS = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Sciences Physiques',
  'SVT',
  'Histoire-Géo',
  'Philosophie',
  'Informatique',
]

function CardWrapper({ children, title, subtitle, className }: { children: React.ReactNode, title?: string, subtitle?: string, className?: string }) {
  return (
    <Card className={cn('border-white/5 bg-zinc-900/40 backdrop-blur-xl', className)}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle className="text-white">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function InputLabel({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
  return <Label htmlFor={htmlFor} className="text-zinc-400 font-medium mb-1.5 block">{children}</Label>
}

export function ProfileEditForm({ profile, onBack, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<StudentProfile | ParentProfile>>({
    userType: (profile?.userType === 'parent' ? 'parent' : 'student') as 'student' | 'parent',
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    ...(profile?.userType === 'student' && {
      phone: profile?.phone || '',
      age: profile?.age || 14,
      gender: profile?.gender || undefined,
      city: profile?.city || '',
      idNumber: profile?.idNumber || '',
      gradeName: profile?.grade?.name || '',
      seriesName: profile?.series?.name || '',
      favoriteSubjects: profile?.favoriteSubjects || [],
      learningGoals: profile?.learningGoals || '',
      studyTime: profile?.studyTime || '',
    }),
    ...(profile?.userType === 'parent' && {
      childrenMatricules: profile?.childrenMatricules || [],
    }),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submitMutation = useMutation({
    mutationFn: submitProfile,
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Vos informations ont été mises à jour avec succès.',
      })
      onSuccess()
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
      setErrors({ submit: error.message })
    },
  })

  const isStudent = profile?.userType === 'student'

  const updateFormData = (updates: Partial<StudentProfile | ParentProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (isStudent) {
      const studentData = formData as StudentProfile
      if (!studentData.phone?.trim()) {
        newErrors.phone = 'Le téléphone est requis'
      }
      if (!studentData.city?.trim()) {
        newErrors.city = 'La ville est requise'
      }
      if (!studentData.studyTime) {
        newErrors.studyTime = 'Le temps d\'étude quotidien est requis'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    if (isStudent) {
      const studentData = formData as StudentProfile
      submitMutation.mutate({
        data: {
          userType: 'student',
          firstName: studentData.firstName!,
          lastName: studentData.lastName!,
          phone: studentData.phone,
          age: profile?.age ?? studentData.age, // Read-only: use original value
          gender: studentData.gender,
          city: studentData.city,
          idNumber: profile?.idNumber ?? studentData.idNumber, // Read-only: use original value
          gradeName: profile?.grade?.name ?? studentData.gradeName!, // Read-only: use original value
          seriesName: profile?.series?.name, // Read-only: use original value
          favoriteSubjects: studentData.favoriteSubjects,
          learningGoals: studentData.learningGoals,
          studyTime: studentData.studyTime,
        },
      })
    }
    else {
      const parentData = formData as ParentProfile
      const filteredMatricules = (parentData.childrenMatricules || [])
        .filter((m): m is string => m.trim().length > 0)

      submitMutation.mutate({
        data: {
          userType: 'parent',
          firstName: parentData.firstName!,
          lastName: parentData.lastName!,
          childrenMatricules: filteredMatricules.length > 0 ? filteredMatricules : undefined,
        },
      })
    }
  }

  const toggleSubject = (subject: string) => {
    const current = (formData as StudentProfile).favoriteSubjects || []
    const updated = current.includes(subject)
      ? current.filter(s => s !== subject)
      : [...current, subject]
    updateFormData({ favoriteSubjects: updated })
  }

  const handleAddChild = () => {
    const current = (formData as ParentProfile).childrenMatricules || []
    updateFormData({ childrenMatricules: [...current, ''] })
  }

  const handleRemoveChild = (index: number) => {
    const current = (formData as ParentProfile).childrenMatricules || []
    const updated = current.filter((_, i) => i !== index)
    updateFormData({ childrenMatricules: updated })
  }

  const handleChildMatriculeChange = (index: number, value: string) => {
    const current = (formData as ParentProfile).childrenMatricules || []
    const updated = [...current]
    updated[index] = value
    updateFormData({ childrenMatricules: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={submitMutation.isPending}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Informations Personnelles
          </h2>
          <p className="text-sm text-zinc-400">
            {isStudent ? 'Profil Étudiant' : 'Profil Parent'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Fields */}
        <CardWrapper title="Informations de Base">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <InputLabel htmlFor="firstName">Prénom</InputLabel>
              <Input
                id="firstName"
                type="text"
                placeholder="Votre prénom"
                value={formData.firstName}
                onChange={e => updateFormData({ firstName: e.target.value })}
                disabled={submitMutation.isPending}
                className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <InputLabel htmlFor="lastName">Nom</InputLabel>
              <Input
                id="lastName"
                type="text"
                placeholder="Votre nom"
                value={formData.lastName}
                onChange={e => updateFormData({ lastName: e.target.value })}
                disabled={submitMutation.isPending}
                className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
            <p className="text-sm text-indigo-300">
              <span className="font-medium text-indigo-400">Type de profil:</span>
              {' '}
              {isStudent ? 'Étudiant' : 'Parent'}
            </p>
          </div>
        </CardWrapper>

        {/* Student-Specific Fields */}
        {isStudent && (
          <>
            <CardWrapper title="Informations de Contact">
              <div className="space-y-2">
                <InputLabel htmlFor="phone">Téléphone</InputLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+225 XX XX XX XX XX"
                  value={(formData as StudentProfile).phone}
                  onChange={e => updateFormData({ phone: e.target.value })}
                  disabled={submitMutation.isPending}
                  className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <InputLabel htmlFor="city">Ville</InputLabel>
                <Input
                  id="city"
                  type="text"
                  placeholder="Abidjan"
                  value={(formData as StudentProfile).city}
                  onChange={e => updateFormData({ city: e.target.value })}
                  disabled={submitMutation.isPending}
                  className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <InputLabel>Âge</InputLabel>
                <div className="rounded-md border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
                  {(formData as StudentProfile).age || 14}
                  {' '}
                  ans
                  <span className="ml-2 text-xs text-zinc-600">(non modifiable)</span>
                </div>
              </div>

              <div className="space-y-2">
                <InputLabel htmlFor="gender">Genre</InputLabel>
                <ToggleGroup
                  type="single"
                  value={(formData as StudentProfile).gender || ''}
                  onValueChange={(value) => {
                    if (value === 'male' || value === 'female') {
                      updateFormData({ gender: value })
                    }
                    else if (value === '') {
                      updateFormData({ gender: undefined })
                    }
                  }}
                  disabled={submitMutation.isPending}
                  className="justify-start"
                >
                  <ToggleGroupItem value="male" className="data-[state=on]:bg-indigo-600 data-[state=on]:text-white text-zinc-400 hover:text-white hover:bg-white/5">Garçon</ToggleGroupItem>
                  <ToggleGroupItem value="female" className="data-[state=on]:bg-pink-600 data-[state=on]:text-white text-zinc-400 hover:text-white hover:bg-white/5">Fille</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardWrapper>

            <CardWrapper
              title="Informations Scolaires"
              subtitle="Ces informations ne peuvent pas être modifiées. Contactez le support si nécessaire."
            >
              <div className="space-y-2">
                <InputLabel>Numéro Matricule</InputLabel>
                <div className="rounded-md border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
                  {(formData as StudentProfile).idNumber || 'Non renseigné'}
                </div>
              </div>

              <div className="space-y-2">
                <InputLabel>Niveau</InputLabel>
                <div className="rounded-md border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
                  {(formData as StudentProfile).gradeName || 'Non renseigné'}
                </div>
              </div>

              {(formData as StudentProfile).seriesName && (
                <div className="space-y-2">
                  <InputLabel>Série</InputLabel>
                  <div className="rounded-md border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400">
                    {(formData as StudentProfile).seriesName}
                  </div>
                </div>
              )}
            </CardWrapper>

            <CardWrapper title="Préférences d'Apprentissage">
              <div className="space-y-2">
                <InputLabel>Matières Préférées (optionnel)</InputLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map(subject => (
                    <Button
                      key={subject}
                      type="button"
                      variant={
                        (formData as StudentProfile).favoriteSubjects?.includes(subject)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => toggleSubject(subject)}
                      disabled={submitMutation.isPending}
                      className={cn(
                        'justify-start transition-all',
                        (formData as StudentProfile).favoriteSubjects?.includes(subject)
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                          : 'border-white/10 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5',
                      )}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <InputLabel htmlFor="studyTime">Temps d'Étude Quotidien</InputLabel>
                <Select
                  value={(formData as StudentProfile).studyTime}
                  onValueChange={value => updateFormData({ studyTime: value })}
                  disabled={submitMutation.isPending}
                >
                  <SelectTrigger id="studyTime" className="w-full bg-zinc-800/50 border-white/10 text-white">
                    <SelectValue placeholder="Combien de temps étudiez-vous par jour ?" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="less-1h">Moins d'1 heure</SelectItem>
                    <SelectItem value="1-2h">1 à 2 heures</SelectItem>
                    <SelectItem value="2-3h">2 à 3 heures</SelectItem>
                    <SelectItem value="3-4h">3 à 4 heures</SelectItem>
                    <SelectItem value="more-4h">Plus de 4 heures</SelectItem>
                  </SelectContent>
                </Select>
                {errors.studyTime && (
                  <p className="text-sm text-red-500">{errors.studyTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <InputLabel htmlFor="learningGoals">Objectifs d'Apprentissage (optionnel)</InputLabel>
                <Textarea
                  id="learningGoals"
                  placeholder="Décrivez vos objectifs académiques..."
                  value={(formData as StudentProfile).learningGoals}
                  onChange={e => updateFormData({ learningGoals: e.target.value })}
                  disabled={submitMutation.isPending}
                  rows={3}
                  className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                />
              </div>
            </CardWrapper>
          </>
        )}

        {/* Parent-Specific Fields */}
        {!isStudent && (
          <Card className="border-white/10 bg-zinc-900/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Enfants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChild}
                  disabled={submitMutation.isPending}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!(formData as ParentProfile).childrenMatricules
                || (formData as ParentProfile).childrenMatricules!.length === 0) && (
                <p className="py-4 text-center text-sm text-zinc-500">
                  Aucun enfant ajouté. Cliquez sur "Ajouter" pour lier un enfant.
                </p>
              )}

              {(formData as ParentProfile).childrenMatricules?.map((matricule, index) => (
                <div key={generateUUID()} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <InputLabel htmlFor={`child-${index}`}>
                        Enfant
                        {' '}
                        {index + 1}
                      </InputLabel>
                      <Input
                        id={`child-${index}`}
                        type="text"
                        placeholder="Entrer le matricule"
                        value={matricule}
                        onChange={e =>
                          handleChildMatriculeChange(index, e.target.value)}
                        disabled={submitMutation.isPending}
                        className="bg-zinc-800/50 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveChild(index)}
                      disabled={submitMutation.isPending}
                      className="mt-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <p className="text-xs text-zinc-500">
                Cette information nous aide à personnaliser votre expérience
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitMutation.isPending}
            className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="flex-1 bg-white text-black hover:bg-zinc-200"
          >
            {submitMutation.isPending
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                )
              : (
                  'Enregistrer les Modifications'
                )}
          </Button>
        </div>
      </form>
    </div>
  )
}
