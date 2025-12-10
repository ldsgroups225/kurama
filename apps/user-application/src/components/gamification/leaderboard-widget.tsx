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
        return <Trophy className="text-level h-5 w-5" />
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />
      case 3:
        return <Award className="text-streak h-5 w-5" />
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
        <Badge variant="secondary" className="bg-success text-success gap-1">
          <TrendingUp className="h-3 w-3" />
          +
          {change}
        </Badge>
      )
    }
    else if (change < 0) {
      return (
        <Badge variant="secondary" className="bg-error text-error gap-1">
          <TrendingDown className="h-3 w-3" />
          {change}
        </Badge>
      )
    }
    else {
      return (
        <Badge variant="secondary" className="gap-1">
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
    <Card className={cn('overflow-hidden py-0', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Badge variant="secondary">Cette semaine</Badge>
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
                  'flex items-center gap-3 rounded-xl p-3 transition-all',
                  isCurrentUser
                    ? 'bg-primary/10 ring-2 ring-primary/20'
                    : `
                      bg-muted/50
                      hover:bg-muted
                    `,
                )}
              >
                {/* Rank */}
                <div className="flex w-8 items-center justify-center">
                  {rankIcon || (
                    <span className="text-sm font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className={`
                    bg-primary/10 text-xs font-semibold text-primary
                  `}
                  >
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'truncate text-sm font-medium',
                    isCurrentUser ? 'text-primary' : 'text-foreground',
                  )}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(Vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.points.toLocaleString()}
                    {' '}
                    points
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
          className={`
            mt-4 w-full text-sm font-medium text-primary
            hover:underline
          `}
        >
          Voir le classement complet
        </button>
      </CardContent>
    </Card>
  )
}
