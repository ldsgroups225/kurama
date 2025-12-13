import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, Trophy } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface StreakDay {
  date: Date
  completed: boolean
  count?: number
}

interface StreakCalendarProps {
  currentStreak: number
  longestStreak: number
  streakHistory: StreakDay[]
  className?: string
}

function getDayIndex(date: Date): number {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

function buildWeekGrids(streakHistory: StreakDay[]): (StreakDay | null)[][] {
  const today = new Date()
  const todayDayIndex = getDayIndex(today)

  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - todayDayIndex)
  currentWeekStart.setHours(0, 0, 0, 0)

  const lastWeekStart = new Date(currentWeekStart)
  lastWeekStart.setDate(currentWeekStart.getDate() - 7)

  const lastWeek: (StreakDay | null)[] = Array.from({ length: 7 }, () => null)
  const currentWeek: (StreakDay | null)[] = Array.from({ length: 7 }, () => null)

  for (const day of streakHistory) {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    const dayIndex = getDayIndex(dayDate)

    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6)

    if (dayDate >= lastWeekStart && dayDate <= lastWeekEnd) {
      lastWeek[dayIndex] = day
    }
    else if (dayDate >= currentWeekStart) {
      currentWeek[dayIndex] = day
    }
  }

  return [lastWeek, currentWeek]
}

export function StreakCalendar({
  currentStreak,
  longestStreak,
  streakHistory,
  className,
}: StreakCalendarProps) {
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const weekGrids = buildWeekGrids(streakHistory)

  return (
    <Card className={cn('overflow-hidden border-border bg-card backdrop-blur-xl', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Fire Glow Base */}
              <div className={`absolute inset-0 rounded-full blur-[20px] ${currentStreak > 0 ? 'bg-orange-600/50' : 'bg-transparent'}`} />

              <div className={`
                relative z-10
                flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl
                transition-all duration-500
                ${currentStreak > 0
      ? 'bg-linear-to-br from-orange-500 to-red-600 border border-orange-400/50'
      : 'bg-muted/50 border border-border'}
                `}
              >
                <Flame className={cn(
                  'h-7 w-7 transition-all duration-500',
                  currentStreak > 0 ? 'text-white fill-white/20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : 'text-muted-foreground',
                )}
                />
              </div>

              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-orange-500 shadow-sm animate-bounce">
                  <span className="text-[10px] role='img'">🔥</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-foreground tracking-tight">{currentStreak}</h3>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Jours</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {currentStreak > 0 ? 'Série active !' : 'Série inactive'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Badge variant="outline" className="gap-1.5 border-yellow-500/20 bg-yellow-500/5 text-yellow-500 px-3 py-1 mb-1">
              <Trophy className="h-3 w-3" />
              <span className="font-bold">
                Record:
                {longestStreak}
              </span>
            </Badge>
            <span className="text-[10px] text-muted-foreground font-medium">Continuez comme ça !</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map(day => (
              <div
                key={`weekday-${generateUUID()}`}
                className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {weekGrids.map(week => (
            <div key={`week-${generateUUID()}`} className="grid grid-cols-7 gap-3">
              {week.map((day) => {
                const dayDate = day ? new Date(day.date) : null
                const isToday = dayDate?.toDateString() === new Date().toDateString()
                const isCompleted = day?.completed ?? false

                // Determine if this logic day is in the future for current week (simple approximation)
                // In a real app we'd compare dates properly, here assuming filled array structure

                return (
                  <div
                    key={`day-${generateUUID()}`}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-xl transition-all duration-300 group',
                      isCompleted
                        ? 'bg-linear-to-br from-orange-400 to-red-600 shadow-[0_4px_12px_rgba(234,88,12,0.3)] scale-100'
                        : 'bg-muted border border-border shadow-inner',
                      isToday && !isCompleted && 'ring-2 ring-orange-500/50 ring-offset-2 ring-offset-black animate-pulse',
                      !isCompleted && !isToday && 'opacity-80',
                    )}
                  >
                    {isCompleted
                      ? (
                          <Flame className="h-4 w-4 text-white fill-white/20 drop-shadow-md" />
                        )
                      : (
                          isToday
                            ? (
                                <div className="h-2 w-2 rounded-full bg-orange-500/50" />
                              )
                            : (
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 group-hover:bg-muted-foreground transition-colors" />
                              )
                        )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
