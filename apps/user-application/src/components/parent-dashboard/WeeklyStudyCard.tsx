import { Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface WeeklyStudyCardProps {
  /** Study time in minutes */
  studyMinutes: number
  /** Weekly goal in minutes */
  goalMinutes: number
  className?: string
}

/**
 * Weekly Study Card
 *
 * Shows the child's study time this week with progress bar toward goal
 */
export function WeeklyStudyCard({
  studyMinutes,
  goalMinutes,
  className,
}: WeeklyStudyCardProps) {
  const hours = Math.floor(studyMinutes / 60)
  const minutes = studyMinutes % 60
  const progressPercent = Math.min((studyMinutes / goalMinutes) * 100, 100)
  const isGoalReached = studyMinutes >= goalMinutes

  const formatTime = () => {
    if (hours === 0)
      return `${minutes} min`
    if (minutes === 0)
      return `${hours}h`
    return `${hours}h ${minutes}min`
  }

  const formatGoal = () => {
    const goalHours = Math.floor(goalMinutes / 60)
    return `${goalHours}h`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-4 backdrop-blur-md',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-teal-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Cette semaine</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Objectif :
          {' '}
          {formatGoal()}
        </span>
      </div>

      {/* Time Display */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-foreground">{formatTime()}</span>
        <span className="text-sm text-muted-foreground ml-2">d'étude</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isGoalReached ? 'bg-emerald-500' : 'bg-teal-500',
          )}
        />
      </div>

      {/* Progress Label */}
      <div className="flex justify-between mt-2">
        <span className={cn(
          'text-xs font-medium',
          isGoalReached ? 'text-emerald-400' : 'text-muted-foreground',
        )}
        >
          {Math.round(progressPercent)}
          % de l'objectif
        </span>
        {isGoalReached && (
          <span className="text-xs font-bold text-emerald-400">
            ✓ Objectif atteint !
          </span>
        )}
      </div>
    </motion.div>
  )
}
