import type { StudentProfile } from '@kurama/data-ops/zod-schema/profile'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getEducationalData, submitProfile } from '@/core/functions/profile'
import { ArrowLeft, ArrowRight, Loader2 } from '@/lib/icons'
import { ProgressIndicator } from './progress-indicator'

interface StudentProfileFormProps {
  onBack: () => void
  onSuccess: (profileData?: Partial<StudentProfile>) => void
}

type FormStep = 'personal' | 'contact' | 'educational' | 'preferences'

const STEPS = [
  { id: 'personal' as FormStep, label: 'Identité' },
  { id: 'contact' as FormStep, label: 'Contact' },
  { id: 'educational' as FormStep, label: 'Niveau' },
  { id: 'preferences' as FormStep, label: 'Préférences' },
]

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

const INITIAL_FORM_DATA: Partial<StudentProfile> = {
  userType: 'student',
  firstName: '',
  lastName: '',
  phone: '',
  age: 14,
  gender: undefined as any, // Will be converted to '' for ToggleGroup
  city: '',
  idNumber: '',
  gradeName: '',
  seriesName: '',
  favoriteSubjects: [],
  learningGoals: '',
  studyTime: '',
}

export function StudentProfileForm({ onBack, onSuccess }: StudentProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [formData, setFormData] = useState<Partial<StudentProfile>>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  const { data: educationalData, isLoading: isLoadingData } = useQuery({
    queryKey: ['educational-data'],
    queryFn: getEducationalData,
  })

  const submitMutation = useMutation({
    mutationFn: submitProfile,
    onSuccess: () => {
      // Pass the form data to parent for caching in localStorage
      onSuccess(formData)
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message })
    },
  })

  const selectedGrade = educationalData?.grades.find(g => g.name === formData.gradeName)
  const requiresSeries = selectedGrade?.category === 'LYCEE'

  const updateFormData = (updates: Partial<StudentProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validators = {
    personal: () => {
      const newErrors: Record<string, string> = {}
      if (!formData.firstName?.trim())
        newErrors.firstName = 'Le prénom est requis'
      if (!formData.lastName?.trim())
        newErrors.lastName = 'Le nom est requis'
      if (!formData.age)
        newErrors.age = 'L\'âge est requis'
      if (!formData.gender)
        newErrors.gender = 'Le genre est requis'
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    contact: () => {
      const newErrors: Record<string, string> = {}
      if (!formData.phone?.trim())
        newErrors.phone = 'Le téléphone est requis'
      if (!formData.city?.trim())
        newErrors.city = 'La ville est requise'
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    educational: () => {
      const newErrors: Record<string, string> = {}
      if (!formData.idNumber)
        newErrors.idNumber = 'Le numéro matricule est requis'
      if (formData.idNumber?.length !== 9)
        newErrors.idNumber = 'Le numéro matricule est incorrect'
      if (!formData.gradeName)
        newErrors.gradeName = 'Le niveau est requis'
      if (requiresSeries && !formData.seriesName) {
        newErrors.seriesName = 'La série est requise pour le lycée'
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    preferences: () => {
      const newErrors: Record<string, string> = {}
      if (!formData.studyTime)
        newErrors.studyTime = 'Le temps d\'étude quotidien est requis'
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
  }

  const handleNext = () => {
    const stepValidators: Record<FormStep, () => boolean> = {
      personal: validators.personal,
      contact: validators.contact,
      educational: validators.educational,
      preferences: validators.preferences,
    }

    const nextSteps: Record<FormStep, FormStep | null> = {
      personal: 'contact',
      contact: 'educational',
      educational: 'preferences',
      preferences: null,
    }

    if (stepValidators[currentStep]()) {
      const next = nextSteps[currentStep]
      if (next)
        setCurrentStep(next)
    }
  }

  const handlePrevious = () => {
    const prevSteps: Record<FormStep, FormStep | null> = {
      personal: null,
      contact: 'personal',
      educational: 'contact',
      preferences: 'educational',
    }

    const prev = prevSteps[currentStep]
    if (prev) {
      setCurrentStep(prev)
      setErrors({})
    }
    else {
      onBack()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validators.preferences())
      return

    submitMutation.mutate({
      data: {
        userType: 'student',
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        gradeName: formData.gradeName!,
        seriesName: requiresSeries ? formData.seriesName : undefined,
        ...formData,
      },
    })
  }

  const toggleSubject = (subject: string) => {
    const current = formData.favoriteSubjects || []
    const updated = current.includes(subject)
      ? current.filter(s => s !== subject)
      : [...current, subject]
    updateFormData({ favoriteSubjects: updated })
  }

  if (isLoadingData) {
    return (
      <div className={`
        flex min-h-screen items-center justify-center bg-linear-to-br
        from-background via-muted to-background
      `}
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const stepDescriptions = {
    personal: 'Commençons par vos informations personnelles',
    contact: 'Comment pouvons-nous vous contacter ?',
    educational: 'Parlez-nous de votre niveau scolaire',
    preferences: 'Personnalisez votre expérience d\'apprentissage',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20">
            <span className="text-3xl font-black text-white tracking-tighter">K</span>
          </div>
        </div>

        <Card className="border-border bg-card backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-2">
            <div className="mb-2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={submitMutation.isPending}
                aria-label="Retour"
                className="hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl font-bold text-foreground">
                Profil Étudiant
              </CardTitle>
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              {stepDescriptions[currentStep]}
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <ProgressIndicator steps={STEPS} currentStep={currentStepIndex} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 'personal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-muted-foreground">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={e => updateFormData({ firstName: e.target.value })}
                      disabled={submitMutation.isPending}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-400 font-medium">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-muted-foreground">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={e => updateFormData({ lastName: e.target.value })}
                      disabled={submitMutation.isPending}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-400 font-medium">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="age" className="text-muted-foreground">Âge</Label>
                      <span className="text-lg font-bold text-foreground">
                        {formData.age}
                        {' '}
                        ans
                      </span>
                    </div>
                    <Slider
                      id="age"
                      value={[formData.age || 14]}
                      onValueChange={([value]) => updateFormData({ age: value })}
                      min={10}
                      max={25}
                      step={1}
                      disabled={submitMutation.isPending}
                      className="py-4"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-400 font-medium">{errors.age}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label htmlFor="gender" className="text-muted-foreground">Vous êtes</Label>
                    <ToggleGroup
                      type="single"
                      value={formData.gender || ''}
                      onValueChange={(value) => {
                        if (value === 'male' || value === 'female') {
                          updateFormData({ gender: value })
                        }
                        else if (value === '') {
                          updateFormData({ gender: undefined })
                        }
                      }}
                      disabled={submitMutation.isPending}
                      className="justify-stretch gap-4"
                    >
                      <ToggleGroupItem
                        value="male"
                        className="flex-1 border-input bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=on]:bg-indigo-600 data-[state=on]:text-white transition-all duration-300"
                      >
                        Garçon
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="female"
                        className="flex-1 border-input bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=on]:bg-purple-600 data-[state=on]:text-white transition-all duration-300"
                      >
                        Fille
                      </ToggleGroupItem>
                    </ToggleGroup>
                    {errors.gender && (
                      <p className="text-sm text-red-400 font-medium">{errors.gender}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                    size="lg"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === 'contact' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      value={formData.phone}
                      onChange={e => updateFormData({ phone: e.target.value })}
                      disabled={submitMutation.isPending}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-400 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-muted-foreground">Ville</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Abidjan"
                      value={formData.city}
                      onChange={e => updateFormData({ city: e.target.value })}
                      disabled={submitMutation.isPending}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-400 font-medium">{errors.city}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                    size="lg"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === 'educational' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-muted-foreground">Numéro matricule</Label>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="Votre matricule scolaire"
                      value={formData.idNumber}
                      onChange={e => updateFormData({ idNumber: e.target.value })}
                      disabled={submitMutation.isPending}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-red-400 font-medium">{errors.idNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-muted-foreground">Niveau</Label>
                    <Select
                      value={formData.gradeName}
                      onValueChange={value => updateFormData({ gradeName: value, seriesName: '' })}
                      disabled={submitMutation.isPending}
                    >
                      <SelectTrigger id="grade" className="w-full bg-background/50 border-input text-foreground hover:bg-accent focus:ring-indigo-500/20">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {educationalData?.grades.map(grade => (
                          <SelectItem key={grade.id} value={grade.name} className="focus:bg-indigo-600 focus:text-white">
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeName && (
                      <p className="text-sm text-red-400 font-medium">{errors.gradeName}</p>
                    )}
                  </div>

                  {requiresSeries && (
                    <div className="space-y-2">
                      <Label htmlFor="series" className="text-muted-foreground">Série</Label>
                      <Select
                        value={formData.seriesName}
                        onValueChange={value => updateFormData({ seriesName: value })}
                        disabled={submitMutation.isPending}
                      >
                        <SelectTrigger id="series" className="w-full bg-background/50 border-input text-foreground hover:bg-accent focus:ring-indigo-500/20">
                          <SelectValue placeholder="Sélectionnez votre série" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          {educationalData?.levelSeries.filter(grd => grd.gradeId === selectedGrade.id).map(ls => (
                            <SelectItem key={ls.seriesId} value={ls.series.name} className="focus:bg-indigo-600 focus:text-white">
                              {ls.series.name}
                              {' '}
                              -
                              {ls.series.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.seriesName && (
                        <p className="text-sm text-red-400 font-medium">{errors.seriesName}</p>
                      )}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                    size="lg"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === 'preferences' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Matières préférées (optionnel)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBJECTS.map(subject => (
                        <Button
                          key={subject}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubject(subject)}
                          disabled={submitMutation.isPending}
                          className={`
                            justify-start border transition-all duration-200
                            ${formData.favoriteSubjects?.includes(subject)
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                              : 'border-input bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                            }
                          `}
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studyTime" className="text-muted-foreground">Temps d'étude quotidien</Label>
                    <Select
                      value={formData.studyTime}
                      onValueChange={value => updateFormData({ studyTime: value })}
                      disabled={submitMutation.isPending}
                    >
                      <SelectTrigger id="studyTime" className="w-full bg-background/50 border-input text-foreground hover:bg-accent focus:ring-indigo-500/20">
                        <SelectValue placeholder="Combien de temps étudiez-vous par jour ?" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="less-1h" className="focus:bg-indigo-600 focus:text-white">Moins d'1 heure</SelectItem>
                        <SelectItem value="1-2h" className="focus:bg-indigo-600 focus:text-white">1 à 2 heures</SelectItem>
                        <SelectItem value="2-3h" className="focus:bg-indigo-600 focus:text-white">2 à 3 heures</SelectItem>
                        <SelectItem value="3-4h" className="focus:bg-indigo-600 focus:text-white">3 à 4 heures</SelectItem>
                        <SelectItem value="more-4h" className="focus:bg-indigo-600 focus:text-white">Plus de 4 heures</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.studyTime && (
                      <p className="text-sm text-red-400 font-medium">{errors.studyTime}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningGoals" className="text-muted-foreground">Objectifs d'apprentissage (optionnel)</Label>
                    <Textarea
                      id="learningGoals"
                      placeholder="Décrivez vos objectifs académiques..."
                      value={formData.learningGoals}
                      onChange={e => updateFormData({ learningGoals: e.target.value })}
                      disabled={submitMutation.isPending}
                      rows={3}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>

                  {errors.submit && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium">
                      {errors.submit}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="mt-6 w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                    size="lg"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending
                      ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      )
                      : (
                        'Terminer'
                      )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentProfileForm
