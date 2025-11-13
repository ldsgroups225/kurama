import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Route,
  Database,
  Zap,
  Shield,
  Palette,
  Code
} from "lucide-react"

const features = [
  {
    icon: Route,
    title: "Répétition Espacée",
    description: "Algorithme scientifique SM-2 optimisé pour maximiser la rétention et vous montrer les cartes au moment parfait.",
    badge: "Apprentissage"
  },
  {
    icon: Database,
    title: "Contenu Officiel",
    description: "Matériaux d'étude alignés avec le programme du Ministère de l'Éducation pour BEPC et BAC en Côte d'Ivoire.",
    badge: "Programme"
  },
  {
    icon: Code,
    title: "Modes d'Étude",
    description: "Flashcards, quiz, questions-réponses chronométrées et simulateur d'examen pour un apprentissage varié.",
    badge: "Pratique"
  },
  {
    icon: Zap,
    title: "Hors-Ligne PWA",
    description: "Étudiez n'importe où, même sans connexion Internet. Vos progrès se synchronisent automatiquement.",
    badge: "Mobile"
  },
  {
    icon: Shield,
    title: "Analytique Intelligent",
    description: "Suivez vos progrès avec des statistiques détaillées et des informations sur votre apprentissage.",
    badge: "Progression"
  },
  {
    icon: Palette,
    title: "Apprentissage Social",
    description: "Créez des groupes d'étude, partagez des ressources et competez avec vos camarades.",
    badge: "Communauté"
  }
]

const templateFeatures = [
  {
    image: "/cloudflare.png",
    title: "Technology Edge",
    description: "Application web progressive (PWA) construite avec TanStack Start, React 19 et optimisée pour Cloudflare.",
    badge: "Performance",
    highlight: true
  },
  {
    image: "/better-auth.png",
    title: "Sécurité & Vie Privée",
    description: "Authentification sécurisée et protection des données des étudiants conforme aux normes de confidentialité.",
    badge: "Confiance",
    highlight: true
  },
  {
    image: "/polar.png",
    title: "Accessible à Tous",
    description: "Application gratuite pour les étudiants avec des fonctionnalités premium optionnelles pour un apprentissage avancé.",
    badge: "Gratuit",
    highlight: true
  },
  {
    image: "/pnpm.webp",
    title: "Architecture Moderne",
    description: "Base de code robuste avec TypeScript, tests automatisés et déploiement continu pour une qualité optimale.",
    badge: "Qualité",
    highlight: true
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Kurama Platform Features Section */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Plateforme d'Excellence
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Construite avec les meilleures technologies pour offrir une expérience d'apprentissage exceptionnelle
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
          {templateFeatures.map((feature) => {
            return (
              <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background p-2">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <Badge variant="default" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Learning Features Section */}
        <div className="mx-auto max-w-2xl text-center mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Fonctionnalités d'Apprentissage
          </h3>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils pédagogiques avancés conçus pour maximiser votre réussite aux examens
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
