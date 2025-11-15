import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sparkles, TrendingUp } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: number
  currentXP: number
  nextLevelXP: number
  className?: string
  compact?: boolean
}

export function LevelBadge({
  level,
  currentXP,
  nextLevelXP,
  className,
  compact = false,
}: LevelBadgeProps) {
  const progress = (currentXP / nextLevelXP) * 100
  const xpRemaining = nextLevelXP - currentXP

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="relative">
          <div className={`
            bg-gradient-level flex h-10 w-10 items-center justify-center
            rounded-full shadow-lg
          `}
          >
            <span className="text-sm font-bold text-white">{level}</span>
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="text-level fill-level h-4 w-4" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Niveau
              {level}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentXP}
              /
              {nextLevelXP}
              {' '}
              XP
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`
                bg-gradient-level-horizontal h-full rounded-full transition-all
                duration-500
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="bg-level p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`
              bg-gradient-level flex h-16 w-16 items-center justify-center
              rounded-full shadow-lg ring-4 ring-background
            `}
            >
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles className="text-level fill-level h-5 w-5" />
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                Niveau
                {level}
              </h3>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {xpRemaining}
                {' '}
                XP restants
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`
                    bg-gradient-level-horizontal h-full rounded-full
                    transition-all duration-500
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`
                flex justify-between text-xs text-muted-foreground
              `}
              >
                <span>
                  {currentXP}
                  {' '}
                  XP
                </span>
                <span>
                  {nextLevelXP}
                  {' '}
                  XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
