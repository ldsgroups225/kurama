import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Atom,
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  Dna,
  Languages,
  Loader2,
  Map,
  Megaphone,
  Pi,
  Scale,
  TrendingUp,
} from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubjects } from '@/core/functions/learning'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/subjects/')({
  component: SubjectsPage,
})

// Subject config by abbreviation (matches database abbreviations)
const subjectConfig: Record<string, { icon: LucideIcon, text: string, bg: string }> = {
  MATH: { icon: Pi, text: 'text-subject-math', bg: 'bg-subject-math' },
  FR: { icon: BookOpen, text: 'text-subject-french', bg: 'bg-subject-french' },
  ANG: { icon: Languages, text: 'text-subject-english', bg: 'bg-subject-english' },
  PC: { icon: Atom, text: 'text-subject-physics', bg: 'bg-subject-physics' },
  SVT: { icon: Dna, text: 'text-subject-svt', bg: 'bg-subject-svt' },
  HG: { icon: Map, text: 'text-subject-history', bg: 'bg-subject-history' },
  PHILO: { icon: Brain, text: 'text-subject-philosophy', bg: 'bg-subject-philosophy' },
  ECM: { icon: Scale, text: 'text-subject-ecm', bg: 'bg-subject-ecm' },
  ESP: { icon: Megaphone, text: 'text-subject-spanish', bg: 'bg-subject-spanish' },
  ALL: { icon: Megaphone, text: 'text-subject-german', bg: 'bg-subject-german' },
  ECO: { icon: TrendingUp, text: 'text-subject-economics', bg: 'bg-subject-economics' },
  COMPTA: { icon: Calculator, text: 'text-subject-accounting', bg: 'bg-subject-accounting' },
}

// Fallback patterns for name-based matching (handles "Histoire", "Histoire-Géo", "Histoire-Géographie")
const namePatterns: Array<{ pattern: RegExp, abbr: string }> = [
  { pattern: /math/i, abbr: 'MATH' },
  { pattern: /fran[cç]ais/i, abbr: 'FR' },
  { pattern: /anglais/i, abbr: 'ANG' },
  { pattern: /physi/i, abbr: 'PC' },
  { pattern: /svt|vie.*terre/i, abbr: 'SVT' },
  { pattern: /hist|géo/i, abbr: 'HG' },
  { pattern: /philo/i, abbr: 'PHILO' },
  { pattern: /civique|edhc|ecm/i, abbr: 'ECM' },
  { pattern: /espagnol/i, abbr: 'ESP' },
  { pattern: /allemand/i, abbr: 'ALL' },
  { pattern: /économ|ses/i, abbr: 'ECO' },
  { pattern: /compta/i, abbr: 'COMPTA' },
]

const defaultConfig = { icon: BookOpen, text: 'text-primary', bg: 'bg-primary' }

interface SubjectConfigValue { icon: LucideIcon, text: string, bg: string }

/** Get subject config by abbreviation or name pattern */
function getSubjectConfig(abbreviation?: string | null, name?: string): SubjectConfigValue {
  // Try abbreviation first
  const byAbbr = abbreviation ? subjectConfig[abbreviation] : undefined
  if (byAbbr)
    return byAbbr

  // Fallback to name pattern matching
  if (name) {
    const match = namePatterns.find(({ pattern }) => pattern.test(name))
    const byPattern = match ? subjectConfig[match.abbr] : undefined
    if (byPattern)
      return byPattern
  }
  return defaultConfig
}

function SubjectsPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-subjects')
    return endTracking
  }, [])

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Matières" showAvatar={false} />

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {/* Motivational Header */}
        <div className="py-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">Quelle matière aujourd'hui ? 🎯</h2>
          <p className="text-muted-foreground">Choisis ta matière préférée et commence à apprendre !</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {subjects?.map((subject) => {
            const config = getSubjectConfig(subject.abbreviation, subject.name)
            const Icon = config.icon

            return (
              <Link
                key={subject.id}
                to="/app/subjects/$subjectId"
                params={{ subjectId: String(subject.id) }}
                aria-label={`Matière: ${subject.name}`}
              >
                <Card className={`
                  group cursor-pointer overflow-hidden border-2 transition-all
                  duration-200
                  hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg
                `}
                >
                  <div className={`
                    pointer-events-none absolute inset-0 bg-linear-to-br
                    from-transparent to-primary/5 opacity-0 transition-opacity
                    group-hover:opacity-100
                  `}
                  />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            flex h-16 w-16 items-center justify-center
                            rounded-2xl
                            ${config.bg}
                            ${config.text}
                            shadow-lg transition-transform duration-200
                            group-hover:scale-110
                          `}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className={`
                            mb-1 text-lg transition-colors
                            group-hover:text-primary
                          `}
                          >
                            {subject.name}
                          </CardTitle>
                          {subject.description && (
                            <p className={`
                              line-clamp-2 text-sm text-muted-foreground
                            `}
                            >
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`
                        h-6 w-6 shrink-0 text-muted-foreground transition-all
                        group-hover:translate-x-1 group-hover:text-primary
                      `}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
