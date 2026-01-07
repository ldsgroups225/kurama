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
  Map,
  Megaphone,
  Pi,
  Scale,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getSubjects } from '@/core/functions/learning'
import { authClient, isSigningOut } from '@/lib/auth-client'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/subjects/')({
  component: SubjectsPage,
})

// Subject config with premium gradients
const subjectConfig: Record<string, { icon: LucideIcon, gradient: string }> = {
  MATH: { icon: Pi, gradient: 'from-blue-500 to-cyan-500' },
  FR: { icon: BookOpen, gradient: 'from-rose-500 to-pink-500' },
  ANG: { icon: Languages, gradient: 'from-indigo-500 to-purple-500' },
  PC: { icon: Atom, gradient: 'from-sky-500 to-blue-600' },
  SVT: { icon: Dna, gradient: 'from-emerald-500 to-green-600' },
  HG: { icon: Map, gradient: 'from-amber-500 to-yellow-600' },
  PHILO: { icon: Brain, gradient: 'from-fuchsia-500 to-pink-600' },
  ECM: { icon: Scale, gradient: 'from-teal-500 to-cyan-600' },
  ESP: { icon: Megaphone, gradient: 'from-red-500 to-orange-500' },
  ALL: { icon: Megaphone, gradient: 'from-yellow-400 to-orange-500' },
  ECO: { icon: TrendingUp, gradient: 'from-blue-400 to-indigo-500' },
  COMPTA: { icon: Calculator, gradient: 'from-slate-500 to-zinc-500' },
}

// Fallback patterns
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

const defaultConfig = { icon: BookOpen, gradient: 'from-zinc-500 to-zinc-400' }

function getSubjectConfig(abbreviation?: string | null, name?: string) {
  const byAbbr = abbreviation ? subjectConfig[abbreviation] : undefined
  if (byAbbr)
    return byAbbr

  if (name) {
    const match = namePatterns.find(({ pattern }) => pattern.test(name))
    const byPattern = match ? subjectConfig[match.abbr] : undefined
    if (byPattern)
      return byPattern
  }
  return defaultConfig
}

function SubjectsPage() {
  useEffect(() => {
    const endTracking = trackRouteLoad('app-subjects')
    return endTracking
  }, [])

  const session = authClient.useSession()
  const userId = session.data?.user?.id

  const { data: subjects, isLoading, isFetching } = useQuery({
    queryKey: ['subjects', userId],
    queryFn: () => getSubjects(),
    enabled: !!userId && !isSigningOut(),
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (session.isPending || isLoading || (isFetching && !subjects)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <LogoLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <AppHeader title="Matières" showAvatar={false} className="bg-transparent/0 border-none" />

      <main className="relative z-10 mx-auto max-w-lg space-y-4 px-5 pt-2">
        {/* Header */}
        <div className="py-4">
          <Badge className="mb-3 bg-muted text-muted-foreground border-border hover:bg-muted/80 transition-colors">
            <BookOpen className="w-3 h-3 mr-1.5 text-blue-500" />
            Parcours Scolaire
          </Badge>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Quelle matière travailler ?</h2>
          <p className="text-muted-foreground">Choisis un sujet et progresse à ton rythme.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          {subjects?.map((subject) => {
            const config = getSubjectConfig(subject.abbreviation, subject.name)
            const Icon = config.icon

            return (
              <Link
                key={subject.id}
                to="/app/subjects/$subjectId"
                params={{ subjectId: String(subject.id) }}
                className="block outline-none"
              >
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-1 backdrop-blur-xl transition-all hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center p-4">
                    {/* Icon Box */}
                    <div className={cn(
                      'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110',
                      'bg-linear-to-br',
                      config.gradient,
                    )}
                    >
                      {/* Inner glare */}
                      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/20 to-transparent opacity-50" />
                      <Icon className="h-8 w-8 text-white relative z-10" />
                    </div>

                    {/* Content */}
                    <div className="ml-5 flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 truncate group-hover:text-primary transition-all">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="line-clamp-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {subject.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted group-hover:bg-accent transition-colors ml-2">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
