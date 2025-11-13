import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDay {
  date: Date;
  completed: boolean;
  count?: number;
}

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  streakHistory: StreakDay[];
  className?: string;
}

export function StreakCalendar({
  currentStreak,
  longestStreak,
  streakHistory,
  className
}: StreakCalendarProps) {
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  // Get last 14 days for display
  const displayDays = streakHistory.slice(-14);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentStreak}</h3>
              <p className="text-sm text-muted-foreground">
                {currentStreak > 0 ? "jours de série" : "Commencez une série"}
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Record: {longestStreak}j
          </Badge>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3">
          {/* Week day labels */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Streak days */}
          <div className="grid grid-cols-7 gap-2">
            {displayDays.map((day, i) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isCompleted = day.completed;

              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center transition-all",
                    isCompleted
                      ? "bg-linear-to-br from-orange-400 to-red-500 shadow-md"
                      : "bg-muted",
                    isToday && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {isCompleted ? (
                    <Flame
                      className={cn(
                        "h-4 w-4",
                        isCompleted ? "text-white" : "text-muted-foreground/30"
                      )}
                    />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation Message */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-center text-muted-foreground">
            {currentStreak === 0 && "Étudiez aujourd'hui pour commencer une série ! 🎯"}
            {currentStreak > 0 && currentStreak < 7 && "Continuez comme ça ! Vous êtes sur la bonne voie 🚀"}
            {currentStreak >= 7 && currentStreak < 30 && "Incroyable ! Vous êtes en feu ! 🔥"}
            {currentStreak >= 30 && "Vous êtes une légende ! 🏆"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
