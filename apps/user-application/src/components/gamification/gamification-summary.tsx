import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Star, TrendingUp } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface GamificationSummaryProps {
  level: number;
  totalXP: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  weeklyRank?: number;
  className?: string;
}

export function GamificationSummary({
  level,
  totalXP,
  achievementsUnlocked,
  totalAchievements,
  currentStreak,
  weeklyRank,
  className
}: GamificationSummaryProps) {
  const stats = [
    {
      icon: Star,
      label: "Niveau",
      value: level.toString(),
      color: "text-level",
      bgColor: "bg-level",
    },
    {
      icon: Trophy,
      label: "Badges",
      value: `${achievementsUnlocked}/${totalAchievements}`,
      color: "text-xp",
      bgColor: "bg-xp",
    },
    {
      icon: Flame,
      label: "Série",
      value: `${currentStreak}j`,
      color: "text-streak",
      bgColor: "bg-streak",
    },
    ...(weeklyRank
      ? [
        {
          icon: TrendingUp,
          label: "Rang",
          value: `#${weeklyRank}`,
          color: "text-success",
          bgColor: "bg-success",
        },
      ]
      : []),
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mb-2",
                    stat.bgColor
                  )}
                >
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Total XP Display */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Total XP</p>
          <p className="text-2xl font-bold text-primary">
            {totalXP.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
