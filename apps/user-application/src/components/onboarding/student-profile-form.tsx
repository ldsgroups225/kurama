import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { getEducationalData, submitProfile } from "@/core/functions/profile";
import { ProgressIndicator } from "./progress-indicator";
import type { StudentProfile } from "@kurama/data-ops/zod-schema/profile";

interface StudentProfileFormProps {
  onBack: () => void;
  onSuccess: (profileData?: Partial<StudentProfile>) => void;
}

type FormStep = "personal" | "contact" | "educational" | "preferences";



const STEPS = [
  { id: "personal" as FormStep, label: "Identité" },
  { id: "contact" as FormStep, label: "Contact" },
  { id: "educational" as FormStep, label: "Niveau" },
  { id: "preferences" as FormStep, label: "Préférences" },
];

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Anglais",
  "Sciences Physiques",
  "SVT",
  "Histoire-Géo",
  "Philosophie",
  "Informatique",
];

const INITIAL_FORM_DATA: Partial<StudentProfile> = {
  userType: "student",
  firstName: "",
  lastName: "",
  phone: "",
  age: 14,
  gender: undefined,
  city: "",
  idNumber: "",
  gradeName: "",
  seriesName: "",
  favoriteSubjects: [],
  learningGoals: "",
  studyTime: "",
};

