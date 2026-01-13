import type { SubjectPerformance } from '@/lib/atoms/parent-dashboard'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface SubjectPerformanceGridProps {
  performance: SubjectPerformance[]
  className?: string
}

/**
 * Subject Performance Grid
 *
 * Displays a grid of cards showing performance per subject
 */
export function SubjectPerformanceGrid({
  performance,
  className,
}: SubjectPerformanceGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {performance.map((item, index) => (
        <motion.div
          key={item.subjectId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl border border-border bg-card/50 p-3 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              `bg-${item.subjectColor}`,
            )}
            />
            <TrendIndicator trend={item.trend} />
          </div>

          <h4 className="text-xs font-bold text-muted-foreground uppercase truncate mb-1">
            {item.subjectName}
          </h4>

          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">
              {item.successRate}
              %
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground mt-1">
            {Math.floor(item.studyMinutes / 60)}
            h
            {item.studyMinutes % 60}
            min d'étude
          </p>
        </motion.div>
      ))}
    </div>
  )
}

function TrendIndicator({ trend }: { trend: SubjectPerformance['trend'] }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-emerald-400" />
    case 'down':
      return <TrendingDown className="h-3 w-3 text-red-400" />
    case 'stable':
      return <Minus className="h-3 w-3 text-muted-foreground" />
  }
}
