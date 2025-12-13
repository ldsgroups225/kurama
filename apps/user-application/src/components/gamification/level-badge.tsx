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
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-yellow-500/50 blur-[10px] opacity-50 group-hover:opacity-100 transition-opacity" />

          {/* Badge Circle */}
          <div className={`
             relative z-10
             flex h-12 w-12 items-center justify-center
             rounded-full 
             bg-linear-to-br from-yellow-300 via-amber-500 to-yellow-600
             shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.3)]
             border-2 border-yellow-200/20
          `}
          >
            <span className="text-lg font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">{level}</span>
          </div>

          <div className="absolute -top-1 -right-1 z-20 animate-pulse">
            <Sparkles className="text-yellow-100 h-4 w-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-500 tracking-wide uppercase">
              Niveau
              {' '}
              {level}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {currentXP}
              {' '}
              /
              {nextLevelXP}
              {' '}
              XP
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-border">
            <div
              className={`
                h-full rounded-full transition-all duration-1000 ease-out
                bg-linear-to-r from-yellow-500 to-amber-300
                shadow-[0_0_10px_rgba(251,191,36,0.5)]
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('overflow-hidden border-border bg-card backdrop-blur-xl', className)}>
      <div className="p-5">
        <div className="flex items-center gap-5">
          <div className="relative scale-110">
            {/* Ambient Glow behind badge */}
            <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-[20px]" />

            <div className={`
              relative z-10
              flex h-20 w-20 items-center justify-center
              rounded-full 
              bg-linear-to-br from-yellow-300 via-amber-500 to-yellow-600
              shadow-[inset_0_4px_8px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.4)]
              border-[3px] border-yellow-100/20
              ring-4 ring-black/20
            `}
            >
              <span className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{level}</span>
            </div>

            <div className="absolute -top-2 -right-2 z-20">
              <Sparkles className="text-yellow-100 h-6 w-6 drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-pulse" />
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Niveau
                  {' '}
                  {level}
                </h3>
                <p className="text-xs text-yellow-500/80 font-medium uppercase tracking-wider">Apprenti Sorcier</p>
              </div>

              <Badge variant="secondary" className="gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-semibold">
                  {xpRemaining}
                  {' '}
                  XP
                </span>
                {' '}
                restants
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted border border-border">
                <div
                  className={`
                    h-full rounded-full transition-all duration-1000 ease-out
                    bg-linear-to-r from-yellow-600 via-amber-500 to-yellow-300
                    shadow-[0_0_15px_rgba(251,191,36,0.6)]
                    relative overflow-hidden
                  `}
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
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
