import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Quote, Star } from '@/lib/icons'
import { generateUUID } from '@/utils/generateUUID'

const testimonials = [
  {
    name: 'Aminata K.',
    role: 'Élève de Terminale',
    location: 'Abidjan',
    content: 'Kurama m\'a aidée à améliorer mes notes en mathématiques de 12 à 17. La répétition espacée fonctionne vraiment !',
    rating: 5,
    exam: 'BAC 2024',
  },
  {
    name: 'Ibrahim D.',
    role: 'Élève de 3ème',
    location: 'Bouaké',
    content: 'J\'adore pouvoir étudier même sans connexion Internet. Les quiz sont super pour se préparer aux examens.',
    rating: 5,
    exam: 'BEPC 2024',
  },
  {
    name: 'Fatoumata S.',
    role: 'Élève de Première',
    location: 'Yamoussoukro',
    content: 'Les groupes d\'étude m\'ont permis de rencontrer d\'autres étudiants motivés. On s\'entraide et on progresse ensemble.',
    rating: 5,
    exam: 'BAC 2025',
  },
  {
    name: 'Kouassi M.',
    role: 'Élève de Terminale',
    location: 'San-Pédro',
    content: 'Le simulateur d\'examen est génial pour se préparer dans les conditions réelles. Je me sens beaucoup plus confiant maintenant.',
    rating: 5,
    exam: 'BAC 2024',
  },
]

export function TestimonialsSection() {
  return (
    <section className={`
      bg-background py-24
      sm:py-32
    `}
    >
      <div className={`
        mx-auto max-w-7xl px-6
        lg:px-8
      `}
      >
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Témoignages
          </Badge>
          <h2 className={`
            text-3xl font-bold tracking-tight text-foreground
            sm:text-4xl
          `}
          >
            Ce que Disent nos Étudiants
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des milliers d'étudiants ont déjà transformé leur apprentissage avec Kurama
          </p>
        </div>

        <div className={`
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-2
        `}
        >
          {testimonials.map(testimonial => (
            <Card
              key={testimonial.name}
              className={`
                relative overflow-hidden transition-all duration-300
                hover:shadow-lg
              `}
            >
              <CardContent className="p-8">
                <Quote className={`
                  absolute top-4 right-4 h-12 w-12 text-primary/10
                `}
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map(() => (
                      <Star
                        key={generateUUID()}
                        className="fill-level text-level h-4 w-4"
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-base leading-relaxed text-foreground">
                    "
                    {testimonial.content}
                    "
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                        {' '}
                        •
                        {testimonial.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.exam}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
