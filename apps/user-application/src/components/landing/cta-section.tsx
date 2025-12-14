import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart } from '@/lib/icons'

export function CTASection() {
  return (
    <section className={`
      relative overflow-hidden py-24
      sm:py-32
    `}
    >
      {/* Background gradient */}
      <div className={`
        absolute inset-0 bg-linear-to-br from-primary/10 via-background
        to-secondary/10
      `}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20
          blur-3xl
        `}
        />
        <div className={`
          absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/20
          blur-3xl
        `}
        />
      </div>

      <div className={`
        relative mx-auto max-w-4xl px-6 text-center
        lg:px-8
      `}
      >
        <div className={`
          mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4
          py-2
        `}
        >
          <Heart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Gratuit pour tous les étudiants
          </span>
        </div>

        <h2 className={`
          text-4xl font-bold tracking-tight text-foreground
          sm:text-5xl
          lg:text-6xl
        `}
        >
          Prêt à Réussir vos
          <span className="mt-2 block text-primary">Examens ?</span>
        </h2>

        <p className={`
          mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground
        `}
        >
          Rejoignez des milliers d'étudiants qui utilisent Kurama pour préparer leur BEPC et BAC.
          Commencez gratuitement dès aujourd'hui.
        </p>

        <div className={`
          mt-10 flex flex-col items-center justify-center gap-4
          sm:flex-row
        `}
        >
          <Button size="lg" className="group px-8 py-6 text-lg" asChild data-get-started-button>
            <Link to="/app">
              Commencer Gratuitement
              <ArrowRight className={`
                ml-2 h-5 w-5 transition-transform
                group-hover:translate-x-1
              `}
              />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg"
            onClick={() => {
              const featuresSection = document.getElementById('features')
              featuresSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            En Savoir Plus
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Aucune carte bancaire requise • Accès immédiat • Fonctionne hors-ligne
        </p>
      </div>
    </section>
  )
}

export default CTASection
