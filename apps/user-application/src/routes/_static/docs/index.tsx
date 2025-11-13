import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  DatabaseIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Bot,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/_static/docs/")({
  component: RouteComponent,
});

const gettingStartedSteps = [
  {
    name: "database",
    title: "Configuration de la Base",
    description:
      "Configurez votre base de données pour le contenu éducatif avec synchronisation hors-ligne et optimisation edge.",
    icon: DatabaseIcon,
    image: "/cloudflare.png",
    badgeVariant: "default" as const,
    features: [
      "Synchronisation Hors-Ligne",
      "Contenu Éducatif",
      "Progression Sauvegardée",
      "Multi-Dispositifs",
    ],
  },
  {
    name: "authentication",
    title: "Comptes Étudiants",
    description:
      "Configurez l'authentification sécurisée pour les étudiants et enseignants avec options sociales et gestion des profils.",
    icon: ShieldCheckIcon,
    image: "/better-auth.png",
    badgeVariant: "secondary" as const,
    features: [
      "Profils Étudiants",
      "Connexion Sécure",
      "Classes & Groupes",
      "Confidentialité",
    ],
  },
  {
    name: "polar",
    title: "Fonctionnalités Premium",
    description:
      "Accédez à des fonctionnalités avancées avec des options premium pour l'apprentissage et le suivi personnalisé.",
    icon: CreditCardIcon,
    image: "/polar.png",
    badgeVariant: "outline" as const,
    features: [
      "Contenu Exclusif",
      "Analytique Avancée",
      "Support Prioritaire",
      "Personnalisation",
    ],
  },
];

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <BookOpenIcon className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Guide complet pour votre plateforme d'apprentissage Kurama, construite avec TanStack
          Start, couvrant l'authentification, la base de données et les fonctionnalités d'étude.
        </p>
        <Badge variant="secondary" className="text-sm">
          Plateforme d'Éducation
        </Badge>
      </div>

      {/* Tech Stack Banner */}
      <div className="mb-12">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Built with Modern Technologies
                </h3>
                <p className="text-muted-foreground">
                  TanStack Start, React 19, TypeScript, Tailwind CSS v4, and
                  Shadcn/UI
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <img
                  src="/tanstack.png"
                  alt="TanStack"
                  className="h-8 w-8 rounded"
                />
                <img
                  src="/shadcn.png"
                  alt="Shadcn/UI"
                  className="h-8 w-8 rounded"
                />
                <img
                  src="/logo192.png"
                  alt="React"
                  className="h-8 w-8 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claude Code Setup Section */}
      <div className="mb-12">
        <Card className="bg-gradient-to-b from-background to-muted/20 border">
          <CardContent className="p-8">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Setup
              </Badge>
              <h3 className="text-2xl font-semibold mb-4">
                Quick Setup with Claude Code
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Skip the manual setup and let Claude Code agents configure your
                entire project automatically.
              </p>
              <div className="mb-6">
                <img
                  src="/claude-code-cli.webp"
                  alt="Claude Code CLI"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="bg-muted/30 rounded-lg p-6 border max-w-lg mx-auto">
                <p className="text-muted-foreground mb-4">
                  Just say this to Claude Code:
                </p>
                <div className="bg-background rounded-lg p-4 font-mono text-sm border">
                  <span className="text-primary">
                    Help me setup this project
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Guide de Démarrage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez ces étapes pour configurer votre plateforme éducative. Chaque
            étape s'appuie sur la précédente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {gettingStartedSteps.map((step) => {
            const IconComponent = step.icon;

            return (
              <Card
                key={step.name}
                className="group hover:shadow-lg transition-all duration-200 h-full"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <div className="flex justify-center mb-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-16 w-16 object-contain rounded-lg bg-background border p-2"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4 leading-relaxed">
                    {step.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {step.features.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    to="/docs/$name"
                    params={{ name: step.name }}
                    className="block"
                  >
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Commencer {step.title}
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Access Section */}
      <Card className="border-dashed bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            Quick Access
          </CardTitle>
          <CardDescription>
            Jump directly to any documentation section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gettingStartedSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <Link
                  key={step.name}
                  to="/docs/$name"
                  params={{ name: step.name }}
                >
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Resources Section */}
      <div className="mt-16 mb-8 bg-gradient-to-b from-background to-muted/20 -mx-4 px-4 py-8">
        <div className="text-center">
          <Badge className="mb-4" variant="secondary">
            Ressources Éducatives
          </Badge>

          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ressources d'Apprentissage
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explorez nos guides et tutoriels pour tirer le meilleur parti de Kurama
            et optimiser votre préparation aux examens.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Guides d'Étude</h3>
                <p className="text-sm text-muted-foreground">
                  Techniques efficaces de répétition espacée et méthodes d'apprentissage
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Contenu Officiel</h3>
                <p className="text-sm text-muted-foreground">
                  Matériaux d'étude alignés avec le programme BEPC/BAC de Côte d'Ivoire
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytique</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez vos progrès et identifiez les domaines à améliorer
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
