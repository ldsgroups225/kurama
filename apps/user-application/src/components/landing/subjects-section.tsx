import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Atom,
  Globe,
  BookText,
  Languages,
  Landmark,
  FlaskConical,
  Brain
} from "@/lib/icons";

const subjects = [
  {
    icon: Calculator,
    name: "Mathématiques",
    description: "Algèbre, géométrie, statistiques",
    cards: "5,200+",
    color: "text-blue-500"
  },
  {
    icon: Atom,
    name: "Physique-Chimie",
    description: "Mécanique, électricité, réactions",
    cards: "4,800+",
    color: "text-purple-500"
  },
  {
    icon: FlaskConical,
    name: "SVT",
    description: "Biologie, géologie, écologie",
    cards: "4,500+",
    color: "text-green-500"
  },
  {
    icon: Languages,
    name: "Français",
    description: "Grammaire, littérature, expression",
    cards: "3,900+",
    color: "text-red-500"
  },
  {
    icon: Globe,
    name: "Anglais",
    description: "Vocabulaire, grammaire, compréhension",
    cards: "3,600+",
    color: "text-indigo-500"
  },
  {
    icon: Landmark,
    name: "Histoire-Géo",
    description: "Événements, cartes, civilisations",
    cards: "4,200+",
    color: "text-amber-500"
  },
  {
    icon: BookText,
    name: "Philosophie",
    description: "Concepts, auteurs, dissertations",
    cards: "2,800+",
    color: "text-pink-500"
  },
  {
    icon: Brain,
    name: "Autres Matières",
    description: "Économie, arts, langues vivantes",
    cards: "3,100+",
    color: "text-cyan-500"
  }
];

export function SubjectsSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Programme Complet
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Toutes les Matières du BEPC & BAC
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Contenu aligné avec le programme officiel du Ministère de l'Éducation de Côte d'Ivoire
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            return (
              <Card
                key={subject.name}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${subject.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {subject.cards}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {subject.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SubjectsSection;
