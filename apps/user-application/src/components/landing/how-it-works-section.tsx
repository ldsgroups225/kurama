import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, BookOpen, Brain, Trophy } from "@/lib/icons";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Créez votre Compte",
    description: "Inscription gratuite en quelques secondes avec Google ou email. Commencez immédiatement.",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Choisissez vos Matières",
    description: "Sélectionnez les matières que vous préparez pour le BEPC ou le BAC. Personnalisez votre parcours.",
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    icon: Brain,
    step: "03",
    title: "Étudiez Intelligemment",
    description: "Notre algorithme de répétition espacée vous montre les cartes au moment optimal pour maximiser la rétention.",
    color: "bg-green-500/10 text-green-500"
  },
  {
    icon: Trophy,
    step: "04",
    title: "Réussissez vos Examens",
    description: "Suivez vos progrès, pratiquez avec des examens blancs et atteignez vos objectifs académiques.",
    color: "bg-amber-500/10 text-amber-500"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Simple & Efficace
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comment Ça Marche ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quatre étapes simples pour transformer votre apprentissage
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card
                  key={step.step}
                  className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 text-sm font-semibold text-muted-foreground">
                          Étape {step.step}
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-4 -right-4 text-8xl font-bold text-muted/10">
                      →
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
