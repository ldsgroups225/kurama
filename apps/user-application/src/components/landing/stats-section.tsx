import { BookOpen, TrendingUp, Trophy, Users } from '@/lib/icons'

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Étudiants Actifs',
    description: 'Rejoignez une communauté grandissante',
  },
  {
    icon: BookOpen,
    value: '50,000+',
    label: 'Cartes d\'Étude',
    description: 'Contenu aligné au programme',
  },
  {
    icon: Trophy,
    value: '92%',
    label: 'Taux de Réussite',
    description: 'Nos étudiants excellent',
  },
  {
    icon: TrendingUp,
    value: '3x',
    label: 'Plus Rapide',
    description: 'Apprentissage optimisé',
  },
]

export function StatsSection() {
  return (
    <section className="bg-muted/30 py-16">
      <div className={`
        mx-auto max-w-7xl px-6
        lg:px-8
      `}
      >
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className={`
            text-3xl font-bold tracking-tight text-foreground
            sm:text-4xl
          `}
          >
            Des Résultats qui Parlent
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Rejoignez des milliers d'étudiants qui transforment leur apprentissage
          </p>
        </div>

        <div className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-4
        `}
        >
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <div
                key={stat.label}
                className={`
                  flex flex-col items-center rounded-lg border border-border/50
                  bg-background p-6 text-center transition-colors
                  hover:border-primary/50
                `}
              >
                <div className={`
                  mb-4 flex h-12 w-12 items-center justify-center rounded-full
                  bg-primary/10
                `}
                >
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="mb-2 text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mb-1 text-sm font-semibold text-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
