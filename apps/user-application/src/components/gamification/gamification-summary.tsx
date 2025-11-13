import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Star, TrendingUp } from "lucide-react";
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
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Trophy,
      label: "Badges",
      value: `${achievementsUnlocked}/${totalAchievements}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Flame,
      label: "Série",
      value: `${currentStreak}j`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    ...(weeklyRank
      ? [
        {
          icon: TrendingUp,
          label: "Rang",
          value: `#${weeklyRank}`,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
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
