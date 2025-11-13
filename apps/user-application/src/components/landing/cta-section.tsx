import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-secondary/10" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Gratuit pour tous les étudiants
          </span>
        </div>

        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Prêt à Réussir vos
          <span className="block text-primary mt-2">Examens ?</span>
        </h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Rejoignez des milliers d'étudiants qui utilisent Kurama pour préparer leur BEPC et BAC.
          Commencez gratuitement dès aujourd'hui.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app">
            <Button size="lg" className="group text-lg px-8 py-6">
              Commencer Gratuitement
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
            <a href="#features">
              En Savoir Plus
            </a>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Aucune carte bancaire requise • Accès immédiat • Fonctionne hors-ligne
        </p>
      </div>
    </section>
  );
}
