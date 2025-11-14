import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, ArrowRight, Plus, X } from "@/lib/icons";
import type { ParentProfile } from "@kurama/data-ops/zod-schema/profile";
import { useMutation } from "@tanstack/react-query";
import { submitProfile } from "@/core/functions/profile";

interface Steps {
  id: string;
  label: string;
}

interface ParentProfileFormProps {
  onBack: () => void;
  onSuccess: (profileData?: Partial<ParentProfile>) => void;
}

type FormStep = "personal" | "children";

// Mock progress indicator component
function ProgressIndicator({ steps, currentStep }: { steps: Steps[], currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep
              ? 'bg-gradient-xp text-white'
              : 'bg-muted text-muted-foreground'
              }`}>
              {index + 1}
            </div>
            <span className={`text-xs mt-1 ${index <= currentStep ? 'text-xp' : 'text-muted-foreground'
              }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 flex-1 ${index < currentStep ? 'bg-gradient-xp-horizontal' : 'bg-muted'
              }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function ParentProfileForm({
  onBack,
  onSuccess,
}: ParentProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("personal");
  const [formData, setFormData] = useState<Partial<ParentProfile>>({
    userType: "parent",
    firstName: "",
    lastName: "",
    childrenMatricules: [] as number[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Steps[] = [
    { id: "personal", label: "Informations" },
    { id: "children", label: "Enfants" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

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

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === "personal" && validatePersonalInfo()) {
      setCurrentStep("children");
    }
  };

  const handlePrevious = () => {
    if (currentStep === "children") {
      setCurrentStep("personal");
      setErrors({});
    } else {
      onBack();
    }
  };

  const handleAddChild = () => {
    setFormData({
      ...formData,
      childrenMatricules: [...(formData.childrenMatricules || []), 0],
    });
  };

  const handleRemoveChild = (index: number) => {
    const newMatricules = [...(formData.childrenMatricules || [])];
    newMatricules.splice(index, 1);
    setFormData({
      ...formData,
      childrenMatricules: newMatricules,
    });
  };

  const handleChildMatriculeChange = (index: number, value: string) => {
    const newMatricules = [...(formData.childrenMatricules || [])];
    // Convert string to number, or 0 if empty/invalid
    const numValue = value.trim() === "" ? 0 : Number(value);
    newMatricules[index] = isNaN(numValue) ? 0 : numValue;
    setFormData({
      ...formData,
      childrenMatricules: newMatricules,
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    setIsSubmitting(true);

    try {
      // Filter out zero/invalid matricules
      const filteredMatricules = (formData.childrenMatricules || [])
        .filter((m): m is number => m > 0);

      submitMutation.mutate({
        data: {
          userType: "parent",
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          childrenMatricules: filteredMatricules.length > 0 ? filteredMatricules : undefined,
        },
      });
      onSuccess();
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setErrors({});
    setIsSubmitting(true);

    try {
      await submitProfile({
        data: {
          userType: "parent",
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          childrenMatricules: [],
        },
      });
      onSuccess();
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-streak p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-xp mb-4 shadow-lg">
            <span className="text-xl font-bold text-white">K</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-foreground">
                Profil Parent
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStep === "personal"
                ? "Commençons par vos informations personnelles"
                : "Liez vos enfants par matricule (optionnel)"}
            </p>
          </CardHeader>

          <CardContent>
            <ProgressIndicator steps={steps} currentStep={currentStepIndex} />

            <div className="space-y-4">
              {/* Step 1: Personal Information */}
              {currentStep === "personal" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {errors.firstName && (
                      <p className="text-sm text-error">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-error">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full"
                    size="lg"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Step 2: Children Information */}
              {currentStep === "children" && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Matricules des enfants</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddChild}
                        disabled={isSubmitting}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>

                    {(!formData.childrenMatricules || formData.childrenMatricules.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun enfant ajouté. Cliquez sur "Ajouter" pour lier un enfant.
                      </p>
                    )}

                    {formData.childrenMatricules?.map((matricule, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`child-${index}`}>
                              Enfant {index + 1}
                            </Label>
                            <Input
                              id={`child-${index}`}
                              type="number"
                              placeholder="Entrer le matricule"
                              value={matricule === 0 ? "" : matricule}
                              onChange={(e) =>
                                handleChildMatriculeChange(index, e.target.value)
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChild(index)}
                            disabled={isSubmitting}
                            className="mt-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground">
                      Cette information nous aide à personnaliser votre expérience
                    </p>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-error text-error text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleSkip}
                    >
                      Passer
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Terminer"
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
  );
}

export default ParentProfileForm;
