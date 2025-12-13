import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Medal, Minus, TrendingDown, TrendingUp, Trophy } from '@/lib/icons'
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
}

export function LeaderboardWidget({
  entries,
  currentUserId,
  title = 'Classement',
  className,
}: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
      case 2:
        return <Medal className="h-5 w-5 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
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
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 gap-1 border border-emerald-500/20">
          <TrendingUp className="h-3 w-3" />
          +
          {change}
        </Badge>
      )
    }
    else if (change < 0) {
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-400 gap-1 border border-red-500/20">
          <TrendingDown className="h-3 w-3" />
          {change}
        </Badge>
      )
    }
    else {
      return (
        <Badge variant="secondary" className="gap-1 bg-zinc-800 text-zinc-500 border border-white/5">
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

  return (
    <Card className={cn('overflow-hidden border-white/5 bg-zinc-900/40 backdrop-blur-xl', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300">Cette semaine</Badge>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId || entry.isCurrentUser
            const rankIcon = getRankIcon(entry.rank)

            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 transition-all border',
                  isCurrentUser
                    ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-zinc-800/30 border-white/5 hover:bg-zinc-800/50 hover:border-white/10',
                )}
              >
                {/* Rank */}
                <div className="flex w-8 items-center justify-center">
                  {rankIcon || (
                    <span className="text-sm font-bold text-zinc-500">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className={cn(
                  'h-10 w-10 border-2',
                  isCurrentUser ? 'border-indigo-500/50' : 'border-zinc-800',
                )}
                >
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className="bg-zinc-800 text-xs font-bold text-zinc-400">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'truncate text-sm font-medium',
                    isCurrentUser ? 'text-indigo-400' : 'text-zinc-200',
                  )}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">(Vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium">
                    {entry.points.toLocaleString()}
                    {' '}
                    XP
                  </p>
                </div>

                {/* Rank Change */}
                {getRankChange(entry)}
              </div>
            )
          })}
        </div>

        {/* View All Link */}
        <button
          type="button"
          className="mt-4 w-full text-sm font-medium text-zinc-400 hover:text-white hover:underline transition-colors"
        >
          Voir le classement complet
        </button>
      </CardContent>
    </Card>
  )
}
