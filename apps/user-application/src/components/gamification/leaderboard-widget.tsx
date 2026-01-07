import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Award, ChevronRight, Crown, Medal, Minus, TrendingDown, TrendingUp, Trophy, Users } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  points: number
  rank: number
  previousRank?: number
  isCurrentUser?: boolean
}

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  title?: string
  className?: string
  variant?: 'default' | 'compact'
  onViewAll?: () => void
}

export function LeaderboardWidget({
  entries,
  currentUserId,
  title = 'Classement',
  className,
  variant = 'default',
  onViewAll,
}: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Crown className="h-5 w-5 text-level drop-shadow-[0_0_8px_var(--level-from)]" />
            <div className="absolute inset-0 animate-pulse bg-gradient-level rounded-full blur-md opacity-30" />
          </div>
        )
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground drop-shadow-[0_0_6px_rgba(161,161,170,0.4)]" />
      case 3:
        return <Award className="h-5 w-5 text-streak drop-shadow-[0_0_6px_var(--streak-from)]" />
      default:
        return null
    }
  }

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank)
      return null
    const change = entry.previousRank - entry.rank

    if (change > 0) {
      return (
        <Badge variant="secondary" className="bg-success text-success gap-1 border border-success-to/20 text-[10px] px-1.5 py-0.5">
          <TrendingUp className="h-3 w-3" />
          +
          {change}
        </Badge>
      )
    }
    else if (change < 0) {
      return (
        <Badge variant="secondary" className="bg-error text-error gap-1 border border-error-to/20 text-[10px] px-1.5 py-0.5">
          <TrendingDown className="h-3 w-3" />
          {change}
        </Badge>
      )
    }
    else {
      return (
        <Badge variant="secondary" className="gap-1 bg-muted text-muted-foreground border border-border text-[10px] px-1.5 py-0.5">
          <Minus className="h-3 w-3" />
        </Badge>
      )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRankBackground = (rank: number, isCurrentUser: boolean | undefined) => {
    if (isCurrentUser) {
      return 'bg-xp border-xp-to/30 shadow-[0_0_15px_var(--xp-bg)]'
    }
    switch (rank) {
      case 1:
        return 'bg-level border-level-to/30'
      case 2:
        return 'bg-muted border-muted-foreground/20'
      case 3:
        return 'bg-streak border-streak-to/30'
      default:
        return 'bg-card border-border'
    }
  }

  const displayEntries = variant === 'compact' ? entries.slice(0, 5) : entries

  return (
    <Card className={cn('overflow-hidden border-border bg-card backdrop-blur-xl', className)}>
      <CardContent className={cn('p-5', variant === 'compact' && 'p-4')}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-level" />
            {title}
          </h3>
          <Badge variant="outline" className="border-xp-to/30 bg-xp text-xp text-[10px] font-bold">
            <Users className="w-3 h-3 mr-1" />
            Cette semaine
          </Badge>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {displayEntries.map((entry, index) => {
            const isCurrentUser = entry.id === currentUserId || entry.isCurrentUser
            const rankIcon = getRankIcon(entry.rank)

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 transition-all border',
                  getRankBackground(entry.rank, isCurrentUser),
                  'hover:scale-[1.01] active:scale-[0.99]',
                )}
              >
                {/* Rank */}
                <div className="flex w-8 items-center justify-center shrink-0">
                  {rankIcon || (
                    <span className={cn(
                      'text-sm font-bold',
                      isCurrentUser ? 'text-xp' : 'text-muted-foreground',
                    )}
                    >
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className={cn(
                  'h-9 w-9 border-2 shrink-0',
                  isCurrentUser ? 'border-xp-to/50' : entry.rank <= 3 ? 'border-level-to/30' : 'border-border',
                )}
                >
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className={cn(
                    'text-xs font-bold',
                    isCurrentUser ? 'bg-xp text-xp' : 'bg-muted text-muted-foreground',
                  )}
                  >
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Points */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'truncate text-sm font-semibold',
                    isCurrentUser ? 'text-xp' : 'text-foreground',
                  )}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">(Vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <span className="text-level font-bold">{entry.points.toLocaleString()}</span>
                    {' '}
                    XP
                  </p>
                </div>

                {/* Rank Change */}
                {getRankChange(entry)}
              </motion.div>
            )
          })}
        </div>

        {/* View All Link */}
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 rounded-lg hover:bg-muted"
          >
            Voir le classement complet
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </CardContent>
    </Card>
  )
}
