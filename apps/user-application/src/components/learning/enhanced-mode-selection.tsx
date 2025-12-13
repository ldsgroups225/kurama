import { motion } from 'framer-motion'
import { ChevronRight, Clock, CreditCard, FileText, ListChecks, Star, Target, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { calculatePotentialXP, getModeDifficultyDescription, getModeXPRate } from '@/lib/learning-mode-gamification'
import { cn } from '@/lib/utils'

type LearningMode = 'flashcards' | 'quiz' | 'exam'

interface ModeOption {
  id: LearningMode
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  tag: string
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
  features: string[]
}

const learningModes: ModeOption[] = [
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Mémorisation avec gamification avancée',
    icon: CreditCard,
    gradient: 'from-amber-400 to-orange-500',
    tag: 'Mémorisation',
    difficulty: 'Facile',
    features: ['Bonus de série', 'Multiplicateurs de difficulté', 'Récompenses temporelles'],
  },
  {
    id: 'quiz',
    name: 'Quiz Rapide',
    description: 'Évaluation objective avec bonus de vitesse',
    icon: ListChecks,
    gradient: 'from-emerald-400 to-green-600',
    tag: 'Entraînement',
    difficulty: 'Moyen',
    features: ['Bonus de vitesse', 'Combos de réponses', 'Pensée rapide'],
  },
  {
    id: 'exam',
    name: 'Mode Examen',
    description: 'Simulation haute pression avec récompenses maximales',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
    tag: 'Évaluation',
    difficulty: 'Difficile',
    features: ['XP maximum', 'Bonus sous pression', 'Simulation réelle'],
  },
]

interface EnhancedModeSelectionProps {
  cardCount: number
  onModeSelect: (mode: LearningMode) => void
  className?: string
}

export function EnhancedModeSelection({ cardCount, onModeSelect, className }: EnhancedModeSelectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-4', className)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1 rounded-md bg-amber-400/10">
          <Target className="w-4 h-4 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Mode d'apprentissage</h2>
      </div>

      <div className="space-y-3">
        {learningModes.map((mode) => {
          const Icon = mode.icon
          const xpRate = getModeXPRate(mode.id)
          const potentialXP = calculatePotentialXP(mode.id, cardCount)

          return (
            <motion.div
              key={mode.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer transition-all hover:bg-accent/50 hover:border-primary/20 overflow-hidden"
                onClick={() => onModeSelect(mode.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-lg',
                      mode.gradient,
                    )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground">
                          {mode.name}
                        </h3>
                        <Badge className="bg-muted text-muted-foreground border-0 px-1.5 py-0 h-5 text-[10px]">
                          {mode.tag}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'px-1.5 py-0 h-5 text-[10px] border-0',
                            mode.difficulty === 'Facile' && 'bg-success/10 text-success',
                            mode.difficulty === 'Moyen' && 'bg-warning/10 text-warning',
                            mode.difficulty === 'Difficile' && 'bg-error/10 text-error',
                          )}
                        >
                          {mode.difficulty}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {getModeDifficultyDescription(mode.id)}
                      </p>

                      {/* XP Info */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="w-3 h-3 text-xp" />
                          <span className="text-xp font-bold">
                            {xpRate}
                            {' '}
                            XP/carte
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-legendary" />
                          <span className="text-legendary font-bold">
                            {potentialXP.min}
                            -
                            {potentialXP.max}
                            {' '}
                            XP
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {mode.features.slice(0, 2).map(feature => (
                          <span
                            key={feature}
                            className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {mode.features.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +
                            {mode.features.length - 2}
                            {' '}
                            autres
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </div>

                  {/* Enhanced info bar */}
                  <div className={cn(
                    'px-4 py-2 bg-linear-to-r opacity-5',
                    mode.gradient,
                  )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          ~
                          {Math.ceil(cardCount * (mode.id === 'flashcards' ? 0.5 : mode.id === 'quiz' ? 1 : 1.5))}
                          {' '}
                          min
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">XP attendu:</span>
                        <span className="font-bold text-xp">{potentialXP.expected}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* XP Legend */}
      <motion.div
        variants={itemVariants}
        className="mt-6 p-4 bg-muted/30 rounded-lg border border-border"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-xp" />
          <span className="text-sm font-medium text-foreground">Système XP amélioré</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            •
            <strong>Flashcards:</strong>
            {' '}
            Bonus de série, multiplicateurs de difficulté
          </p>
          <p>
            •
            <strong>Quiz:</strong>
            {' '}
            Bonus de vitesse, combos de réponses correctes
          </p>
          <p>
            •
            <strong>Examen:</strong>
            {' '}
            Récompenses maximales, bonus sous pression
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
