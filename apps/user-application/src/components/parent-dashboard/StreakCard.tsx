import { Flame } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface StreakCardProps {
  /** Current streak in days */
  currentStreak: number
  /** Longest streak ever */
  longestStreak?: number
  className?: string
}

/**
 * Streak Card
 *
 * Shows the child's current study streak with flame icon
 */
export function StreakCard({
  currentStreak,
  longestStreak,
  className,
}: StreakCardProps) {
  const isStreakActive = currentStreak > 0
  const isNewRecord = longestStreak && currentStreak >= longestStreak && currentStreak > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md',
        isStreakActive
          ? 'border-orange-500/20 bg-orange-500/5'
          : 'border-border bg-card',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left - Icon and Label */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center',
            isStreakActive
              ? 'bg-linear-to-br from-orange-500 to-red-500'
              : 'bg-muted',
          )}
          >
            <Flame className={cn(
              'h-6 w-6',
              isStreakActive ? 'text-white' : 'text-muted-foreground',
            )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
            <p className={cn(
              'text-2xl font-bold',
              isStreakActive ? 'text-orange-400' : 'text-foreground',
            )}
            >
              {currentStreak}
              {' '}
              jour
              {currentStreak !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Right - Record indicator or longest streak */}
        <div className="text-right">
          {isNewRecord
            ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold">
                  🏆 Record !
                </span>
              )
            : longestStreak
              ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Record</p>
                    <p className="text-sm font-bold text-foreground">
                      {longestStreak}
                      j
                    </p>
                  </div>
                )
              : null}
        </div>
      </div>

      {/* Decorative flame glow */}
      {isStreakActive && (
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
      )}
    </motion.div>
  )
}
