import type { ParentProfile } from '@kurama/data-ops/zod-schema/profile'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitProfile } from '@/core/functions/profile'
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from '@/lib/icons'
import { generateUUID } from '@/utils/generateUUID'

import { ProgressIndicator } from './progress-indicator'

interface Steps {
  id: string
  label: string
}

interface ParentProfileFormProps {
  onBack: () => void
  onSuccess: (profileData?: Partial<ParentProfile>) => void
}

type FormStep = 'personal' | 'children'

export function ParentProfileForm({
  onBack,
  onSuccess,
}: ParentProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [formData, setFormData] = useState<Partial<ParentProfile>>({
    userType: 'parent',
    firstName: '',
    lastName: '',
    childrenMatricules: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps: Steps[] = [
    { id: 'personal', label: 'Informations' },
    { id: 'children', label: 'Enfants' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

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

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 'personal' && validatePersonalInfo()) {
      setCurrentStep('children')
    }
  }

  const handlePrevious = () => {
    if (currentStep === 'children') {
      setCurrentStep('personal')
      setErrors({})
    }
    else {
      onBack()
    }
  }

  const handleAddChild = () => {
    setFormData({
      ...formData,
      childrenMatricules: [...(formData.childrenMatricules || []), ''],
    })
  }

  const handleRemoveChild = (index: number) => {
    const newMatricules = [...(formData.childrenMatricules || [])]
    newMatricules.splice(index, 1)
    setFormData({
      ...formData,
      childrenMatricules: newMatricules,
    })
  }

  const handleChildMatriculeChange = (index: number, value: string) => {
    const newMatricules = [...(formData.childrenMatricules || [])]
    // Store the string value directly
    newMatricules[index] = value
    setFormData({
      ...formData,
      childrenMatricules: newMatricules,
    })
  }

  const handleSubmit = async () => {
    setErrors({})
    setIsSubmitting(true)

    try {
      // Filter out empty matricules
      const filteredMatricules = (formData.childrenMatricules || [])
        .filter((m): m is string => m.trim().length > 0)

      submitMutation.mutate({
        data: {
          userType: 'parent',
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          childrenMatricules: filteredMatricules.length > 0 ? filteredMatricules : undefined,
        },
      })
      onSuccess()
    }
    catch (error) {
      setErrors({ submit: (error as Error).message })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setErrors({})
    setIsSubmitting(true)

    try {
      await submitProfile({
        data: {
          userType: 'parent',
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          childrenMatricules: [],
        },
      })
      onSuccess()
    }
    catch (error) {
      setErrors({ submit: (error as Error).message })
    }
    finally {
      setIsSubmitting(false)
    }
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
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-indigo-500/20">
            <img
              src="/pwa-192x192.png"
              alt="Kurama Logo"
              className="h-12 w-12 rounded-xl"
            />
          </div>
        </div>

        <Card className="border-border bg-card backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-2">
            <div className="mb-2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl font-bold text-foreground">
                Profil Parent
              </CardTitle>
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              {currentStep === 'personal'
                ? 'Commençons par vos informations personnelles'
                : 'Liez vos enfants par matricule (optionnel)'}
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <ProgressIndicator steps={steps} currentStep={currentStepIndex} />

            <div className="space-y-4">
              {/* Step 1: Personal Information */}
              {currentStep === 'personal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-muted-foreground">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={e =>
                        setFormData({ ...formData, firstName: e.target.value })}
                      disabled={isSubmitting}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm font-medium">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-muted-foreground">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={e =>
                        setFormData({ ...formData, lastName: e.target.value })}
                      disabled={isSubmitting}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm font-medium">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 mt-4"
                    size="lg"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Step 2: Children Information */}
              {currentStep === 'children' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">Matricules des enfants</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddChild}
                        disabled={isSubmitting}
                        className="border-input bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>

                    {(!formData.childrenMatricules || formData.childrenMatricules.length === 0) && (
                      <div className="mx-auto flex max-w-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-2 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Aucun enfant ajouté
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                          Cliquez sur "Ajouter" pour lier un enfant
                        </p>
                      </div>
                    )}

                    {formData.childrenMatricules?.map((matricule, index) => (
                      <div key={generateUUID()} className="space-y-2 animate-in slide-in-from-right-5 fade-in duration-300">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`child-${index}`} className="text-xs text-muted-foreground">
                              Enfant
                              {' '}
                              {index + 1}
                            </Label>
                            <Input
                              id={`child-${index}`}
                              type="text"
                              placeholder="Entrer le matricule"
                              value={matricule}
                              onChange={e =>
                                handleChildMatriculeChange(index, e.target.value)}
                              disabled={isSubmitting}
                              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChild(index)}
                            disabled={isSubmitting}
                            className="mt-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground pt-2 text-center">
                      Cette information nous aide à personnaliser votre expérience
                    </p>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm font-medium">
                      {errors.submit}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-input bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleSkip}
                    >
                      Passer
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting
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
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ParentProfileForm
