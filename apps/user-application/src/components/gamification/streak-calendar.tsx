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

/**
 * Get the day of week index (0 = Monday, 6 = Sunday)
 * JavaScript's getDay() returns 0 for Sunday, so we convert it
 */
function getDayIndex(date: Date): number {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Build a 2-week grid where:
 * - Top row = last week (Mon-Sun)
 * - Bottom row = current week (Mon-Sun)
 * Each cell is either a StreakDay or null (empty placeholder)
 */
function buildWeekGrids(streakHistory: StreakDay[]): (StreakDay | null)[][] {
  const today = new Date()
  const todayDayIndex = getDayIndex(today)

  // Calculate the start of current week (Monday)
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - todayDayIndex)
  currentWeekStart.setHours(0, 0, 0, 0)

  // Calculate the start of last week (Monday)
  const lastWeekStart = new Date(currentWeekStart)
  lastWeekStart.setDate(currentWeekStart.getDate() - 7)

  // Initialize both weeks with nulls
  const lastWeek: (StreakDay | null)[] = Array.from({ length: 7 }, () => null)
  const currentWeek: (StreakDay | null)[] = Array.from({ length: 7 }, () => null)

  // Place each streak day in the correct position
  for (const day of streakHistory) {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    const dayIndex = getDayIndex(dayDate)

    // Check if day belongs to last week
    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6)

    if (dayDate >= lastWeekStart && dayDate <= lastWeekEnd) {
      lastWeek[dayIndex] = day
    }
    // Check if day belongs to current week
    else if (dayDate >= currentWeekStart) {
      currentWeek[dayIndex] = day
    }
  }

  // Return: top row = last week, bottom row = current week
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
    <Card className={cn('overflow-hidden py-0', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-streak flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentStreak}</h3>
              <p className="text-sm text-muted-foreground">
                {currentStreak > 0 ? 'jours de série' : 'Commencez une série'}
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Record:
            {' '}
            {longestStreak}
            j
          </Badge>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3">
          {/* Week day labels */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div
                key={`weekday-${generateUUID()}`}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week rows: top = last week, bottom = current week */}
          {weekGrids.map(week => (
            <div key={`week-${generateUUID()}`} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const isToday = day?.date.toDateString() === new Date().toDateString()
                const isCompleted = day?.completed ?? false

                return (
                  <div
                    key={`day-${generateUUID()}-${generateUUID()}`}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-lg transition-all',
                      isCompleted
                        ? 'bg-gradient-streak shadow-md'
                        : 'bg-muted',
                      isToday && 'ring-2 ring-primary ring-offset-2',
                    )}
                  >
                    {isCompleted
                      ? (
                        <Flame className="h-4 w-4 text-white" />
                      )
                      : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                      )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Motivation Message */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <p className="text-center text-xs text-muted-foreground">
            {currentStreak === 0 && 'Étudiez aujourd\'hui pour commencer une série ! 🎯'}
            {currentStreak > 0 && currentStreak < 7 && 'Continuez comme ça ! Vous êtes sur la bonne voie 🚀'}
            {currentStreak >= 7 && currentStreak < 30 && 'Incroyable ! Vous êtes en feu ! 🔥'}
            {currentStreak >= 30 && 'Vous êtes une légende ! 🏆'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
