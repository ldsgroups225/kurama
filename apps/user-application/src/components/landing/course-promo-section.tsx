import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export function CoursePromoSection() {
  return (
    <section className="w-full py-16 bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video w-full bg-linear-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center border border-border/50">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">Commencez votre apprentissage</h3>
              <p className="text-muted-foreground mb-6">Rejoignez des milliers d'étudiants qui réussissent grâce à Kurama</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Badge className="mb-4" variant="secondary">
            Matières • Progression • Examen Pratique
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Maximisez votre Réussite aux Examens
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Une plateforme d'apprentissage intelligente conçue spécifiquement pour les
            étudiants préparant le BEPC et le BAC en Côte d'Ivoire.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">Fonctionnalités Clés</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Contenu aligné avec le programme officiel
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Répétition espacée pour mémorisation optimale
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Étude hors-ligne avec PWA</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Suivi des progrès et analytiques</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">
                Technologies Modernes
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    TanStack Start avec React 19
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Base de données PostgreSQL synchronisée
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Authentification sécurisée et privée
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Déploiement Cloudflare optimisé</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
  );
}
