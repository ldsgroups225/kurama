import type { XPCalculationResult } from '@/lib/flashcard-gamification'
import { Clock, Flame, Star, Target, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useReducer, useState } from 'react'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface XPFeedbackProps {
  result: XPCalculationResult | null
  show: boolean
  onComplete?: () => void
}

interface AnimationState {
  step: number
  showTotal: boolean
}

type AnimationAction = 'next_step' | 'show_total' | 'reset'

function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action) {
    case 'next_step':
      return { ...state, step: state.step + 1 }
    case 'show_total':
      return { ...state, showTotal: true }
    case 'reset':
      return { step: 0, showTotal: false }
    default:
      return state
  }
}

export function XPFeedback({ result, show, onComplete }: XPFeedbackProps) {
  const [{ step: currentStep, showTotal }, dispatch] = useReducer(animationReducer, { step: 0, showTotal: false })

  useEffect(() => {
    if (show && result) {
      const steps = [
        { type: 'base', value: result.baseXP },
        ...result.bonuses.map(bonus => ({
          type: 'bonus',
          value: bonus.value,
          name: bonus.name,
        })),
      ]

      const stepInterval = setInterval(() => {
        dispatch('next_step')
      }, 600)

      const totalTimeout = setTimeout(() => {
        dispatch('show_total')
        const hideTimeout = setTimeout(() => {
          dispatch('reset')
          onComplete?.()
        }, 2000)
        return () => clearTimeout(hideTimeout)
      }, 600 * (steps.length + 1))

      return () => {
        clearInterval(stepInterval)
        clearTimeout(totalTimeout)
      }
    }
    else {
      dispatch('reset')
    }
  }, [show, result, onComplete])

  if (!show || !result)
    return null

  const hasMultipliers = Object.values(result.multipliers).some(m => m !== 1)
  const hasBonuses = result.bonuses.length > 0

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {!showTotal
          ? (
              <motion.div
                key="breakdown"
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl max-w-xs"
              >
                <div className="text-center space-y-4">
                  {/* Base XP */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: currentStep >= 1 ? 1 : 0.3, y: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 text-xp" />
                    <span className="text-lg font-bold text-foreground">
                      +
                      {result.baseXP}
                      {' '}
                      XP
                    </span>
                    <span className="text-sm text-muted-foreground">(base)</span>
                  </motion.div>

                  {/* Multipliers */}
                  {hasMultipliers && (
                    <div className="space-y-2">
                      {result.multipliers.streak > 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: currentStep >= 2 ? 1 : 0.3, x: 0 }}
                          className="flex items-center justify-center gap-2 text-sm"
                        >
                          <Flame className="w-4 h-4 text-streak" />
                          <span className="text-streak font-medium">
                            x
                            {result.multipliers.streak.toFixed(1)}
                            {' '}
                            série
                          </span>
                        </motion.div>
                      )}

                      {result.multipliers.difficulty !== 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: currentStep >= 2 ? 1 : 0.3, x: 0 }}
                          className="flex items-center justify-center gap-2 text-sm"
                        >
                          <Target className="w-4 h-4 text-rare" />
                          <span className="text-rare font-medium">
                            x
                            {result.multipliers.difficulty.toFixed(1)}
                            {' '}
                            difficulté
                          </span>
                        </motion.div>
                      )}

                      {result.multipliers.interval > 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: currentStep >= 2 ? 1 : 0.3, x: 0 }}
                          className="flex items-center justify-center gap-2 text-sm"
                        >
                          <Clock className="w-4 h-4 text-epic" />
                          <span className="text-epic font-medium">
                            x
                            {result.multipliers.interval.toFixed(1)}
                            {' '}
                            révision espacée
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Bonuses */}
                  {hasBonuses && (
                    <div className="space-y-2">
                      {result.bonuses.map((bonus, index) => (
                        <motion.div
                          key={bonus.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: currentStep >= 3 + index ? 1 : 0.3,
                            scale: currentStep >= 3 + index ? 1 : 0.8,
                          }}
                          className="flex items-center justify-center gap-2 text-sm"
                        >
                          <Star className="w-4 h-4 text-legendary" />
                          <span className="text-legendary font-medium">
                            +
                            {bonus.value}
                            {' '}
                            XP
                          </span>
                          <span className="text-muted-foreground">
                            (
                            {bonus.name}
                            )
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.3, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.3, x: 20 }}
                className="bg-gradient-xp text-white rounded-2xl p-4 shadow-xl"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-2"
                  >
                    <Zap className="w-8 h-8 mx-auto" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-2xl font-bold mb-1">
                      +
                      {result.totalXP}
                    </div>
                    <div className="text-sm opacity-90">
                      XP Total
                    </div>
                  </motion.div>

                  {/* Achievement badges */}
                  {result.achievements.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-4 flex flex-wrap justify-center gap-2"
                    >
                      {result.achievements.map(achievement => (
                        <div
                          key={achievement}
                          className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium"
                        >
                          🏆
                          {' '}
                          {achievement}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Compact XP display for inline feedback
 */
interface CompactXPDisplayProps {
  xp: number
  breakdown?: string[]
  className?: string
}

export function CompactXPDisplay({ xp, breakdown, className }: CompactXPDisplayProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <motion.button
        type="button"
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="flex items-center gap-1 px-2 rounded-full bg-xp/10 text-xp border border-xp/20 hover:bg-xp/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-3 h-3" />
        <span className="text-sm font-bold">
          +
          {xp}
        </span>
      </motion.button>

      <AnimatePresence>
        {showBreakdown && breakdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg p-3 shadow-lg z-10 min-w-48"
          >
            <div className="space-y-1">
              {breakdown.map(line => (
                <div key={generateUUID()} className="text-xs text-muted-foreground">
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
