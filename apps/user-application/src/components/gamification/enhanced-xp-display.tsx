import { ChevronDown, Clock, Flame, Star, Target, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVibration, VibrationPatterns } from '@/hooks'
import { cn } from '@/lib/utils'

interface XPBreakdownItem {
  type: 'base' | 'multiplier' | 'bonus'
  label: string
  value: number
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  description?: string
}

interface EnhancedXPDisplayProps {
  totalXP: number
  mode: 'flashcards' | 'quiz' | 'exam' | 'quick-review'
  correctCount: number
  totalCount: number
  streakDays?: number
  hasLevelUp?: boolean
  newLevel?: number
  className?: string
}

export function EnhancedXPDisplay({
  totalXP,
  mode,
  correctCount,
  totalCount,
  streakDays = 0,
  hasLevelUp = false,
  newLevel,
  className,
}: EnhancedXPDisplayProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [{ isSupported }, { vibrate }] = useVibration()

  // Trigger vibration feedback on mount for XP gain and level up
  useEffect(() => {
    if (!isSupported)
      return

    if (hasLevelUp) {
      // Level up gets priority vibration
      vibrate(VibrationPatterns.levelUp)
    }
    else if (totalXP > 0) {
      // XP gain vibration based on amount
      vibrate(VibrationPatterns.xpGain(totalXP))
    }
  }, [isSupported, vibrate, hasLevelUp, totalXP])

  // Calculate XP breakdown based on mode
  const baseRates = {
    'flashcards': 8,
    'quiz': 10,
    'exam': 12,
    'quick-review': 7,
  }

  const baseXP = correctCount * baseRates[mode]
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const isPassing = percentage >= 80

  // Calculate bonuses and multipliers
  const breakdown: XPBreakdownItem[] = [
    {
      type: 'base',
      label: 'XP de base',
      value: baseXP,
      icon: Zap,
      color: 'text-xp',
      description: `${correctCount} × ${baseRates[mode]} XP (${mode})`,
    },
  ]

  // Streak multiplier
  if (streakDays >= 3) {
    const streakMultiplier = Math.min(streakDays * 0.1, 0.5)
    const streakBonus = Math.round(baseXP * streakMultiplier)
    breakdown.push({
      type: 'multiplier',
      label: `Série ${streakDays} jours`,
      value: streakBonus,
      icon: Flame,
      color: 'text-streak',
      description: `+${Math.round(streakMultiplier * 100)}% bonus de série`,
    })
  }

  // Perfect score bonus
  if (percentage === 100) {
    breakdown.push({
      type: 'bonus',
      label: 'Score parfait',
      value: 50,
      icon: Star,
      color: 'text-legendary',
      description: '100% de réussite',
    })
  }

  // Passing bonus
  if (isPassing) {
    breakdown.push({
      type: 'bonus',
      label: 'Réussite',
      value: 100,
      icon: Target,
      color: 'text-success',
      description: 'Score ≥ 80%',
    })
  }

  // Mode-specific bonuses
  if (mode === 'flashcards') {
    // Morning/evening bonus simulation
    const currentHour = new Date().getHours()
    if (currentHour < 9) {
      breakdown.push({
        type: 'bonus',
        label: 'Lève-tôt',
        value: 5,
        icon: Clock,
        color: 'text-info',
        description: 'Étude matinale',
      })
    }
  }
  else if (mode === 'exam' && percentage >= 90) {
    breakdown.push({
      type: 'bonus',
      label: 'Excellence en examen',
      value: 50,
      icon: Target,
      color: 'text-legendary',
      description: 'Performance exceptionnelle sous pression',
    })
  }
  else if (mode === 'quiz' && correctCount >= 5) {
    breakdown.push({
      type: 'bonus',
      label: 'Pensée rapide',
      value: 25,
      icon: Clock,
      color: 'text-epic',
      description: 'Réflexion efficace en quiz',
    })
  }
  else if (mode === 'quick-review' && percentage >= 85) {
    breakdown.push({
      type: 'bonus',
      label: 'Maîtrise améliorée',
      value: 30,
      icon: Star,
      color: 'text-rare',
      description: 'Progression sur cartes difficiles',
    })
  }

  const gradientClass = hasLevelUp
    ? 'from-legendary via-epic to-legendary'
    : 'from-xp to-yellow-500'

  return (
    <Card className={cn('border-border bg-card backdrop-blur-xl overflow-hidden relative', className)}>
      <div className={`absolute inset-0 opacity-10 bg-linear-to-r ${gradientClass}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">XP Gagnés</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                +
                {totalXP}
              </span>
              <span className="text-sm text-xp font-bold">XP</span>
            </div>
          </div>

          {hasLevelUp && (
            <div className="flex flex-col items-end">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-legendary/20 text-legendary px-3 py-1 rounded-full text-xs font-bold border border-legendary/30"
              >
                LEVEL UP!
              </motion.div>
              <span className="text-2xl font-bold text-foreground mt-1">
                Lvl
                {newLevel}
              </span>
            </div>
          )}

          {!hasLevelUp && (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Zap className="h-6 w-6 text-xp" />
            </div>
          )}
        </div>

        {/* Enhanced breakdown toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span className="text-xs">Voir le détail</span>
          <motion.div
            animate={{ rotate: showBreakdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                {breakdown.map((item, index) => {
                  const Icon = item.icon || Zap
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          item.type === 'base' && 'bg-xp/10',
                          item.type === 'multiplier' && 'bg-streak/10',
                          item.type === 'bonus' && 'bg-legendary/10',
                        )}
                        >
                          <Icon className={cn('w-4 h-4', item.color || 'text-muted-foreground')} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        'text-sm font-bold',
                        item.color || 'text-foreground',
                      )}
                      >
                        +
                        {item.value}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Total line */}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-foreground">Total</div>
                    <div className="text-lg font-bold text-xp">
                      +
                      {totalXP}
                      {' '}
                      XP
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for smaller displays
 */
interface CompactXPDisplayProps {
  totalXP: number
  hasLevelUp?: boolean
  newLevel?: number
  className?: string
}

export function CompactXPDisplay({
  totalXP,
  hasLevelUp = false,
  newLevel,
  className,
}: CompactXPDisplayProps) {
  const [{ isSupported }, { vibrate }] = useVibration()

  // Trigger vibration feedback on mount
  useEffect(() => {
    if (!isSupported)
      return

    if (hasLevelUp) {
      vibrate(VibrationPatterns.levelUp)
    }
    else if (totalXP > 0) {
      vibrate(VibrationPatterns.xpGain(totalXP))
    }
  }, [isSupported, vibrate, hasLevelUp, totalXP])
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-xp/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-xp" />
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">
            +
            {totalXP}
          </div>
          <div className="text-xs text-xp font-medium">XP</div>
        </div>
      </div>

      {hasLevelUp && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 bg-legendary/10 border border-legendary/20 rounded-full px-3 py-1"
        >
          <Star className="w-4 h-4 text-legendary" />
          <span className="text-sm font-bold text-legendary">
            Lvl
            {newLevel}
          </span>
        </motion.div>
      )}
    </div>
  )
}
