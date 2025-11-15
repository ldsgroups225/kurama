import { Card, CardContent } from '@/components/ui/card'
import { Flame, Star, TrendingUp, Trophy } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface GamificationSummaryProps {
  level: number
  totalXP: number
  achievementsUnlocked: number
  totalAchievements: number
  currentStreak: number
  weeklyRank?: number
  className?: string
}

export function GamificationSummary({
  level,
  totalXP,
  achievementsUnlocked,
  totalAchievements,
  currentStreak,
  weeklyRank,
  className,
}: GamificationSummaryProps) {
  const stats = [
    {
      icon: Star,
      label: 'Niveau',
      value: level.toString(),
      color: 'text-level',
      bgColor: 'bg-level',
    },
    {
      icon: Trophy,
      label: 'Badges',
      value: `${achievementsUnlocked}/${totalAchievements}`,
      color: 'text-xp',
      bgColor: 'bg-xp',
    },
    {
      icon: Flame,
      label: 'Série',
      value: `${currentStreak}j`,
      color: 'text-streak',
      bgColor: 'bg-streak',
    },
    ...(weeklyRank
      ? [
          {
            icon: TrendingUp,
            label: 'Rang',
            value: `#${weeklyRank}`,
            color: 'text-success',
            bgColor: 'bg-success',
          },
        ]
      : []),
  ]

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={generateUUID()}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    `
                      mb-2 flex h-10 w-10 items-center justify-center
                      rounded-full
                    `,
                    stat.bgColor,
                  )}
                >
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Total XP Display */}
        <div className="mt-4 border-t border-border pt-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Total XP</p>
          <p className="text-2xl font-bold text-primary">
            {totalXP.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