export function StudentProfileForm({ onBack, onSuccess }: StudentProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("personal");
  const [formData, setFormData] = useState<Partial<StudentProfile>>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const { data: educationalData, isLoading: isLoadingData } = useQuery({
    queryKey: ["educational-data"],
    queryFn: getEducationalData,
  });

  const submitMutation = useMutation({
    mutationFn: submitProfile,
    onSuccess: () => {
      // Pass the form data to parent for caching in localStorage
      onSuccess(formData);
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const selectedGrade = educationalData?.grades.find((g) => g.name === formData.gradeName);
  const requiresSeries = selectedGrade?.category === "LYCEE";

  const updateFormData = (updates: Partial<StudentProfile>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validators = {
    personal: () => {
      const newErrors: Record<string, string> = {};
      if (!formData.firstName?.trim()) newErrors.firstName = "Le prénom est requis";
      if (!formData.lastName?.trim()) newErrors.lastName = "Le nom est requis";
      if (!formData.age) newErrors.age = "L'âge est requis";
      if (!formData.gender) newErrors.gender = "Le genre est requis";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    contact: () => {
      const newErrors: Record<string, string> = {};
      if (!formData.phone?.trim()) newErrors.phone = "Le téléphone est requis";
      if (!formData.city?.trim()) newErrors.city = "La ville est requise";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    educational: () => {
      const newErrors: Record<string, string> = {};
      if (!formData.idNumber) newErrors.idNumber = "Le numéro matricule est requis";
      if (formData.idNumber?.length !== 9) newErrors.idNumber = "Le numéro matricule est incorrect";
      if (!formData.gradeName) newErrors.gradeName = "Le niveau est requis";
      if (requiresSeries && !formData.seriesName) {
        newErrors.seriesName = "La série est requise pour le lycée";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    preferences: () => {
      const newErrors: Record<string, string> = {};
      if (!formData.studyTime) newErrors.studyTime = "Le temps d'étude quotidien est requis";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
  };

  const handleNext = () => {
    const stepValidators: Record<FormStep, () => boolean> = {
      personal: validators.personal,
      contact: validators.contact,
      educational: validators.educational,
      preferences: validators.preferences,
    };

    const nextSteps: Record<FormStep, FormStep | null> = {
      personal: "contact",
      contact: "educational",
      educational: "preferences",
      preferences: null,
    };

    if (stepValidators[currentStep]()) {
      const next = nextSteps[currentStep];
      if (next) setCurrentStep(next);
    }
  };

  const handlePrevious = () => {
    const prevSteps: Record<FormStep, FormStep | null> = {
      personal: null,
      contact: "personal",
      educational: "contact",
      preferences: "educational",
    };

    const prev = prevSteps[currentStep];
    if (prev) {
      setCurrentStep(prev);
      setErrors({});
    } else {
      onBack();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validators.preferences()) return;

    submitMutation.mutate({
      data: {
        userType: "student",
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        gradeName: formData.gradeName!,
        seriesName: requiresSeries ? formData.seriesName : undefined,
        ...formData,
      },
    });
  };

  const toggleSubject = (subject: string) => {
    const current = formData.favoriteSubjects || [];
    const updated = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    updateFormData({ favoriteSubjects: updated });
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stepDescriptions = {
    personal: "Commençons par vos informations personnelles",
    contact: "Comment pouvons-nous vous contacter ?",
    educational: "Parlez-nous de votre niveau scolaire",
    preferences: "Personnalisez votre expérience d'apprentissage",
  };

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 mb-4 shadow-lg">
            <span className="text-xl font-bold text-white">K</span>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={submitMutation.isPending}
                aria-label="Retour"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <CardTitle className="text-zinc-900 dark:text-zinc-50">
                Profil Étudiant
              </CardTitle>
            </div>
            <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
              {stepDescriptions[currentStep]}
            </p>
          </CardHeader>

          <CardContent>
            <ProgressIndicator steps={STEPS} currentStep={currentStepIndex} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === "personal" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) => updateFormData({ firstName: e.target.value })}
                      disabled={submitMutation.isPending}
                      autoFocus
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={(e) => updateFormData({ lastName: e.target.value })}
                      disabled={submitMutation.isPending}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Âge: {formData.age} ans</Label>
                    <Slider
                      id="age"
                      value={[formData.age || 14]}
                      onValueChange={([value]) => updateFormData({ age: value })}
                      min={10}
                      max={25}
                      step={1}
                      disabled={submitMutation.isPending}
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive">{errors.age}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Vous êtes</Label>
                    <ToggleGroup
                      type="single"
                      value={formData.gender}
                      onValueChange={(value) => {
                        if (value === "male" || value === "female") {
                          updateFormData({ gender: value });
                        }
                      }}
                      disabled={submitMutation.isPending}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="male">Garçon</ToggleGroupItem>
                      <ToggleGroupItem value="female">Fille</ToggleGroupItem>
                    </ToggleGroup>
                    {errors.gender && (
                      <p className="text-sm text-destructive">{errors.gender}</p>
                    )}
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full mt-6" size="lg">
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === "contact" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      disabled={submitMutation.isPending}
                      autoFocus
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Abidjan"
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      disabled={submitMutation.isPending}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full mt-6" size="lg">
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === "educational" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">Numéro matricule</Label>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="Votre matricule scolaire"
                      value={formData.idNumber}
                      onChange={(e) => updateFormData({ idNumber: e.target.value })}
                      disabled={submitMutation.isPending}
                      autoFocus
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-destructive">{errors.idNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Niveau</Label>
                    <Select
                      value={formData.gradeName}
                      onValueChange={(value) => updateFormData({ gradeName: value, seriesName: "" })}
                      disabled={submitMutation.isPending}
                    >
                      <SelectTrigger id="grade" className="w-full">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationalData?.grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.name}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeName && (
                      <p className="text-sm text-destructive">{errors.gradeName}</p>
                    )}
                  </div>

                  {requiresSeries && (
                    <div className="space-y-2">
                      <Label htmlFor="series">Série</Label>
                      <Select
                        value={formData.seriesName}
                        onValueChange={(value) => updateFormData({ seriesName: value })}
                        disabled={submitMutation.isPending}
                      >
                        <SelectTrigger id="series" className="w-full">
                          <SelectValue placeholder="Sélectionnez votre série" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationalData?.levelSeries.filter(grd => grd.gradeId === selectedGrade.id).map((ls) => (
                            <SelectItem key={ls.seriesId} value={ls.series.name}>
                              {ls.series.name} - {ls.series.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.seriesName && (
                        <p className="text-sm text-destructive">{errors.seriesName}</p>
                      )}
                    </div>
                  )}

                  <Button type="button" onClick={handleNext} className="w-full mt-6" size="lg">
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === "preferences" && (
                <>
                  <div className="space-y-2">
                    <Label>Matières préférées (optionnel)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBJECTS.map((subject) => (
                        <Button
                          key={subject}
                          type="button"
                          variant={
                            formData.favoriteSubjects?.includes(subject) ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => toggleSubject(subject)}
                          disabled={submitMutation.isPending}
                          className="justify-start"
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studyTime">Temps d'étude quotidien</Label>
                    <Select
                      value={formData.studyTime}
                      onValueChange={(value) => updateFormData({ studyTime: value })}
                      disabled={submitMutation.isPending}
                    >
                      <SelectTrigger id="studyTime" className="w-full">
                        <SelectValue placeholder="Combien de temps étudiez-vous par jour ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-1h">Moins d'1 heure</SelectItem>
                        <SelectItem value="1-2h">1 à 2 heures</SelectItem>
                        <SelectItem value="2-3h">2 à 3 heures</SelectItem>
                        <SelectItem value="3-4h">3 à 4 heures</SelectItem>
                        <SelectItem value="more-4h">Plus de 4 heures</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.studyTime && (
                      <p className="text-sm text-destructive">{errors.studyTime}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningGoals">Objectifs d'apprentissage (optionnel)</Label>
                    <Textarea
                      id="learningGoals"
                      placeholder="Décrivez vos objectifs académiques..."
                      value={formData.learningGoals}
                      onChange={(e) => updateFormData({ learningGoals: e.target.value })}
                      disabled={submitMutation.isPending}
                      rows={3}
                    />
                  </div>

                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Terminer"
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
