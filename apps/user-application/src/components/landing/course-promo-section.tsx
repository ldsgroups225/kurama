import { CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function CoursePromoSection() {
  return (
    <section className="w-full bg-linear-to-b from-background to-muted/20 py-16">
      <div className={`
        container mx-auto px-4
        md:px-6
      `}
      >
        <div className="mx-auto max-w-4xl">
          <div className={`
            flex aspect-video w-full items-center justify-center rounded-lg
            border border-border/50 bg-linear-to-r from-primary/10
            to-secondary/10
          `}
          >
            <div className="p-8 text-center">
              <h3 className="mb-4 text-2xl font-bold">Commencez votre apprentissage</h3>
              <p className="mb-6 text-muted-foreground">Rejoignez des milliers d'étudiants qui réussissent grâce à Kurama</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <Badge className="mb-4" variant="secondary">
            Matières • Progression • Examen Pratique
          </Badge>

          <h2 className={`
            mb-4 text-3xl font-bold
            md:text-4xl
          `}
          >
            Maximisez votre Réussite aux Examens
          </h2>

          <p className="mb-8 text-lg text-muted-foreground">
            Une plateforme d'apprentissage intelligente conçue spécifiquement pour les
            étudiants préparant le BEPC et le BAC en Côte d'Ivoire.
          </p>

          <div className={`
            mb-8 grid gap-6 text-left
            md:grid-cols-2
          `}
          >
            <div className="space-y-3">
              <h3 className="mb-2 text-lg font-semibold">Fonctionnalités Clés</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Contenu aligné avec le programme officiel
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Répétition espacée pour mémorisation optimale
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">Étude hors-ligne avec PWA</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">Suivi des progrès et analytiques</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="mb-2 text-lg font-semibold">
                Technologies Modernes
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">
                    TanStack Start avec React 19
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Base de données PostgreSQL synchronisée
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Authentification sécurisée et privée
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-sm">Déploiement Cloudflare optimisé</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`
            flex flex-col items-center justify-center gap-4
            sm:flex-row
          `}
          >
            <Button size="lg" asChild>
              <a
                href="#features"
                className="text-white"
              >
                Découvrir les Fonctionnalités
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
