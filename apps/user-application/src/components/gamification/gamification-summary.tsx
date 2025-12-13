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
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      glow: 'shadow-[0_0_15px_rgba(250,204,21,0.15)]',
    },
    {
      icon: Trophy,
      label: 'Badges',
      value: `${achievementsUnlocked}/${totalAchievements}`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    },
    {
      icon: Flame,
      label: 'Série',
      value: `${currentStreak}`,
      subValue: 'jours',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    },
  ]

  if (weeklyRank) {
    stats.push({
      icon: TrendingUp,
      label: 'Rang',
      value: `#${weeklyRank}`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    })
  }

  return (
    <Card className={cn('overflow-hidden border-white/5 bg-zinc-900/40 backdrop-blur-xl', className)}>
      <CardContent className="p-4">
        <div className={cn('grid gap-3', weeklyRank ? 'grid-cols-4' : 'grid-cols-3')}>
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={generateUUID()}
                className="group flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-white/5 cursor-default"
              >
                <div
                  className={cn(
                    `
                      mb-2 flex h-10 w-10 items-center justify-center
                      rounded-xl border transition-all duration-300 group-hover:scale-110
                    `,
                    stat.bgColor,
                    stat.borderColor,
                    stat.color,
                    stat.glow,
                  )}
                >
                  <Icon className="h-5 w-5 fill-current/20" />
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                  {stat.subValue && <span className="text-[10px] text-zinc-500 font-medium">{stat.subValue}</span>}
                </div>

                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Total XP Display - Progress Bar Style */}
        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-medium text-zinc-400">Progression XP</p>
            <p className="text-sm font-bold text-white">
              {totalXP.toLocaleString()}
              {' '}
              <span className="text-xs text-zinc-600 font-normal">XP</span>
            </p>
          </div>

          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500 w-3/4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
